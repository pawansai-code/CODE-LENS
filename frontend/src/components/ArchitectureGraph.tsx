import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Database, FileCode2, Zap, LayoutTemplate, Network } from 'lucide-react';

// Custom Node types for a premium aesthetic
const initialNodes: Node[] = [
  { 
    id: '1', 
    position: { x: 250, y: 50 }, 
    data: { label: <div className="flex items-center gap-2"><LayoutTemplate size={16} className="text-purple-400" /> <b>app/main.py</b></div> },
    style: { background: '#161b22', color: '#fff', border: '1px solid #30363d', borderRadius: '8px', padding: '10px 15px', minWidth: '150px' }
  },
  { 
    id: '2', 
    position: { x: 100, y: 200 }, 
    data: { label: <div className="flex items-center gap-2"><FileCode2 size={16} className="text-blue-400" /> <b>api/chat.py</b></div> },
    style: { background: '#161b22', color: '#fff', border: '1px solid #30363d', borderRadius: '8px', padding: '10px 15px', minWidth: '150px' }
  },
  { 
    id: '3', 
    position: { x: 400, y: 200 }, 
    data: { label: <div className="flex items-center gap-2"><Database size={16} className="text-emerald-400" /> <b>query/engine.py</b></div> },
    style: { background: '#161b22', color: '#fff', border: '1px solid #30363d', borderRadius: '8px', padding: '10px 15px', minWidth: '150px' }
  },
  { 
    id: '4', 
    position: { x: 250, y: 350 }, 
    data: { label: <div className="flex items-center gap-2"><Zap size={16} className="text-amber-400" /> <b>QueryProcessor</b></div> },
    style: { background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px', padding: '10px 15px', minWidth: '150px' }
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#8b5cf6', strokeWidth: 2 } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
  { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#fbbf24', strokeWidth: 2 } },
  { id: 'e3-4', source: '3', target: '4', animated: true, style: { stroke: '#fbbf24', strokeWidth: 2 } },
];

export default function ArchitectureGraph() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="flex-1 w-full h-full bg-[#050505] relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        colorMode="dark"
      >
        <Controls 
          className="bg-gray-900 border-gray-700 fill-white" 
          showInteractive={false}
        />
        <MiniMap 
          nodeColor={(node) => {
            if (node.id === '4') return '#fbbf24';
            return '#3b82f6';
          }}
          maskColor="rgba(0, 0, 0, 0.8)"
          className="bg-gray-900 border-gray-800"
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={1.5} 
          color="#30363d" 
        />
      </ReactFlow>
      
      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 z-10 bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-lg p-3 shadow-2xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Network size={16} className="text-blue-400" />
          RAG Concept Graph
        </h3>
        <p className="text-xs text-gray-400 mt-1">Interactive 1-hop neighbor visualization</p>
      </div>
    </div>
  );
}
