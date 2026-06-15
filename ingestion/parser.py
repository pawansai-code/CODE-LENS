import ast
from dataclasses import dataclass
from typing import List, Optional
from pathlib import Path

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

class ASTParser:
    def __init__(self, max_tokens: int = 1500):
        self.max_tokens = max_tokens
        
    def parse_file(self, path: Path) -> List[CodeChunk]:
        """Opens file, calls ast.parse(), walks tree, extracts all FunctionDef and ClassDef nodes. Falls back to single raw chunk on SyntaxError."""
        pass
        
    def _extract_function(self, node: ast.FunctionDef, source: str, file_path: str, parent: Optional[str] = None) -> CodeChunk:
        """Builds a CodeChunk from a FunctionDef node. Extracts docstring via ast.get_docstring()."""
        pass
        
    def _extract_class(self, node: ast.ClassDef, source: str, file_path: str) -> List[CodeChunk]:
        """Extracts a chunk for the class itself plus one chunk per method inside it."""
        pass
        
    def _compute_complexity(self, source: str) -> int:
        """Uses radon.complexity to compute cyclomatic complexity. Returns 1 on failure."""
        pass
        
    def _split_oversized(self, chunk: CodeChunk) -> List[CodeChunk]:
        """Splits chunks over MAX_TOKENS at nested function or block boundaries."""
        pass
