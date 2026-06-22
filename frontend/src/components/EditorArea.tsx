import React from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import Editor from '@monaco-editor/react';
import type { FileNode } from './FileTree';

interface EditorAreaProps {
  openFiles: FileNode[];
  activeFileId: string | null;
  onTabClick: (fileId: string) => void;
  onTabClose: (e: React.MouseEvent, fileId: string) => void;
  onContentChange: (fileId: string, newContent: string | undefined) => void;
}

export default function EditorArea({
  openFiles,
  activeFileId,
  onTabClick,
  onTabClose,
  onContentChange,
}: EditorAreaProps) {
  
  const activeFile = openFiles.find(f => f.id === activeFileId);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white h-full overflow-hidden">
      {/* Tabs Bar */}
      {openFiles.length > 0 && (
        <div className="flex overflow-x-auto bg-gray-50 shrink-0 border-b border-black hide-scrollbar">
          {openFiles.map((file) => {
            const isActive = file.id === activeFileId;
            return (
              <div
                key={file.id}
                onClick={() => onTabClick(file.id)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 border-r border-black cursor-pointer min-w-fit max-w-[200px] select-none text-sm group transition-colors",
                  isActive 
                    ? "bg-white text-black font-bold border-b-2 border-b-black" 
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-black border-b-2 border-b-transparent"
                )}
              >
                <span className="truncate">{file.name}</span>
                <button
                  onClick={(e) => onTabClose(e, file.id)}
                  className={clsx(
                    "p-0.5 hover:bg-gray-200 transition-opacity",
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Content */}
      {activeFile ? (
        <div className="flex-1 relative min-h-0 w-full h-full overflow-hidden">
          <Editor
            height="100%"
            width="100%"
            theme="light"
            path={activeFile.name} // path helps Monaco resolve languages and syntax
            defaultLanguage={activeFile.language || 'plaintext'}
            language={activeFile.language || 'plaintext'}
            value={activeFile.content || ''}
            onChange={(val) => onContentChange(activeFile.id, val)}
            options={{
              minimap: { enabled: false }, // Turn off minimap to keep UI clean
              fontSize: 14,
              fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace',
              wordWrap: 'on',
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              smoothScrolling: true,
            }}
            loading={
              <div className="flex h-full items-center justify-center text-black">
                Loading editor...
              </div>
            }
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-black bg-white">
          <div className="w-16 h-16 bg-white border border-black mb-4 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-black">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
          </div>
          <p className="text-sm font-bold uppercase tracking-wider">Select a file from the explorer to view and edit</p>
        </div>
      )}
    </div>
  );
}
