from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class ChatRequest(BaseModel):
    query: str

class ChunkContext(BaseModel):
    name: str
    content: str

class Telemetry(BaseModel):
    token_count: int
    faithfulness: float
    relevance: float
    latency_ms: int
    retrieved_chunks: List[ChunkContext]

class ChatResponse(BaseModel):
    answer: str
    telemetry: Telemetry

class IngestRequest(BaseModel):
    url: str

class MetricItem(BaseModel):
    label: str
    value: str
    color: str

class HotspotItem(BaseModel):
    name: str
    score: float

class MetricsResponse(BaseModel):
    health_score: str
    metrics: List[MetricItem]
    hotspots: List[HotspotItem]

class FileNodeSchema(BaseModel):
    id: str
    name: str
    type: str
    language: Optional[str] = None
    content: Optional[str] = None
    children: Optional[List['FileNodeSchema']] = None

class GraphNode(BaseModel):
    id: str
    position: Dict[str, float]
    data: Dict[str, Any]
    style: Dict[str, Any]

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    animated: bool
    style: Dict[str, Any]

class GraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

FileNodeSchema.model_rebuild()
