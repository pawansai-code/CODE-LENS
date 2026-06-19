import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Code2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
}

export default function ChatPanel({ messages, onSendMessage, onCitationClick, isGenerating }: ChatPanelProps) {
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

  // Basic citation parser: [filename.ext#L1-10]
  const renderMessageContent = (content: string) => {
    // We could use custom components in ReactMarkdown, but for simplicity we'll just let ReactMarkdown handle it,
    // and provide a custom renderer for `a` tags (if we format citations as links in markdown).
    // Let's assume citations are formatted like: [filename.py:L10-L20](#citation) by the AI
    
    return (
      <div className="markdown-body text-sm">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
          a: ({ node, href, children, ...props }) => {
            if (href === '#citation') {
              // Parse the text to extract filename and lines
              // Assuming text format: filename.py#L10-L15
              const text = String(children);
              const match = text.match(/([^#]+)#L(\d+)(?:-L(\d+))?/);
              
              if (match) {
                const filename = match[1];
                const startLine = parseInt(match[2], 10);
                const endLine = match[3] ? parseInt(match[3], 10) : startLine;
                const lines = Array.from({ length: endLine - startLine + 1 }, (_, i) => startLine + i);
                
                return (
                  <button 
                    onClick={() => onCitationClick(filename, lines)}
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30 transition-colors mx-1"
                  >
                    <Code2 size={12} />
                    {text}
                  </button>
                );
              }
            }
            return <a href={href} className="text-blue-400 hover:underline" {...props}>{children}</a>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
  };

  return (
    <div className="flex flex-col h-full bg-[#12141a]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence initial={false}>
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-gray-500"
            >
              <div className="p-4 rounded-full bg-blue-900/20 mb-4 shadow-inner shadow-blue-900/10 border border-blue-900/30">
                <Bot size={32} className="text-blue-500" />
              </div>
              <p className="font-medium text-gray-300">I am CodeLens.</p>
              <p className="text-sm mt-2 text-gray-500">Ask a question about your repository.</p>
            </motion.div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                msg.role === 'user' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-purple-500/10 border border-purple-500/20 text-gray-200 rounded-tr-sm' 
                    : 'bg-gray-800/40 border border-gray-700/50 text-gray-300 rounded-tl-sm'
                }`}>
                  {msg.role === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    <>
                      {renderMessageContent(msg.content)}
                      {msg.telemetry && <AITelemetry data={msg.telemetry} />}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Bot size={16} />
              </div>
              <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-tl-sm bg-gray-800/40 border border-gray-700/50">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-800 bg-[#0b0c10]">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your code..."
            disabled={isGenerating}
            className="w-full bg-[#1a1c23] border border-gray-700/50 rounded-xl py-3 pl-4 pr-12 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="absolute right-2 p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-blue-500 transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
