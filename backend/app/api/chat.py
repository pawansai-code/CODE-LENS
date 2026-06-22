# pyrefly: ignore [missing-import]
from fastapi import APIRouter
import sys
from pathlib import Path

# Ensure the root folder is in the Python path so we can import from query.engine
project_root = Path(__file__).parent.parent.parent.parent
if str(project_root) not in sys.path:
    sys.path.append(str(project_root))

# pyrefly: ignore [missing-import]
from app.models.schemas import ChatRequest, ChatResponse, Telemetry, ChunkContext
# pyrefly: ignore [missing-import]
from query.engine import QueryProcessor

router = APIRouter()

# Instantiate globally to avoid cold starts on every API call.
# Connects to the test ChromaDB populated during Phase 1 testing.
try:
    db_path = str(project_root / "data" / "test_chroma_db")
    engine = QueryProcessor(persist_directory=db_path, collection_name="test_collection")
except Exception as e:
    print(f"Warning: Engine failed to initialize. Error: {e}")
    engine = None

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not engine:
        return ChatResponse(
            answer="Error: The RAG Query Engine is not currently initialized.",
            telemetry=Telemetry(token_count=0, faithfulness=0, relevance=0, latency_ms=0, retrieved_chunks=[])
        )
        
    result = engine.query(request.query)
    
    retrieved = []
    for chunk in result.expanded_chunks:
        retrieved.append(ChunkContext(
            name=chunk.qualified_name,
            content=chunk.source_code
        ))
        
    telemetry = Telemetry(
        token_count=result.token_count_used,
        faithfulness=result.faithfulness_score,
        relevance=result.relevance_score,
        latency_ms=result.latency_ms,
        retrieved_chunks=retrieved
    )
    
    return ChatResponse(
        answer=result.answer,
        telemetry=telemetry
    )
