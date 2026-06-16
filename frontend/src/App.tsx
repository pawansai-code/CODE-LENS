import React from 'react';
import SplitPane from 'react-split-pane';
import { Terminal, Code2, MessageSquare } from 'lucide-react';

function App() {
  return (
    <div className="h-screen w-screen bg-[#0f111a] text-gray-200 overflow-hidden font-sans">
      {/* Header */}
      <header className="h-14 border-b border-gray-800 bg-[#141722] flex items-center px-6 justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-md">
            <Code2 size={20} className="text-white" />
          </div>
          <h1 className="text-lg font-semibold tracking-wide text-gray-100">Code-Lens</h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1.5"><Terminal size={16} /> Repository: Not Loaded</span>
        </div>
      </header>

      {/* Main Split Area */}
      <div className="h-[calc(100vh-3.5rem)] relative flex">
        <SplitPane 
          split="vertical" 
          minSize={300} 
          defaultSize={parseInt(localStorage.getItem('splitPos') || '0', 10) || '50%'}
          onChange={(size) => localStorage.setItem('splitPos', size.toString())}
          className="!static"
          pane1Style={{ height: '100%' }}
          pane2Style={{ height: '100%' }}
          resizerStyle={{
            width: '6px',
            background: 'transparent',
            cursor: 'col-resize',
            margin: '0 -3px',
            zIndex: 10,
          }}
        >
          {/* Left Pane: Code Viewer */}
          <div className="h-full bg-[#181a25] border-r border-gray-800 flex flex-col">
            <div className="p-3 border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <Code2 size={14} /> Explorer & Code
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-gray-500">
              <div className="p-4 rounded-full bg-gray-800/50 mb-4 shadow-inner">
                <Code2 size={32} className="text-gray-600" />
              </div>
              <p>No file selected.</p>
              <p className="text-sm mt-2 text-gray-600">Clone a repository to begin exploration.</p>
            </div>
          </div>

          {/* Right Pane: Chat Panel */}
          <div className="h-full bg-[#12141c] flex flex-col">
            <div className="p-3 border-b border-gray-800 text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare size={14} /> AI Assistant
            </div>
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-gray-500">
              <div className="p-4 rounded-full bg-blue-900/20 mb-4 shadow-inner shadow-blue-900/10 border border-blue-900/30">
                <MessageSquare size={32} className="text-blue-500" />
              </div>
              <p>I am ready to assist you.</p>
              <p className="text-sm mt-2 text-gray-600">Ask a question to start the AI conversation.</p>
            </div>
          </div>
        </SplitPane>
      </div>
    </div>
  );
}

export default App;
