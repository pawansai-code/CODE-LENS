import { useEffect } from 'react';
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
import { Network } from 'lucide-react';

interface ArchitectureGraphProps {
  initialNodes: Node[];
  initialEdges: Edge[];
}

export default function ArchitectureGraph({ initialNodes, initialEdges }: ArchitectureGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="absolute inset-0">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        colorMode="light"
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
