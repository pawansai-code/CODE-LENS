import shutil
import os
from typing import List, Tuple
from pathlib import Path

from langchain_core.documents import Document
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Chroma

from .parser import CodeChunk

from pinecone import Pinecone, ServerlessSpec
from langchain_pinecone import PineconeVectorStore
from app.models.db import SessionLocal, CodeChunkModel

class EmbeddingGenerator:
    def __init__(self, model_name: str = "nomic-embed-text"):
        self.model_name = model_name
        self.embeddings = OllamaEmbeddings(model=self.model_name)
        
    def get_embeddings_model(self):
        """Returns the configured Ollama embeddings model."""
        return self.embeddings

class VectorStoreWriter:
    def __init__(self, persist_dir: str = "", collection_name: str = "code-lens"):
        self.index_name = collection_name
        self.pc = Pinecone(api_key=os.environ.get("PINECONE_API_KEY"))
        
        # Ensure Pinecone index exists
        if self.index_name not in [idx.name for idx in self.pc.list_indexes()]:
            print(f"[INFO] Creating Pinecone index '{self.index_name}'...")
            self.pc.create_index(
                name=self.index_name,
                dimension=768, # Dimension for nomic-embed-text
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1")
            )
        
    def write(self, chunks: List[CodeChunk], embeddings_model) -> int:
        """Upserts chunks into Pinecone and Postgres."""
        
        # 1. Write metadata and raw source code to PostgreSQL
        print("[INFO] Saving repository data to PostgreSQL...")
        session = SessionLocal()
        try:
            # For this simple implementation, clear the old chunks from Postgres
            session.query(CodeChunkModel).delete()
            
            db_chunks = []
            for chunk in chunks:
                db_chunks.append(CodeChunkModel(
                    id=str(chunk.chunk_id),
                    repo_url="local-repo", # Can be enhanced to track real repo URL
                    file_path=str(chunk.file_path),
                    chunk_type=str(chunk.chunk_type),
                    name=str(chunk.name),
                    qualified_name=str(chunk.qualified_name),
                    start_line=int(chunk.start_line),
                    end_line=int(chunk.end_line),
                    source_code=str(chunk.source_code),
                    complexity_score=int(chunk.complexity_score),
                    token_count=int(chunk.token_count)
                ))
            session.add_all(db_chunks)
            session.commit()
            print("[INFO] PostgreSQL save complete.")
        except Exception as e:
            session.rollback()
            print(f"[ERROR] Failed to save to PostgreSQL: {e}")
        finally:
            session.close()

        # 2. Write Vectors to Pinecone
        print(f"[INFO] Generating embeddings and upserting into Pinecone...")
        documents = []
        for chunk in chunks:
            # We only store chunk_id in Pinecone to link it back to Postgres!
            metadata = {
                "chunk_id": str(chunk.chunk_id),
                "file_path": str(chunk.file_path)
            }
            # Page content is needed for Pinecone to generate embeddings
            doc = Document(page_content=chunk.source_code, metadata=metadata)
            documents.append(doc)
            
        vectorstore = PineconeVectorStore.from_documents(
            documents=documents,
            embedding=embeddings_model,
            index_name=self.index_name
        )
        print("[INFO] Pinecone upsert complete.")
        return len(documents)
        
    def clear_collection(self):
        """Clears vectors from Pinecone."""
        try:
            index = self.pc.Index(self.index_name)
            index.delete(delete_all=True)
            print("[INFO] Cleared existing vectors in Pinecone.")
        except Exception as e:
            print(f"[WARNING] Could not clear Pinecone index: {e}")
