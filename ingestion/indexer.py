from typing import List, Tuple
from .parser import CodeChunk

class EmbeddingGenerator:
    def __init__(self, model_name: str, batch_size: int = 50):
        self.model_name = model_name
        self.batch_size = batch_size
        
    def embed_chunks(self, chunks: List[CodeChunk]) -> List[Tuple[CodeChunk, List[float]]]:
        """Batches chunks (size 50), calls embedding API, returns chunk + vector pairs."""
        pass
        
    def _build_embed_text(self, chunk: CodeChunk) -> str:
        """Constructs embedding input: qualified_name + docstring + source_code. Truncates to 512 tokens."""
        pass
        
    def _call_api(self, texts: List[str]) -> List[List[float]]:
        """Calls OpenAI embeddings endpoint. Retries up to 3 times with exponential backoff."""
        pass

class VectorStoreWriter:
    def __init__(self, persist_dir: str):
        self.persist_dir = persist_dir
        
    def write(self, chunks_with_embeddings: List[Tuple[CodeChunk, List[float]]]) -> int:
        """Upserts chunks into ChromaDB collection. Returns count of written documents."""
        pass
        
    def _build_metadata(self, chunk: CodeChunk) -> dict:
        """Extracts flat metadata dict from CodeChunk for ChromaDB storage."""
        pass
        
    def clear_collection(self):
        """Deletes and recreates the ChromaDB collection. Used when re-ingesting a repo."""
        pass
