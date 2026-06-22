import uuid
import os
import mimetypes
from dataclasses import dataclass
from typing import List, Optional
from pathlib import Path

# pyrefly: ignore [missing-import]
import radon.complexity as radon_cc
# pyrefly: ignore [missing-import]
import tiktoken

# pyrefly: ignore [missing-import]
from langchain_text_splitters import Language, RecursiveCharacterTextSplitter
# pyrefly: ignore [missing-import]
from langchain_core.documents import Document

@dataclass
class CodeChunk:
    chunk_id: str
    chunk_type: str
    name: str
    qualified_name: str
    file_path: str
    start_line: int
    end_line: int
    source_code: str
    docstring: Optional[str]
    parent_class: Optional[str]
    decorators: List[str]
    complexity_score: int
    token_count: int

BLACKLIST_DIRS = {".git", "node_modules", "venv", ".venv", "__pycache__", ".idea", ".vscode", "build", "dist", "target", "out"}
MAX_FILE_SIZE_BYTES = 1_000_000  # 1MB

EXTENSION_TO_LANGUAGE = {
    ".py": Language.PYTHON,
    ".js": Language.JS,
    ".ts": Language.TS,
    ".java": Language.JAVA,
    ".cpp": Language.CPP,
    ".c": Language.C,
    ".go": Language.GO,
    ".rs": Language.RUST,
    ".rb": Language.RUBY,
    ".php": Language.PHP,
    ".md": Language.MARKDOWN,
    ".html": Language.HTML
}

class ASTParser:
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.encoder = tiktoken.get_encoding("cl100k_base")
        
    def _is_binary(self, file_path: str) -> bool:
        """Check for null bytes in the first 1024 bytes to determine if binary."""
        try:
            with open(file_path, 'rb') as f:
                chunk = f.read(1024)
                if b'\x00' in chunk:
                    return True
        except Exception:
            return True # If unreadable, treat as binary/skip
        return False

    def parse_directory(self, root_path: Path) -> List[CodeChunk]:
        """Dynamically walks directory, applying safety checks and optimal splitting per language."""
        code_chunks = []
        
        for dirpath, dirnames, filenames in os.walk(root_path):
            # Prune blacklisted directories in-place so os.walk doesn't traverse them
            dirnames[:] = [d for d in dirnames if d not in BLACKLIST_DIRS]
            
            for filename in filenames:
                file_path = os.path.join(dirpath, filename)
                
                # 1. Size Check
                if os.path.getsize(file_path) > MAX_FILE_SIZE_BYTES:
                    continue
                    
                # 2. Binary / Null Byte Check
                if self._is_binary(file_path):
                    continue
                    
                # Safe to read as text
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        source_code = f.read()
                except UnicodeDecodeError:
                    continue # Skip if not UTF-8 decodable
                
                # Compute relative path for cleaner metadata
                rel_path = os.path.relpath(file_path, root_path)
                ext = os.path.splitext(filename)[1].lower()
                
                # 3. Dynamic Routing to Splitters
                language_enum = EXTENSION_TO_LANGUAGE.get(ext)
                if language_enum:
                    splitter = RecursiveCharacterTextSplitter.from_language(
                        language=language_enum, 
                        chunk_size=self.chunk_size, 
                        chunk_overlap=self.chunk_overlap
                    )
                else:
                    # Generic text fallback
                    splitter = RecursiveCharacterTextSplitter(
                        chunk_size=self.chunk_size,
                        chunk_overlap=self.chunk_overlap
                    )
                    
                doc = Document(page_content=source_code, metadata={"source": rel_path})
                lc_chunks = splitter.split_documents([doc])
                
                # 4. Map to CodeChunk
                for c in lc_chunks:
                    chunk_source = c.page_content
                    complexity = self._compute_complexity(chunk_source)
                    tokens = len(self.encoder.encode(chunk_source))
                    
                    # Approximate lines
                    start_line = 1
                    end_line = chunk_source.count('\n') + 1
                    
                    chunk = CodeChunk(
                        chunk_id=str(uuid.uuid4()),
                        chunk_type=ext[1:] if ext else "text",
                        name=filename,
                        qualified_name=f"{rel_path}:{filename}",
                        file_path=rel_path,
                        start_line=start_line,
                        end_line=end_line,
                        source_code=chunk_source,
                        docstring=None,
                        parent_class=None,
                        decorators=[],
                        complexity_score=complexity,
                        token_count=tokens
                    )
                    code_chunks.append(chunk)
                    
        return code_chunks
        
    def _compute_complexity(self, source: str) -> int:
        """Uses radon.complexity to compute cyclomatic complexity. Returns 1 on failure."""
        try:
            results = radon_cc.cc_visit(source)
            if not results:
                return 1
            return sum([r.complexity for r in results]) // len(results)
        except Exception:
            return 1
