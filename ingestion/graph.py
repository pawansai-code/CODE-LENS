import networkx as nx
from typing import List
from pathlib import Path
from .parser import CodeChunk

class DependencyGraphBuilder:
    def __init__(self):
        self.graph = nx.DiGraph()
        
    def build(self, chunks: List[CodeChunk]) -> nx.DiGraph:
        """Iterates all chunks; calls _extract_calls for each; adds edges to graph."""
        pass
        
    def _extract_calls(self, chunk: CodeChunk) -> List[str]:
        """Walks the chunk's AST for Call nodes. Resolves names to qualified_names where possible via import table."""
        pass
        
    def _build_import_table(self, file_path: Path) -> dict:
        """Parses import statements in the file to build a name -> qualified_name mapping."""
        pass

class GraphStore:
    def __init__(self, persist_path: str):
        self.persist_path = Path(persist_path)
        
    def save(self, graph: nx.DiGraph, path: Path = None):
        """Serializes graph to JSON using nx.node_link_data()."""
        pass
        
    def load(self, path: Path = None) -> nx.DiGraph:
        """Deserializes from JSON. Raises GraphNotFoundError if file missing."""
        pass
        
    def get_neighbors(self, graph: nx.DiGraph, node: str, depth: int = 1) -> List[str]:
        """BFS traversal up to given depth. Returns callers (predecessors) + callees (successors)."""
        pass
