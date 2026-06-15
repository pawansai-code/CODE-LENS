from dataclasses import dataclass
from typing import List
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
    def __init__(self):
        pass
        
    def retrieve(self, query: str, k: int = 5) -> List[CodeChunk]:
        """Embeds query, runs ChromaDB similarity search, returns top-k CodeChunk objects."""
        pass
        
    def expand_with_graph(self, chunks: List[CodeChunk]) -> List[CodeChunk]:
        """For each chunk, fetches 1-hop neighbors from graph store. Deduplicates against primary list."""
        pass
        
    def assemble_context(self, chunks: List[CodeChunk]) -> str:
        """Formats chunks as context string with citation markers. Enforces 8K token budget."""
        pass
        
    def generate(self, query: str, context: str, history: List) -> str:
        """Calls LLM with system prompt + context + conversation history + query. Returns raw answer."""
        pass
        
    def query(self, question: str) -> QueryResult:
        """Orchestrates the full pipeline: retrieve -> expand -> assemble -> generate -> evaluate. Returns QueryResult."""
        pass
