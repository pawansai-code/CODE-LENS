import yaml
from dataclasses import dataclass
from pathlib import Path
from typing import List

@dataclass
class LLMConfig:
    model: str
    max_tokens: int

@dataclass
class EmbeddingConfig:
    model: str
    batch_size: int

@dataclass
class RetrievalConfig:
    top_k: int
    token_budget: int

@dataclass
class GraphConfig:
    expansion_depth: int
    max_neighbors_per_chunk: int

@dataclass
class IngestionConfig:
    max_chunk_tokens: int
    exclude_patterns: List[str]

@dataclass
class ChromaConfig:
    persist_dir: str

@dataclass
class GraphStoreConfig:
    persist_path: str

@dataclass
class AppConfig:
    llm: LLMConfig
    embedding: EmbeddingConfig
    retrieval: RetrievalConfig
    graph: GraphConfig
    ingestion: IngestionConfig
    chroma: ChromaConfig
    graph_store: GraphStoreConfig

    @classmethod
    def load(cls, path: str = "config.yaml") -> 'AppConfig':
        with open(path, 'r') as f:
            data = yaml.safe_load(f)
        
        return cls(
            llm=LLMConfig(**data.get('llm', {})),
            embedding=EmbeddingConfig(**data.get('embedding', {})),
            retrieval=RetrievalConfig(**data.get('retrieval', {})),
            graph=GraphConfig(**data.get('graph', {})),
            ingestion=IngestionConfig(**data.get('ingestion', {})),
            chroma=ChromaConfig(**data.get('chroma', {})),
            graph_store=GraphStoreConfig(**data.get('graph_store', {}))
        )
