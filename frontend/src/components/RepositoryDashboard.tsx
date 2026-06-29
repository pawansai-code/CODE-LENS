import { Activity, ShieldAlert, Code2, GitBranch } from 'lucide-react';

export interface MetricItem {
  label: string;
  value: string;
  icon: 'code' | 'git' | 'activity';
}

export interface HotspotItem {
  file: string;
  score: number;
}

interface RepositoryDashboardProps {
  healthScore: string;
  metrics: MetricItem[];
  hotspots: HotspotItem[];
}

export default function RepositoryDashboard({ healthScore, metrics, hotspots }: RepositoryDashboardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'code': return <Code2 size={16} className="text-black" />;
      case 'git': return <GitBranch size={16} className="text-black" />;
      case 'activity': return <Activity size={16} className="text-black" />;
      default: return <Activity size={16} className="text-black" />;
    }
  };

    <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white text-black">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, i) => (
          <div key={i} className="p-3 border border-black bg-white">
            <div className="flex items-center gap-2 mb-1">
              {getIcon(metric.icon)}
              <span className="text-xs font-bold uppercase text-gray-500">{metric.label}</span>
            </div>
            <div className="text-lg font-bold">{metric.value}</div>
          </div>
        ))}
      </div>

      {/* Complexity Hotspots */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-black flex items-center gap-2">
          <ShieldAlert size={16} /> Complexity Hotspots
        </h3>
        <div className="space-y-2">
          {hotspots.map((hotspot, i) => (
            <div key={i} className="flex items-center justify-between p-2 border border-black bg-white">
              <span className="text-xs font-mono text-black truncate pr-4 max-w-[140px]" title={hotspot.file}>
                {hotspot.file}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-black border border-black px-1.5 py-0.5">{hotspot.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
}
