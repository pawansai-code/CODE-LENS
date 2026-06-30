import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Code2, GitBranch, ArrowRight, Search } from 'lucide-react';

export default function Home() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl.trim()) {
      navigate('/workspace');
    }
  };

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 1.5 }
    }
  };

  return (
    <div className="relative min-h-screen w-screen bg-[#050505] text-white overflow-hidden flex flex-col items-center justify-center font-sans">
      {/* Hyper-realistic Background Animation */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={gridVariants}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        {/* Animated Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] right-[20%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px]"
        />

        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />

        {/* Floating Code Snippets / Nodes */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: Math.random() * 800, x: Math.random() * window.innerWidth, opacity: 0 }}
            animate={{
              y: [null, Math.random() * 800 - 400],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5
            }}
            className="absolute p-4 rounded-xl border border-white/5 bg-white/[0.02] backdrop-blur-sm"
            style={{
              left: `${10 + Math.random() * 80}%`,
              scale: 0.5 + Math.random() * 0.5
            }}
          >
            <div className="h-2 w-12 bg-white/20 rounded-full mb-2" />
            <div className="h-2 w-20 bg-blue-500/40 rounded-full mb-2" />
            <div className="h-2 w-16 bg-purple-500/40 rounded-full" />
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-3xl px-6 flex flex-col items-center text-center">
        {/* Logo/Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          className="mb-8"
        >
          <div className="relative inline-flex">
            <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-40 rounded-full animate-pulse" />
            <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-2xl shadow-2xl border border-white/10 ring-1 ring-white/5">
              <Code2 size={48} className="text-blue-400" />
            </div>

            {/* "Lens" effect sweeping across the logo */}
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 mix-blend-overlay"
            />
          </div>
        </motion.div>

        {/* Typography */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
        >
          Analyze your code.<br />At the speed of thought.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl"
        >
          Paste a Git repository link to Instantly index, explore, and chat with your entire codebase using CodeLens's advanced AI engine.
        </motion.p>

        {/* Input Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          onSubmit={handleSubmit}
          className="w-full max-w-xl relative group"
        >
          <div className={`absolute -inset-0.5 rounded-2xl blur-lg opacity-50 transition duration-500 ${isFocused ? 'bg-gradient-to-r from-blue-500 to-purple-600 opacity-100' : 'bg-white/10'}`}></div>
          <div className="relative flex items-center bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl transition-all">
            <div className="pl-4 pr-2 text-gray-400">
              <GitBranch size={20} />
            </div>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="https://github.com/username/repository"
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg py-3 px-2 w-full"
            />
            <button
              type="submit"
              disabled={!repoUrl.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-xl px-6 py-3 font-semibold transition-all flex items-center gap-2 group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] disabled:shadow-none"
            >
              Analyze <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.form>
      </div>

      {/* Footer / Disclaimer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 text-sm text-gray-500 flex items-center gap-2"
      >
        <Search size={14} /> Supports public GitHub, GitLab, and Bitbucket repositories.
      </motion.div>
    </div>
  );
}
