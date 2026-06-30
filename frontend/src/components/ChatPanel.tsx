import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Maximize2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import AITelemetry, { type TelemetryData } from './AITelemetry';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  telemetry?: TelemetryData;
}

interface ChatPanelProps {
  messages: Message[];
  onSendMessage: (msg: string) => void;
  onCitationClick: (filename: string, lines: number[]) => void;
  isGenerating?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export default function ChatPanel({ messages, onSendMessage, onCitationClick, isGenerating, isExpanded, onToggleExpand }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    onSendMessage(input);
    setInput('');
  };

  const renderMessageContent = (content: string) => {
    return (
      <div className="markdown-body text-sm text-black">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            a: ({node, ...props}) => {
              const href = props.href || '';
              if (href.startsWith('#citation')) {
                const text = String(props.children);
                const match = text.match(/\[(.*?)(?::L(\d+)-(\d+))?\]/);
                if (match) {
                  return (
                    <button 
                      onClick={() => onCitationClick(match[1], match[2] ? [parseInt(match[2]), parseInt(match[3])] : [])}
                      className="text-black underline font-bold px-1 mx-1 border border-black hover:bg-black hover:text-white transition-colors"
                    >
                      {text}
                    </button>
                  );
                }
              }
              return <a {...props} className="text-black underline hover:bg-black hover:text-white" />;
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-rose-50 text-black border-l border-black min-w-0">
      <div className="px-4 py-3 border-b border-black bg-purple-200 flex items-center justify-between shadow-none">
        <div className="flex items-center gap-2">
          <Bot size={18} className="text-black" />
          <h2 className="font-bold tracking-tight m-0 text-sm">CodeLens AI</h2>
        </div>
        {onToggleExpand && (
          <button 
            onClick={onToggleExpand}
            className="p-1.5 hover:bg-gray-100 transition-colors border border-transparent hover:border-black rounded-sm text-black"
            title={isExpanded ? "Collapse Chat" : "Expand Chat"}
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-rose-50">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-black">
            <div className="p-4 border border-black mb-4 bg-orange-200">
              <Bot size={32} className="text-black" />
            </div>
            <p className="font-bold text-black uppercase tracking-wider">I am CodeLens.</p>
            <p className="text-sm mt-2 text-black">Ask a question about your repository.</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id} 
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={`flex gap-3 w-full ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className="shrink-0 w-8 h-8 flex items-center justify-center border border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`flex flex-col max-w-[85%] min-w-0 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 border border-black text-black break-words overflow-x-auto text-sm w-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${msg.role === 'user' ? 'bg-purple-200' : 'bg-orange-200'}`}>
                  {renderMessageContent(msg.content)}
                </div>
              </div>
            </motion.div>
          ))}
          
          {isGenerating && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="flex gap-4"
            >
              <div className="shrink-0 w-8 h-8 flex items-center justify-center border border-black bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Bot size={16} />
              </div>
              <div className="px-4 py-3 border border-black bg-orange-200 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex gap-2 items-center">
                  <motion.div 
                    animate={{ y: [0, -5, 0] }} 
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} 
                    className="w-2 h-2 bg-black rounded-none" 
                  />
                  <motion.div 
                    animate={{ y: [0, -5, 0] }} 
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} 
                    className="w-2 h-2 bg-black rounded-none" 
                  />
                  <motion.div 
                    animate={{ y: [0, -5, 0] }} 
                    transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} 
                    className="w-2 h-2 bg-black rounded-none" 
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-black bg-rose-50">
        <form onSubmit={handleSubmit} className="relative flex items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your code..."
            disabled={isGenerating}
            className="w-full bg-white border border-black py-3 pl-4 pr-12 text-sm text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black focus:bg-rose-50 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="absolute right-2 p-1.5 border border-transparent hover:border-black text-black bg-transparent hover:bg-black hover:text-white disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-black transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
