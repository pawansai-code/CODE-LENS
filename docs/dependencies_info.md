# Code-Lens Dependencies Overview

This document provides a breakdown of all major dependencies used in the project, their purpose, and where they are utilized within the codebase.

## Backend (Python / FastAPI)

| Dependency | Description | Usage Location |
| :--- | :--- | :--- |
| **FastAPI** | High-performance web framework for building APIs. | `backend/app/main.py`, `backend/app/api/*.py` |
| **Uvicorn** | ASGI web server implementation for Python to run FastAPI. | Used via CLI to serve the application. |
| **LangChain** | Framework for developing applications powered by LLMs. | `backend/app/services/retrieval.py`, `backend/app/core/llm.py` |
| **LangChain Community** | Community-maintained third-party integrations for LangChain. | Throughout services utilizing specific tools/parsers. |
| **ChromaDB** | AI-native open-source vector database. | `backend/app/services/vector_db.py` |
| **GitPython** | Python library used to interact with Git repositories. | `backend/app/services/ingestion.py` (Repo cloning) |
| **Sentence-Transformers** | Framework for state-of-the-art text and image embeddings. | `backend/app/services/reranker.py` (Cross-encoder reranking) |
| **Rank_BM25** | Algorithms for computing BM25 (sparse index/keyword search). | `backend/app/services/retrieval.py` (Hybrid search) |
| **Pydantic** | Data validation using Python type annotations. | `backend/app/models/schemas.py` |
| **Pydantic Settings** | Settings management using Pydantic validation. | `backend/app/core/config.py` |
| **Python-Dotenv** | Reads key-value pairs from a `.env` file into environment variables. | Application startup / settings resolution. |

---

## Frontend (React / Vite)

| Dependency | Description | Usage Location |
| :--- | :--- | :--- |
| **React & React-DOM** | Library for building user interfaces. | `frontend/src/main.tsx`, `frontend/src/App.tsx` |
| **Vite** | Next-generation frontend tooling and bundler. | `frontend/vite.config.ts` |
| **TypeScript** | Strongly typed programming language that builds on JavaScript. | Throughout all `.ts` and `.tsx` files. |
| **TailwindCSS** | Utility-first CSS framework for rapid UI development. | `frontend/src/index.css` and via `className` in components. |
| **React-Split-Pane** | React component that provides resizable split panes. | `frontend/src/App.tsx` (Dashboard layout) |
| **Lucide-React** | Beautiful & consistent icon toolkit. | `frontend/src/App.tsx` (UI Icons) |
| **PrismJS** | Lightweight, robust, and elegant syntax highlighter. | Planned for `frontend/src/components/CodeViewer.tsx` |
| **React-Simple-Code-Editor** | Simple text editor with syntax highlighting support. | Planned for `frontend/src/components/CodeViewer.tsx` |
