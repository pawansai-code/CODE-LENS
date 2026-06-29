import React from 'react';
import { Cpu, Activity, Database } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface MetricProps {
  icon: React.ElementType;
  label: string;
  value: string;
  status?: 'healthy' | 'warning' | 'error';
}

function Metric({ icon: Icon, label, value, status = 'healthy' }: MetricProps) {
  const statusColors = {
    healthy: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    warning: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    error: 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-800/50 bg-[#12141a]/50">
      <Icon size={14} className={cn("opacity-70", statusColors[status].split(' ')[0])} />
      <span className="text-xs font-medium text-gray-400">{label}:</span>
      <span className={cn("text-xs font-bold", statusColors[status].split(' ')[0])}>{value}</span>
    </div>
  );
}

export default function ModelHealth() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-xs font-semibold text-blue-400 tracking-wide">QWEN 2.5 CODER</span>
      </div>
      
      <div className="h-4 w-px bg-gray-800 mx-1" />
      
      <Metric icon={Cpu} label="VRAM" value="4.2 / 8 GB" status="healthy" />
      <Metric icon={Activity} label="Latency" value="240ms" status="healthy" />
      <Metric icon={Database} label="Vector DB" value="Connected" status="healthy" />
    </div>
  );
}
