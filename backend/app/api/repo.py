from fastapi import APIRouter
from pydantic import BaseModel
import os
from pathlib import Path

# Add project root
project_root = Path(__file__).parent.parent.parent.parent
import sys
if str(project_root) not in sys.path:
    sys.path.append(str(project_root))

from app.models.schemas import IngestRequest, MetricsResponse, MetricItem, HotspotItem, GraphResponse, GraphNode, GraphEdge, FileNodeSchema
from ingestion.loader import RepoLoader
from ingestion.parser import ASTParser
from ingestion.indexer import EmbeddingGenerator, VectorStoreWriter
from app.api.chat import engine, db_path

router = APIRouter()

@router.post("/ingest")
async def ingest_repo(request: IngestRequest):
    print(f"\n[INFO] Starting ingestion for: {request.url}")
    loader = RepoLoader()
    try:
        print("[INFO] Cloning repository to temporary directory...")
        repo_path = loader.load(request.url)
        print(f"[INFO] Cloned to: {repo_path}")
        
        print("[INFO] Parsing directory and extracting AST...")
        parser = ASTParser()
        chunks = parser.parse_directory(repo_path)
        print(f"[INFO] Parsed {len(chunks)} code chunks successfully.")
        
        print("[INFO] Generating Vector Embeddings...")
        generator = EmbeddingGenerator(model_name="nomic-embed-text")
        
        print("[INFO] Clearing old embeddings...")
        if engine and engine.vectorstore:
            try:
                engine.vectorstore.delete_collection()
                print("[INFO] Old collection deleted.")
            except Exception as e:
                print(f"[WARNING] Could not delete old collection: {e}")
        
        print("[INFO] Writing embeddings to ChromaDB...")
        writer = VectorStoreWriter(persist_dir=db_path, collection_name="test_collection")
        writer.write(chunks, generator.get_embeddings_model())
        print("[INFO] ChromaDB write complete.")
        
        # Reload the AI Engine so it knows about the new repo
        if engine:
            print("[INFO] Reloading AI Engine Vector Store in-memory...")
            engine.reload_db()
            print("[INFO] AI Engine reloaded.")
            
        print(f"[INFO] Ingestion Pipeline Complete! App is ready.")
        return {"status": "success", "message": f"Successfully ingested {len(chunks)} chunks."}
    except Exception as e:
        print(f"\n[ERROR] Ingestion failed: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        print("[INFO] Cleaning up temporary repository files...")
        loader.cleanup()
        print("[INFO] Cleanup complete.\n")

@router.get("/metrics", response_model=MetricsResponse)
async def get_metrics():
    if not engine or not engine.vectorstore:
        return MetricsResponse(health_score="0%", metrics=[], hotspots=[])
        
    try:
        db_docs = engine.vectorstore.get(include=['metadatas'])
    except Exception as e:
        print(f"Error fetching metrics from vectorstore: {e}")
        return MetricsResponse(health_score="0%", metrics=[], hotspots=[])
        
    metadatas = db_docs.get('metadatas', [])
    
    total_chunks = len(metadatas)
    if total_chunks == 0:
        return MetricsResponse(health_score="0%", metrics=[], hotspots=[])
        
    total_tokens = sum([m.get("token_count", 0) for m in metadatas])
    avg_complexity = sum([m.get("complexity_score", 1) for m in metadatas]) / total_chunks
    
    # Calculate hotspots
    file_complexities = {}
    for m in metadatas:
        fp = m.get("file_path", "unknown")
        # Extract just the filename for cleaner UI
        short_name = os.path.basename(fp.replace("\\", "/"))
        score = m.get("complexity_score", 1)
        file_complexities[short_name] = file_complexities.get(short_name, 0) + score
        
    hotspots = []
    for fp, score in sorted(file_complexities.items(), key=lambda x: x[1], reverse=True)[:5]:
        hotspots.append(HotspotItem(name=fp, score=score))
        
    metrics = [
        MetricItem(label="Parsed Chunks", value=str(total_chunks), color="text-purple-400"),
        MetricItem(label="Total Tokens", value=str(total_tokens), color="text-blue-400"),
        MetricItem(label="Avg Complexity", value=f"{avg_complexity:.1f}", color="text-amber-400"),
    ]
    
    health = max(0, 100 - (avg_complexity * 2))
    
    return MetricsResponse(health_score=f"{int(health)}%", metrics=metrics, hotspots=hotspots)

@router.get("/graph", response_model=GraphResponse)
async def get_graph():
    # Simple graph generation from metadatas
    if not engine or not engine.vectorstore:
        return GraphResponse(nodes=[], edges=[])
        
    try:
        db_docs = engine.vectorstore.get(include=['metadatas'])
    except Exception as e:
        print(f"Error fetching graph from vectorstore: {e}")
        return GraphResponse(nodes=[], edges=[])
        
    metadatas = db_docs.get('metadatas', [])
    
    # Extract unique files
    files = list(set([m.get("file_path", "unknown") for m in metadatas]))
    
    nodes = []
    edges = []
    
    # Create root node
    nodes.append(GraphNode(
        id="root",
        position={"x": 250, "y": 50},
        data={"label": "Repository Root"},
        style={"background": "#fff", "color": "#000", "border": "1px solid #000", "borderRadius": "0", "padding": "10px 15px"}
    ))
    
    for i, file in enumerate(files[:10]): # Limit to 10 for clean UI
        node_id = f"file_{i}"
        short_name = os.path.basename(file.replace("\\", "/"))
        nodes.append(GraphNode(
            id=node_id,
            position={"x": 100 + (i % 3) * 150, "y": 150 + (i // 3) * 100},
            data={"label": short_name},
            style={"background": "#fff", "color": "#000", "border": "1px solid #000", "borderRadius": "0", "padding": "5px 10px"}
        ))
        
        edges.append(GraphEdge(
            id=f"e_root_{node_id}",
            source="root",
            target=node_id,
            animated=True,
            style={"stroke": "#000", "strokeWidth": 1}
        ))
        
    return GraphResponse(nodes=nodes, edges=edges)

@router.get("/files", response_model=FileNodeSchema)
async def get_files():
    # Construct tree from actual saved repository on disk
    repo_dir = project_root / "data" / "repo"
    
    if not repo_dir.exists():
        return FileNodeSchema(id="root", name="Repository", type="folder", children=[])
        
    def build_tree(path: Path) -> FileNodeSchema:
        rel_path = str(path.relative_to(repo_dir)).replace("\\", "/")
        if path.is_file():
            # For preview in the UI, read the first few KB of the file
            try:
                content = path.read_text(encoding="utf-8")
                # Truncate content to avoid massive payloads for huge files
                if len(content) > 50000:
                    content = content[:50000] + "\n\n... [File content truncated for preview] ..."
            except Exception:
                content = "// Binary or unsupported file format"
                
            return FileNodeSchema(
                id=rel_path,
                name=path.name,
                type="file",
                language=path.suffix[1:] if path.suffix else "text",
                content=content
            )
        else:
            children = []
            try:
                for child in sorted(path.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower())):
                    if child.name == ".git": continue
                    children.append(build_tree(child))
            except Exception:
                pass
            return FileNodeSchema(
                id=rel_path,
                name=path.name,
                type="folder",
                children=children
            )
            
    children = []
    try:
        for child in sorted(repo_dir.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower())):
            if child.name == ".git": continue
            children.append(build_tree(child))
    except Exception:
        pass
        
    return FileNodeSchema(id="root", name="Repository Root", type="folder", children=children)
