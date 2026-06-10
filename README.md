# 🔍 CodeLens RAG
> Ask your Python codebase questions in plain English. Get answers with exact file and line citations.

## What it does
CodeLens RAG lets you query any Python repository using natural language. Unlike simple chatbots, it parses code using AST (not token splits), builds a function dependency graph, and retrieves context-aware answers — so you get real citations, not hallucinations.

## Tech Stack
- **Chunking** — Python `ast` module (structure-aware, not token-based)
- **Vector Store** — ChromaDB
- **Orchestration** — LangChain
- **LLM** — Claude Sonnet / GPT-4o
- **UI** — Streamlit
- **Evaluation** — RAGAS

## Quick Start
```bash
git clone https://github.com/yourusername/codelens-rag.git
cd codelens-rag
pip install -r requirements.txt
cp .env.example .env          # add your API key

# Ingest a repo
python -m ingestion.run --source https://github.com/tiangolo/fastapi

# Launch UI
streamlit run ui/app.py
```

## Example Questions
- *"Where is the authentication logic?"*
- *"What functions call the database connection?"*
- *"What breaks if I change the User model?"*

## Project Structure

codelens-rag/
├── ingestion/    # AST parser, graph builder, embedder
├── query/        # Retrieval, context assembly, LLM caller
├── evaluation/   # RAGAS scoring
├── ui/           # Streamlit chat interface
├── data/         # Auto-created: chroma_store/, graph.json
└── config.yaml   # All tunable parameters


## Limitations
- Python repos only (v1)
- Requires outbound internet for LLM API calls

---
Built during internship · [Pawan sai G] · [www.linkedin.com/in/pawansai-g](#)
