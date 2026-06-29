import re
import time
from dataclasses import dataclass
from typing import List

from langchain_core.documents import Document
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.retrievers import BM25Retriever
from langchain_community.llms import Ollama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from sentence_transformers import CrossEncoder

from pinecone import Pinecone
from langchain_pinecone import PineconeVectorStore
from app.models.db import SessionLocal, CodeChunkModel

from ingestion.parser import CodeChunk

@dataclass
class Citation:
    file_path: str
    function_name: str
    start_line: int
    end_line: int
    chunk_id: str

@dataclass
class QueryResult:
    answer: str
    citations: List[Citation]
    retrieved_chunks: List[CodeChunk]
    expanded_chunks: List[CodeChunk]
    token_count_used: int
    faithfulness_score: float
    relevance_score: float
    latency_ms: int

class QueryProcessor:
    def __init__(self, index_name: str = "code-lens"):
        print("[INFO] Loading Query Engine components...")
        self.index_name = index_name
        self.embeddings = OllamaEmbeddings(model="nomic-embed-text")
        
        # 1. Connect to Pinecone
        import os
        from pinecone import Pinecone, ServerlessSpec
        
        self.pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
        
        # Ensure Pinecone index exists before trying to query it
        if self.index_name not in [idx.name for idx in self.pc.list_indexes()]:
            print(f"[INFO] Creating Pinecone index '{self.index_name}'...")
            self.pc.create_index(
                name=self.index_name,
                dimension=768,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1")
            )
            
        self.vectorstore = PineconeVectorStore(
            index_name=self.index_name,
            embedding=self.embeddings
        )
        self.dense_retriever = self.vectorstore.as_retriever(search_kwargs={"k": 20})
        
        # 2. Build BM25 Sparse Index from PostgreSQL
        print("[INFO] Reconstructing documents for BM25 from PostgreSQL...")
        self._build_bm25_from_db()
        
    def _build_bm25_from_db(self):
        try:
            session = SessionLocal()
            db_chunks = session.query(CodeChunkModel).all()
            documents = []
            for chunk in db_chunks:
                meta = {
                    "chunk_id": chunk.id,
                    "file_path": chunk.file_path,
                    "name": chunk.name,
                    "start_line": chunk.start_line,
                    "end_line": chunk.end_line
                }
                documents.append(Document(page_content=chunk.source_code, metadata=meta))
            session.close()
            
            if documents:
                self.bm25_retriever = BM25Retriever.from_documents(documents)
                self.bm25_retriever.k = 20
                print(f"[INFO] Built BM25 index with {len(documents)} chunks.")
            else:
                self.bm25_retriever = None
                print("[WARNING] Database empty, BM25 not initialized.")
        except Exception as e:
            print(f"[ERROR] Loading documents for BM25: {e}")
            self.bm25_retriever = None
            
        # 3. Load Cross-Encoder
        print("Loading Cross-Encoder model (ms-marco-MiniLM-L-6-v2)...")
        self.cross_encoder = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
        
        # 4. Load LLM and Prompt Template
        print("Loading Local LLM (qwen2.5-coder:1.5b)...")
        self.llm = Ollama(model="qwen2.5-coder:1.5b", temperature=0.0)
        
        system_template = """
You are an expert AI coding assistant for the CodeLens platform.
You will be provided with a user's question and a set of strictly retrieved code snippets from the codebase.

CRITICAL INSTRUCTIONS:
1. Answer the user's question using ONLY the provided code snippets. Do not guess or hallucinate.
2. If the answer is not contained in the context, you MUST say exactly: "I cannot answer this based on the provided codebase."
3. Think step-by-step before answering.
4. When you reference code, you MUST cite the file name clearly (e.g., "In `file_path.py`:").

Context Code Snippets:
{context}

User Question: {question}
"""
        self.prompt = ChatPromptTemplate.from_template(system_template)
        print("Query Engine Ready!")
        
    def reload_db(self):
        """Re-initializes the vector database and BM25 index after new ingestion."""
        print("[INFO] Reloading database...")
        self.vectorstore = PineconeVectorStore(
            index_name=self.index_name,
            embedding=self.embeddings
        )
        self.dense_retriever = self.vectorstore.as_retriever(search_kwargs={"k": 20})
        self._build_bm25_from_db()

    def _reciprocal_rank_fusion(self, results_list, k=60):
        fused_scores = {}
        for docs in results_list:
            for rank, doc in enumerate(docs):
                doc_str = doc.page_content
                if doc_str not in fused_scores:
                    fused_scores[doc_str] = {"doc": doc, "score": 0}
                fused_scores[doc_str]["score"] += 1 / (rank + k)
                
        reranked_results = [
            item["doc"] for item in sorted(fused_scores.values(), key=lambda x: x["score"], reverse=True)
        ]
        return reranked_results
        
    def _rerank_documents(self, query: str, documents: list, top_k: int = 5):
        if not documents:
            return []
            
        pairs = [[query, doc.page_content] for doc in documents]
        scores = self.cross_encoder.predict(pairs)
        
        scored_docs = list(zip(documents, scores))
        scored_docs.sort(key=lambda x: x[1], reverse=True)
        
        return [doc for doc, score in scored_docs[:top_k]]
        
    def retrieve(self, query: str, k: int = 5) -> List[CodeChunk]:
        """Embeds query, runs Hybrid search (Dense+Sparse), RRF fusion, and Cross-Encoder reranking."""
        # Intent Router
        file_path_match = re.search(r'([a-zA-Z0-9_\-\./]+\.(?:py|js|ts|jsx|tsx|md))', query)
        
        if file_path_match:
            target_file = file_path_match.group(1)
            print(f"--> [Intent Router]: Detected targeted file query for '{target_file}'")
            candidate_docs = self.dense_retriever.invoke(query)
            filtered_docs = [d for d in candidate_docs if target_file in d.metadata.get('source', '') or target_file in d.metadata.get('file_path', '')]
            final_docs = filtered_docs[:k] if filtered_docs else candidate_docs[:k]
        else:
            print("--> [Intent Router]: Detected global query. Running Hybrid Search + Reranking...")
            dense_docs = self.dense_retriever.invoke(query)
            sparse_docs = self.bm25_retriever.invoke(query) if self.bm25_retriever else []
            
            fused_docs = self._reciprocal_rank_fusion([dense_docs, sparse_docs])
            candidate_docs = fused_docs[:20]
            
            final_docs = self._rerank_documents(query, candidate_docs, top_k=k)
            
        # Map Langchain Documents to CodeChunks
        chunks = []
        for doc in final_docs:
            meta = doc.metadata
            chunk = CodeChunk(
                chunk_id=meta.get("chunk_id", ""),
                chunk_type=meta.get("chunk_type", ""),
                name=meta.get("name", ""),
                qualified_name=meta.get("qualified_name", ""),
                file_path=meta.get("file_path", ""),
                start_line=meta.get("start_line", 0),
                end_line=meta.get("end_line", 0),
                source_code=doc.page_content,
                docstring=None,
                parent_class=None,
                decorators=[],
                complexity_score=meta.get("complexity_score", 0),
                token_count=meta.get("token_count", 0)
            )
            chunks.append(chunk)
            
        return chunks
        
    def expand_with_graph(self, chunks: List[CodeChunk]) -> List[CodeChunk]:
        """For each chunk, fetches 1-hop neighbors from graph store. Deduplicates against primary list."""
        # Stub for graph expansion
        return chunks
        
    def assemble_context(self, chunks: List[CodeChunk]) -> str:
        """Formats chunks as context string with citation markers. Keeps context window small."""
        context_texts = []
        
        for i, c in enumerate(chunks):
            # Only append the precise snippet to avoid overflowing the 1.5b model's context window
            context_texts.append(f"--- Snippet {i+1} from File: {c.file_path} (Lines {c.start_line}-{c.end_line}) ---\n{c.source_code}")
                
        return "\n\n".join(context_texts)
        
    def generate(self, query: str, context: str, history: List = None) -> str:
        """Calls LLM with system prompt + context + query. Returns raw answer."""
        chain = self.prompt | self.llm | StrOutputParser()
        answer = chain.invoke({"context": context, "question": query})
        return answer
        
    def query(self, question: str) -> QueryResult:
        """Orchestrates the full pipeline."""
        start_time = time.time()
        
        # 1. Retrieve
        retrieved_chunks = self.retrieve(question, k=5)
        
        # 2. Expand (stub)
        expanded_chunks = self.expand_with_graph(retrieved_chunks)
        
        # 3. Assemble
        context = self.assemble_context(expanded_chunks)
        
        # 4. Generate
        answer = self.generate(question, context)
        
        end_time = time.time()
        latency_ms = int((end_time - start_time) * 1000)
        
        # Calculate tokens used (rough estimate)
        token_count = sum([c.token_count for c in expanded_chunks])
        
        # Generate citations
        citations = []
        for c in expanded_chunks:
            citations.append(Citation(
                file_path=c.file_path,
                function_name=c.name,
                start_line=c.start_line,
                end_line=c.end_line,
                chunk_id=c.chunk_id
            ))
            
        return QueryResult(
            answer=answer,
            citations=citations,
            retrieved_chunks=retrieved_chunks,
            expanded_chunks=expanded_chunks,
            token_count_used=token_count,
            faithfulness_score=0.95, # Mock until Ragas is integrated
            relevance_score=0.92, # Mock
            latency_ms=latency_ms
        )
