import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, Zap, Database, ChevronDown, ChevronUp, Code2 } from 'lucide-react';
import { clsx } from 'clsx';

export interface TelemetryData {
  token_count: number;
  faithfulness: number; // 0.0 to 1.0
  relevance: number;    // 0.0 to 1.0
  latency_ms: number;
  retrieved_chunks: { name: string; content: string }[];
}

export default function AITelemetry({ data }: { data?: TelemetryData }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data) return null;

  // Formatting helpers
  const formatScore = (score: number) => `${(score * 100).toFixed(0)}%`;
  
  // Status colors based on thresholds
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (score >= 0.6) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
  };

  const getLatencyColor = (ms: number) => {
    if (ms < 1000) return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    if (ms < 3000) return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-red-400 bg-red-400/10 border-red-400/20';
  };

  return (
    <div className="mt-3 flex flex-col gap-2">
      {/* Metrics Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-400/10 border border-blue-400/20">
          <Database size={12} />
          <span>{data.token_count} Tokens</span>
        </div>
        
        <div className={clsx("flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border", getLatencyColor(data.latency_ms))}>
          <Activity size={12} />
          <span>{data.latency_ms}ms</span>
        </div>

        <div className={clsx("flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border", getScoreColor(data.faithfulness))}>
          <ShieldCheck size={12} />
          <span>Faithful: {formatScore(data.faithfulness)}</span>
        </div>

        <div className={clsx("flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border", getScoreColor(data.relevance))}>
          <Zap size={12} />
          <span>Relevant: {formatScore(data.relevance)}</span>
        </div>
      </div>

      {/* Context Accordion */}
      {data.retrieved_chunks.length > 0 && (
        <div className="mt-1 bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden max-w-2xl">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Code2 size={14} />
              View RAG Context Used ({data.retrieved_chunks.length} chunks)
            </span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t border-gray-800"
              >
                <div className="p-3 flex flex-col gap-3 max-h-60 overflow-y-auto custom-scrollbar">
                  {data.retrieved_chunks.map((chunk, idx) => (
                    <div key={idx} className="bg-[#0d1117] border border-gray-800 rounded-md p-2">
                      <div className="text-[10px] text-gray-500 font-mono mb-1 pb-1 border-b border-gray-800/50">
                        {chunk.name}
                      </div>
                      <pre className="text-[11px] text-gray-300 font-mono whitespace-pre-wrap overflow-x-auto">
                        {chunk.content}
                      </pre>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
