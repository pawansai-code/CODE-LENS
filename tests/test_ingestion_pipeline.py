import sys
import os
from pathlib import Path

# Add project root to sys.path so we can import ingestion
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from ingestion.loader import RepoLoader
from ingestion.parser import ASTParser
from ingestion.indexer import EmbeddingGenerator, VectorStoreWriter

def main():
    test_repo_url = "https://github.com/lighthouse-labs/todo-list-js-exercise.git"
    
    print("=== Phase 1: Ingestion Pipeline Test ===")
    
    loader = RepoLoader()
    print(f"1. Loading repository from {test_repo_url}...")
    try:
        repo_path = loader.load(test_repo_url)
        print(f"   Successfully cloned to {repo_path}")
        
        print("2. Parsing directory into chunks...")
        parser = ASTParser(chunk_size=500, chunk_overlap=50)
        chunks = parser.parse_directory(repo_path)
        print(f"   Generated {len(chunks)} CodeChunks.")
        
        print("3. Generating embeddings and writing to Vector DB...")
        embed_gen = EmbeddingGenerator(model_name="nomic-embed-text")
        writer = VectorStoreWriter(persist_dir="data/test_chroma_db", collection_name="test_collection")
        writer.clear_collection()
        count = writer.write(chunks, embed_gen.get_embeddings_model())
        print(f"   Successfully wrote {count} chunks to ChromaDB.")
        
        print("=== Test Completed Successfully ===")
        
    except Exception as e:
        print(f"Error during ingestion pipeline: {e}")
    finally:
        print("4. Cleaning up temporary repository...")
        loader.cleanup()
        print("   Cleanup complete.")

if __name__ == "__main__":
    main()
