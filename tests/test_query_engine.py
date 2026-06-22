import sys
from pathlib import Path

# Add project root to sys.path so we can import query
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from query.engine import QueryProcessor

def main():
    print("=== Phase 2: RAG Engine Test ===")
    
    # 1. Initialize the engine
    try:
        engine = QueryProcessor(persist_directory="data/test_chroma_db", collection_name="test_collection")
    except Exception as e:
        print(f"Failed to initialize QueryProcessor: {e}")
        return

    # 2. Test Global Semantic Query
    print("\n--- TEST 1: Global Semantic Query ---")
    query1 = "How are tasks marked as complete?"
    try:
        result1 = engine.query(query1)
        print(f"Query: {query1}")
        print(f"Latency: {result1.latency_ms}ms")
        print(f"Retrieved Chunks: {len(result1.retrieved_chunks)}")
        for i, chunk in enumerate(result1.retrieved_chunks):
            print(f"  [{i+1}] {chunk.file_path}")
        print(f"AI Answer:\n{result1.answer}")
    except Exception as e:
        print(f"Test 1 Failed: {e}")

    # 3. Test Targeted File Query
    print("\n--- TEST 2: Targeted File Query ---")
    query2 = "What does the index.js file do?"
    try:
        result2 = engine.query(query2)
        print(f"Query: {query2}")
        print(f"Latency: {result2.latency_ms}ms")
        print(f"Retrieved Chunks: {len(result2.retrieved_chunks)}")
        for i, chunk in enumerate(result2.retrieved_chunks):
            print(f"  [{i+1}] {chunk.file_path}")
        print(f"AI Answer:\n{result2.answer}")
    except Exception as e:
        print(f"Test 2 Failed: {e}")

if __name__ == "__main__":
    main()
