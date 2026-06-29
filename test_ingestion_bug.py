import sys
from pathlib import Path

project_root = Path(__file__).parent
sys.path.append(str(project_root))

from ingestion.loader import RepoLoader
from ingestion.parser import ASTParser

def test_ingestion():
    loader = RepoLoader()
    repo_path = loader.load("https://github.com/lighthouse-labs/todo-list-js-exercise.git")
    print(f"Cloned to {repo_path}")
    
    parser = ASTParser()
    try:
        chunks = parser.parse_directory(repo_path)
        print(f"Parsed {len(chunks)} chunks")
    except Exception as e:
        print(f"Parser error: {e}")
        import traceback
        traceback.print_exc()
        
    loader.cleanup()
    print("Done")

if __name__ == "__main__":
    test_ingestion()
