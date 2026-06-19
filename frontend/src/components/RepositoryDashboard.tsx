import { motion } from 'framer-motion';
import { Network, FileCode2, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function RepositoryDashboard() {
  const metrics = [
    { label: "Vector Embeddings", value: "1,245", icon: <Network size={16} />, color: "text-blue-400" },
    { label: "Parsed Chunks", value: "850", icon: <FileCode2 size={16} />, color: "text-purple-400" },
    { label: "Avg Complexity", value: "4.2", icon: <Zap size={16} />, color: "text-amber-400" },
  ];

  const hotspots = [
    { name: "/backend/app/api/chat.py", score: 18 },
    { name: "/query/engine.py", score: 14 },
    { name: "/ingestion/parser.py", score: 12 },
  ];

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-6">
      {/* Global Health Score */}
      <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl border border-blue-500/20 shadow-inner">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 rounded-full animate-pulse" />
          <ShieldCheck size={48} className="text-emerald-400 relative z-10" />
        </div>
        <h3 className="text-3xl font-black text-white mt-4 tracking-tight">94%</h3>
        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-1">Health Score</p>
      </div>

      {/* Quick Metrics */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">RAG Statistics</h4>
        {metrics.map((m, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-800/50"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-md bg-gray-800 border border-gray-700 ${m.color}`}>
                {m.icon}
              </div>
              <span className="text-sm font-medium text-gray-300">{m.label}</span>
            </div>
            <span className="text-sm font-bold text-white">{m.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Complexity Hotspots */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-bold text-amber-500/80 uppercase tracking-wider mb-1 flex items-center gap-2">
          <AlertTriangle size={14} />
          Complexity Hotspots
        </h4>
        {hotspots.map((h, i) => (
          <div key={i} className="flex flex-col gap-1.5 p-3 bg-amber-900/10 rounded-lg border border-amber-900/20">
            <span className="text-xs font-mono text-gray-300 truncate" title={h.name}>{h.name}</span>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-red-500" 
                  style={{ width: `${Math.min((h.score / 20) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs font-bold text-amber-400">{h.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
