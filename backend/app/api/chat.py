from fastapi import APIRouter
from app.models.schemas import ChatRequest

router = APIRouter()

@router.post("/")
async def chat_endpoint(request: ChatRequest):
    return {"message": "Chat endpoint placeholder"}
