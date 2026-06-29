// @ts-nocheck
import { useState, useEffect } from 'react';
// @ts-ignore
import { SplitPane } from 'react-split-pane';
import { Code2, BookOpen, ArrowLeft, ArrowRight, Home, GitBranch, Network, FileCode2, LayoutDashboard, Activity, PanelRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import FileTree, { type FileNode } from '../components/FileTree';
import EditorArea from '../components/EditorArea';
import ChatPanel, { type Message } from '../components/ChatPanel';
import ArchitectureGraph from '../components/ArchitectureGraph';
import RepositoryDashboard, { type MetricItem, type HotspotItem } from '../components/RepositoryDashboard';
import { type Node, type Edge } from '@xyflow/react';

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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(false);

  // Repo Data State
  const [isIngesting, setIsIngesting] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [repoUrl, setRepoUrl] = useState("https://github.com/example/repo");
  const [metricsData, setMetricsData] = useState<{ healthScore: string; metrics: MetricItem[]; hotspots: HotspotItem[] }>({ healthScore: "0%", metrics: [], hotspots: [] });
  const [graphNodes, setGraphNodes] = useState<Node[]>([]);
  const [graphEdges, setGraphEdges] = useState<Edge[]>([]);
  const [fileSystem, setFileSystem] = useState<FileNode[]>([]);

  const fetchRepoData = async () => {
    try {
      const metricsRes = await fetch('http://localhost:8001/api/repo/metrics');
      const metrics = await metricsRes.json();
      setMetricsData({
        healthScore: metrics.health_score,
        metrics: metrics.metrics,
        hotspots: metrics.hotspots
      });
      
      const graphRes = await fetch('http://localhost:8001/api/repo/graph');
      const graph = await graphRes.json();
      setGraphNodes(graph.nodes);
      setGraphEdges(graph.edges);
      
      const filesRes = await fetch('http://localhost:8001/api/repo/files');
      const files = await filesRes.json();
      setFileSystem(files.children || []);
    } catch (e) {
      console.error("Failed to fetch repo data", e);
    }
  };

  useEffect(() => {
    fetchRepoData();
  }, []);

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl) return;
    
    const controller = new AbortController();
    setAbortController(controller);
    setIsIngesting(true);
    
    try {
      const res = await fetch('http://localhost:8001/api/repo/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: repoUrl }),
        signal: controller.signal
      });
      if (res.ok) {
        await fetchRepoData();
      } else {
        alert("Ingestion failed");
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.log("Ingestion cancelled by user.");
      } else {
        alert("Error connecting to server");
      }
    } finally {
      setIsIngesting(false);
      setAbortController(null);
    }
  };

  const handleCancelIngest = () => {
    if (abortController) {
      abortController.abort();
    }
  };

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

  const handleSendMessage = async (content: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content };
    setMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);

    try {
      const response = await fetch('http://localhost:8001/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: content })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: data.answer,
        telemetry: data.telemetry
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Failed to fetch chat response:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Error: Could not connect to the CodeLens AI Engine backend. Please ensure the FastAPI server is running."
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#FFFDF7] text-black overflow-hidden font-sans flex flex-col">
      {/* Sleek Top Header */}
      <header className="h-14 shrink-0 border-b border-black bg-[#FFDAB9] flex items-center px-6 justify-between z-10">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer text-inherit no-underline">
            <div className="p-1.5 border border-black rounded bg-white">
              <Code2 size={20} className="text-black" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-black flex items-center gap-2 m-0">
              CodeLens <span className="text-xs font-medium px-2 py-0.5 border border-black text-black bg-[#B4D8E7]">v0.1.0</span>
            </h1>
          </Link>

          <div className="flex items-center gap-1 border-l border-black pl-6">
            <button onClick={() => navigate(-1)} className="p-1.5 text-black hover:bg-gray-100 border border-transparent hover:border-black transition-colors" title="Go Back">
              <ArrowLeft size={18} />
            </button>
            <button onClick={() => navigate(1)} className="p-1.5 text-black hover:bg-gray-100 border border-transparent hover:border-black transition-colors" title="Go Forward">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 max-w-xl mx-8 flex items-center justify-center">
          <form 
            onSubmit={handleIngest}
            className="w-full max-w-lg relative flex items-center bg-white border border-black px-3 py-1.5 focus-within:ring-1 focus-within:ring-black transition-all group"
          >
            <GitBranch size={16} className="text-black mr-2" />
            <input 
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              disabled={isIngesting}
              placeholder="Paste Git repository URL to load..."
              className="bg-transparent border-none outline-none text-sm text-black placeholder-gray-500 w-full disabled:opacity-50"
            />
            <button type="submit" disabled={isIngesting} className="ml-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide bg-white text-black hover:bg-black hover:text-white disabled:opacity-50 px-3 py-1 border border-black transition-colors shrink-0">
              {isIngesting ? <div className="w-3 h-3 border-2 border-black border-t-transparent animate-spin" /> : null}
              {isIngesting ? "Loading..." : "Load"}
            </button>
            {isIngesting && (
              <button 
                type="button" 
                onClick={handleCancelIngest}
                className="ml-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide bg-white text-red-600 hover:bg-red-600 hover:text-white px-3 py-1 border border-red-600 transition-colors shrink-0"
              >
                Cancel
              </button>
            )}
          </form>
        </div>

        {/* Central View Toggle (Graph vs Editor) & Chat Toggle */}
        <div className="flex items-center gap-4">
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
          
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={clsx(
              "p-2 rounded-md border transition-colors",
              isChatOpen 
                ? "bg-black text-white border-black" 
                : "bg-white text-black border-transparent hover:border-black hover:bg-gray-50"
            )}
            title="Toggle AI Chat"
          >
            <PanelRight size={18} />
          </button>
        </div>
      </header>

      {/* Main Split Area */}
      <div className="flex-1 relative flex min-h-0 w-full overflow-hidden">
        {/* Left Pane: Explorer & Views */}
        <div className="flex-1 h-full bg-white flex relative overflow-hidden min-w-0">
          {/* Sidebar (FileTree or Dashboard) */}
          <div className="w-64 shrink-0 bg-white border-r border-black flex flex-col">
            {/* Sidebar Header with Toggle */}
            <div className="p-2 border-b border-black bg-gray-50 flex items-center justify-between">
              <div className="flex items-center bg-white border border-black p-1 w-full">
                <button
                  onClick={() => setSideView('metrics')}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors",
                    sideView === 'metrics' ? "bg-black text-white" : "text-black hover:bg-gray-100"
                  )}
                >
                  <Activity size={12} /> Metrics
                </button>
                <button
                  onClick={() => setSideView('files')}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors border-l border-black",
                    sideView === 'files' ? "bg-black text-white" : "text-black hover:bg-gray-100"
                  )}
                >
                  <BookOpen size={12} /> Files
                </button>
              </div>
            </div>

            {/* Sidebar Content */}
            {sideView === 'files' ? (
              <FileTree fileSystem={fileSystem} onSelectFile={handleSelectFile} activeFileId={activeFileId || undefined} />
            ) : (
              <RepositoryDashboard healthScore={metricsData.healthScore} metrics={metricsData.metrics} hotspots={metricsData.hotspots} />
            )}
          </div>

          {/* Dynamic Center Area */}
          <div className="flex-1 h-full relative min-w-0 border-r border-transparent">
            {mainView === 'graph' ? (
              <ArchitectureGraph initialNodes={graphNodes} initialEdges={graphEdges} />
            ) : (
              <EditorArea 
                openFiles={openFiles}
                activeFileId={activeFileId}
                onTabClick={handleTabClick}
                onTabClose={handleTabClose}
                onContentChange={handleContentChange}
                onCloseAllTabs={() => {
                  setOpenFiles([]);
                  setActiveFileId(null);
                }}
              />
            )}
          </div>
        </div>

        {/* Right Pane: AI Chat */}
        {isChatOpen && (
          <div className={clsx("shrink-0 h-full bg-[#FFFDF7] relative transition-all duration-300", isChatExpanded ? "w-[600px]" : "w-[350px]")}>
            <ChatPanel 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              onCitationClick={handleCitationClick}
              isGenerating={isGenerating}
              isExpanded={isChatExpanded}
              onToggleExpand={() => setIsChatExpanded(!isChatExpanded)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
