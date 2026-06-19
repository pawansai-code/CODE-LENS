// @ts-nocheck
import { useState } from 'react';
// @ts-ignore
import { SplitPane } from 'react-split-pane';
import { Code2, BookOpen, ArrowLeft, ArrowRight, Home, GitBranch, Network, FileCode2, LayoutDashboard, Activity } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import FileTree, { type FileNode } from '../components/FileTree';
import EditorArea from '../components/EditorArea';
import ChatPanel, { type Message } from '../components/ChatPanel';
import ArchitectureGraph from '../components/ArchitectureGraph';
import RepositoryDashboard from '../components/RepositoryDashboard';

type SideViewType = 'files' | 'metrics';
type MainViewType = 'graph' | 'editor';

export default function Workspace() {
  const navigate = useNavigate();
  
  // UI View States
  const [sideView, setSideView] = useState<SideViewType>('metrics');
  const [mainView, setMainView] = useState<MainViewType>('graph');

  // Editor State
  const [openFiles, setOpenFiles] = useState<FileNode[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // File Tree interaction
  const handleSelectFile = (node: FileNode) => {
    if (node.type === 'folder') return;
    
    // Switch to editor view automatically when opening a file
    setMainView('editor');

    if (!openFiles.find(f => f.id === node.id)) {
      setOpenFiles([...openFiles, node]);
    }
    setActiveFileId(node.id);
  };

  const handleTabClick = (fileId: string) => {
    setActiveFileId(fileId);
  };

  const handleTabClose = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    const newOpenFiles = openFiles.filter(f => f.id !== fileId);
    setOpenFiles(newOpenFiles);
    
    if (activeFileId === fileId) {
      setActiveFileId(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1].id : null);
    }
  };

  const handleContentChange = (fileId: string, newContent: string | undefined) => {
    setOpenFiles(prev => prev.map(f => f.id === fileId ? { ...f, content: newContent || '' } : f));
  };

  const handleCitationClick = (filename: string, lines: number[]) => {
    const mockCitationId = `/mock/${filename}`;
    const newFile: FileNode = {
      id: mockCitationId,
      name: filename,
      type: 'file',
      language: filename.endsWith('.py') ? 'python' : 'typescript',
      content: `// Simulated content for ${filename}\nfunction example() {\n  console.log("Line 1");\n  console.log("Line 2");\n  console.log("Line 3");\n  console.log("Line 4");\n  console.log("Line 5");\n  console.log("Line 6");\n  console.log("Line 7");\n  console.log("Line 8");\n  console.log("Line 9");\n  console.log("Line 10");\n}`
    };
    handleSelectFile(newFile);
  };

  const handleSendMessage = (content: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);

    setTimeout(() => {
      const responseText = "I found the logic you're looking for in `main.py`.\n\nHere is a reference to the specific code block: [main.py#L3-L5](#citation)\n\nLet me know if you need further explanation!";
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: responseText,
        telemetry: {
          token_count: 842,
          faithfulness: 0.92,
          relevance: 0.88,
          latency_ms: 1250,
          retrieved_chunks: [
            {
              name: "/backend/main.py (read_root)",
              content: "@app.get(\"/\")\ndef read_root():\n    return {\"Hello\": \"World\"}"
            },
            {
              name: "/backend/schema.py (Item)",
              content: "class Item(BaseModel):\n    name: str\n    price: float\n    is_offer: bool = None"
            }
          ]
        }
      };
      
      setMessages(prev => [...prev, aiMsg]);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="h-screen w-screen bg-bg-primary text-text-primary overflow-hidden font-sans flex flex-col">
      {/* Sleek Top Header */}
      <header className="h-14 shrink-0 border-b border-border bg-bg-secondary flex items-center px-6 justify-between shadow-sm z-10">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer text-inherit no-underline">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
              <Code2 size={20} className="text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-gray-100 flex items-center gap-2 m-0">
              CodeLens <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">v0.1.0</span>
            </h1>
          </Link>

          <div className="flex items-center gap-1 border-l border-white/10 pl-6">
            <button onClick={() => navigate(-1)} className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Go Back">
              <ArrowLeft size={18} />
            </button>
            <button onClick={() => navigate(1)} className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Go Forward">
              <ArrowRight size={18} />
            </button>
            <button onClick={() => navigate('/')} className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Go to Home">
              <Home size={18} />
            </button>
          </div>
        </div>

        {/* Global Repo Input */}
        <div className="flex-1 max-w-xl mx-8 flex items-center justify-center">
          <form 
            onSubmit={(e) => { e.preventDefault(); alert("Repository loaded into workspace!"); }}
            className="w-full max-w-lg relative flex items-center bg-[#0d1117] border border-gray-700/50 rounded-lg px-3 py-1.5 focus-within:ring-1 focus-within:ring-blue-500/50 focus-within:border-blue-500/50 transition-all group shadow-inner"
          >
            <GitBranch size={16} className="text-gray-500 mr-2 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text"
              defaultValue="https://github.com/example/repo"
              placeholder="Paste Git repository URL to load..."
              className="bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-600 w-full"
            />
            <button type="submit" className="ml-2 text-[11px] font-bold uppercase tracking-wide bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1 rounded transition-all border border-blue-500/30 hover:border-blue-500">
              Load
            </button>
          </form>
        </div>

        {/* Central View Toggle (Graph vs Editor) */}
        <div className="flex items-center bg-[#0d1117] border border-gray-700/50 p-1 rounded-lg">
          <button
            onClick={() => setMainView('graph')}
            className={clsx(
              "flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-colors",
              mainView === 'graph' ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            )}
          >
            <Network size={14} /> Graph
          </button>
          <button
            onClick={() => setMainView('editor')}
            className={clsx(
              "flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-colors",
              mainView === 'editor' ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
            )}
          >
            <FileCode2 size={14} /> Editor
          </button>
        </div>
      </header>

      {/* Main Split Area */}
      <div className="flex-1 relative flex min-h-0 w-full">
        {/* @ts-ignore */}
        <SplitPane 
          split="vertical" 
          minSize={300} 
          defaultSize={parseInt(localStorage.getItem('splitPos') || '0', 10) || '50%'}
          onChange={(size: number) => localStorage.setItem('splitPos', size.toString())}
          className="!static"
          pane1Style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          pane2Style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          {/* Left Pane: Explorer & Views */}
          <div className="h-full bg-bg-secondary flex relative overflow-hidden">
            
            {/* Sidebar (FileTree or Dashboard) */}
            <div className="w-64 shrink-0 bg-bg-tertiary border-r border-border flex flex-col">
              {/* Sidebar Header with Toggle */}
              <div className="p-2 border-b border-border bg-bg-secondary/50 flex items-center justify-between">
                <div className="flex items-center bg-[#0d1117] border border-gray-700/50 p-1 rounded-md w-full">
                  <button
                    onClick={() => setSideView('metrics')}
                    className={clsx(
                      "flex-1 flex items-center justify-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors",
                      sideView === 'metrics' ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                    )}
                  >
                    <Activity size={12} /> Metrics
                  </button>
                  <button
                    onClick={() => setSideView('files')}
                    className={clsx(
                      "flex-1 flex items-center justify-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-colors",
                      sideView === 'files' ? "bg-gray-700 text-white" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                    )}
                  >
                    <BookOpen size={12} /> Files
                  </button>
                </div>
              </div>

              {/* Sidebar Content */}
              {sideView === 'files' ? (
                <FileTree onSelectFile={handleSelectFile} activeFileId={activeFileId || undefined} />
              ) : (
                <RepositoryDashboard />
              )}
            </div>

            {/* Dynamic Center Area */}
            {mainView === 'graph' ? (
              <ArchitectureGraph />
            ) : (
              <EditorArea 
                openFiles={openFiles}
                activeFileId={activeFileId}
                onTabClick={handleTabClick}
                onTabClose={handleTabClose}
                onContentChange={handleContentChange}
              />
            )}
          </div>

          {/* Right Pane: AI Chat */}
          <ChatPanel 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            onCitationClick={handleCitationClick}
            isGenerating={isGenerating}
          />
        </SplitPane>
      </div>
    </div>
  );
}
