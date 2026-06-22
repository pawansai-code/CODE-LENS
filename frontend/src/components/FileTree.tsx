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
  fileSystem: FileNode[];
  onSelectFile: (file: FileNode) => void;
  activeFileId?: string;
}

function FileTreeNode({ node, level = 0, onSelectFile, activeFileId }: { node: FileNode; level?: number; onSelectFile: (f: FileNode) => void; activeFileId?: string }) {
  const [isOpen, setIsOpen] = useState(level === 0);
  const isSelected = activeFileId === node.id;

  if (node.type === 'folder') {
    return (
      <div>
        <div 
          className="flex items-center gap-1.5 py-1 px-2 hover:bg-gray-100 cursor-pointer text-black transition-colors"
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronDown size={14} className="text-black" /> : <ChevronRight size={14} className="text-black" />}
          <Folder size={14} className="text-black" />
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
        isSelected ? "bg-gray-200 border-black text-black font-bold" : "hover:bg-gray-100 border-transparent text-gray-700 hover:text-black"
      )}
      style={{ paddingLeft: `${level * 12 + 24}px` }}
      onClick={() => onSelectFile(node)}
    >
      <File size={13} className="text-black" />
      <span className="text-sm select-none">{node.name}</span>
    </div>
  );
}

export default function FileTree({ fileSystem, onSelectFile, activeFileId }: FileTreeProps) {
  return (
    <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
      {fileSystem.map((node, i) => (
        <FileTreeNode key={i} node={node} onSelectFile={onSelectFile} activeFileId={activeFileId} />
      ))}
    </div>
  );
}
