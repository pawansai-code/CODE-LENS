# 🔍 AI CodeLens & Repo Chatter
> Ask your codebase questions in plain English. Get answers with exact file and line citations, powered by local LLMs.

## What it does
AI CodeLens & Repo Chatter lets you query any GitHub repository using natural language. It parses code using AST, retrieves context-aware answers using Pinecone, and streams responses directly to a split-pane dashboard with line-level highlights.

## Tech Stack
- **Vector Store** - Pinecone
- **Relational DB** - PostgreSQL
- **Orchestration** - LangChain (LCEL)
- **LLM** - Ollama (`qwen2.5-coder`)
- **Backend** - FastAPI + Python
- **UI** - React + Vite

## Quick Start
```bash
git clone https://github.com/yourusername/codelens-rag.git
cd codelens-rag
pip install -r requirements.txt

# Launch Backend
uvicorn main:app --reload

# Launch UI
cd ui && npm install && npm run dev
```

## Example Questions
- *"Where is the authentication logic?"*
- *"What functions call the database connection?"*
- *"What breaks if I change the User model?"*

## Project Structure

codelens-rag/
├── ingestion/    # AST parser, repo cloning, embeddings
├── query/        # Retrieval, LCEL routing, LLM caller
├── evaluation/   # Evaluation scripts
├── ui/           # React dashboard
└── config.yaml   # Configuration parameters

---
Built during internship · Pawan sai G · [www.linkedin.com/in/pawansai-g](#)
