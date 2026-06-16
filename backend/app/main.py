from fastapi import FastAPI
from app.api import chat
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Code-Lens API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Code-Lens API"}
