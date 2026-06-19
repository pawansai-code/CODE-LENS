import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder } from 'lucide-react';
import { clsx } from 'clsx';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  language?: string;
  content?: string;
}

interface FileTreeProps {
  onSelectFile: (file: FileNode) => void;
  activeFileId?: string;
}

const mockFileSystem: FileNode[] = [
  {
    id: '/backend',
    name: 'backend',
    type: 'folder',
    children: [
      { 
        id: '/backend/main.py', 
        name: 'main.py', 
        type: 'file', 
        language: 'python', 
        content: 'from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get("/")\ndef read_root():\n    return {"Hello": "World"}' 
      },
      { 
        id: '/backend/schema.py', 
        name: 'schema.py', 
        type: 'file', 
        language: 'python', 
        content: 'from pydantic import BaseModel\n\nclass Item(BaseModel):\n    name: str\n    price: float\n    is_offer: bool = None' 
      },
    ]
  },
  {
    id: '/frontend',
    name: 'frontend',
    type: 'folder',
    children: [
      { 
        id: '/frontend/App.tsx', 
        name: 'App.tsx', 
        type: 'file', 
        language: 'typescript', // Monaco recognizes 'typescript' better for tsx
        content: 'import React from "react";\n\nexport default function App() {\n  return <div>Hello World</div>;\n}' 
      },
      { 
        id: '/frontend/index.css', 
        name: 'index.css', 
        type: 'file', 
        language: 'css', 
        content: 'body { margin: 0; }' 
      },
    ]
  },
  { 
    id: '/README.md', 
    name: 'README.md', 
    type: 'file', 
    language: 'markdown', 
    content: '# CodeLens\n\nAn AI pair-programmer that runs entirely locally.' 
  },
];

function FileTreeNode({ node, level = 0, onSelectFile, activeFileId }: { node: FileNode; level?: number; onSelectFile: (f: FileNode) => void; activeFileId?: string }) {
  const [isOpen, setIsOpen] = useState(level === 0);
  const isSelected = activeFileId === node.id;

  if (node.type === 'folder') {
    return (
      <div>
        <div 
          className="flex items-center gap-1.5 py-1 px-2 hover:bg-gray-800/50 cursor-pointer text-gray-300 transition-colors"
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
          <Folder size={14} className="text-blue-400" />
          <span className="text-sm select-none">{node.name}</span>
        </div>
        {isOpen && node.children?.map((child, i) => (
          <FileTreeNode key={i} node={child} level={level + 1} onSelectFile={onSelectFile} activeFileId={activeFileId} />
        ))}
      </div>
    );
  }

  return (
    <div 
      className={clsx(
        "flex items-center gap-2 py-1 px-2 cursor-pointer transition-colors border-l-2",
        isSelected ? "bg-blue-500/10 border-blue-500 text-blue-400" : "hover:bg-gray-800/50 border-transparent text-gray-400 hover:text-gray-200"
      )}
      style={{ paddingLeft: `${level * 12 + 24}px` }}
      onClick={() => onSelectFile(node)}
    >
      <File size={13} className={isSelected ? "text-blue-400" : "text-gray-500"} />
      <span className="text-sm select-none">{node.name}</span>
    </div>
  );
}

export default function FileTree({ onSelectFile, activeFileId }: FileTreeProps) {
  return (
    <div className="flex-1 overflow-y-auto py-2">
      {mockFileSystem.map((node, i) => (
        <FileTreeNode key={i} node={node} onSelectFile={onSelectFile} activeFileId={activeFileId} />
      ))}
    </div>
  );
}
