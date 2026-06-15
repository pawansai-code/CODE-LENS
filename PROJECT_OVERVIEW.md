# AI CodeLens & Repo Chatter: Project Overview

Based on the Product Requirements Document (PRD), here is a comprehensive breakdown of the **AI CodeLens & Repo Chatter** platform.

### 1. Executive Summary & Product Vision
**AI CodeLens & Repo Chatter** is a **local-first, zero-cost developer productivity platform**. It is designed to act as an AI pair-programmer that runs entirely on your local machine (consumer hardware with GPUs like RTX 3060+).

The primary goals are:
*   **Zero API Costs:** No need to pay for GPT-4 or Claude APIs.
*   **100% Privacy & Compliance:** Since everything runs locally, no proprietary code ever leaves your machine, making it perfect for enterprise developers and NDA-bound projects.
*   **Deep Codebase Awareness:** It doesn't just answer generic coding questions; it ingests your entire GitHub repository and understands the specific context of your project.

### 2. Core Features (What it does)
The platform is packed with features tailored for understanding and interacting with codebases:
*   **Repository Ingestion:** You simply paste a GitHub HTTPS URL, and the system clones the repository locally (supporting repos up to 500 MB and 50,000 files). It even supports incremental re-ingestion so it only updates modified files.
*   **AST-Aware Code Chunking:** Instead of splitting code blindly, it understands the structure of 8 programming languages (Python, JS, TS, Java, Go, Ruby, C/C++, Rust) and splits code logically at function or class boundaries.
*   **Hybrid Semantic Search & Reranking:** It searches for answers using two methods simultaneously (Vector dense search + BM25 sparse search) and merges the results. It then uses a Cross-Encoder to rank the best code snippets to feed to the AI.
*   **Smart Intent Routing:** It automatically detects if your question is about a specific file or the entire repository and routes the query accordingly to save processing time and improve accuracy.
*   **Streaming Chat Interface:** A sleek React dashboard with a split-pane view. The left side shows your file tree and code, while the right side is the chat interface.
*   **Citation-Driven Code Highlighting:** When the AI explains a piece of code, it generates invisible citations. The frontend intercepts these and dynamically highlights the exact lines of code in the left pane as you read the response.
*   **Model Health Dashboard:** A built-in widget to monitor your VRAM usage, inference latency, and manage your local AI models.

### 3. Technology Stack (How it's built)
The application relies heavily on modern AI and web technologies. *Note: While the original PRD specified ChromaDB and SQLite, the target architecture has been upgraded to use Pinecone and PostgreSQL for learning purposes.*

**AI & LLM Infrastructure:**
*   **LLM Runtime:** Ollama (for running models locally with GPU offloading).
*   **Primary AI Model:** `qwen2.5-coder` (7B or 14B depending on hardware).
*   **Embeddings:** `nomic-embed-text` (via Ollama).
*   **Vector Database:** Pinecone (Upgraded from ChromaDB).
*   **Relational Database:** PostgreSQL (Upgraded from SQLite).
*   **Reranker:** `sentence-transformers cross-encoder` (ms-marco-MiniLM-L-6).
*   **Sparse Index:** `rank_bm25` (Pure-Python).

**Backend:**
*   **Framework:** FastAPI + Uvicorn (for async SSE streaming and API endpoints).
*   **Language & RAG:** Python 3.11+ using LangChain (specifically LCEL for composable routing).
*   **Git Integration:** GitPython for programmatic repository cloning.

**Frontend:**
*   **Framework:** React + Vite (for a fast, component-based split-pane architecture).
*   **Code Highlighting:** Prism.js (supports 150+ languages with line-number plugins).

### 4. Target Audience
*   **Hackathon Hackers:** Need to onboard to new repos quickly with zero budget.
*   **Enterprise Developers:** Need to navigate legacy codebases safely without leaking IP.
*   **Open-Source Contributors:** Need to understand sprawling file trees and project conventions before making a PR.
*   **Code Reviewers & CS Students:** Need a free tool to trace function calls, learn from production code, and lower the mental overhead of cross-file navigation.

### 5. Roadmap & Future Scope
The roadmap is broken down into 4 phases:
*   **Sprint 1 (MVP):** Getting the core pipeline (clone, embed, search, stream) and the React split-pane UI working.
*   **Sprint 2:** Adding incremental re-ingestion, hybrid search, and persistent chat history.
*   **Sprint 3 (Enterprise):** Supporting private repos via GitHub PAT, multi-repo switching, and unit tests.
*   **Sprint 4 (Ecosystem):** Building a VS Code extension for deeper IDE integration and adding multi-turn conversation memory.
