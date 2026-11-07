import React, { useState, useMemo } from 'react';
import { 
  Sliders, 
  Zap, 
  Wifi, 
  Cpu, 
  Search, 
  Play, 
  Copy, 
  Check, 
  RotateCcw, 
  Info,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Terminal
} from 'lucide-react';
import { MacCommand, CommandCategory, RiskLevel } from '../types';
import { MAC_COMMANDS_REPOSITORY } from '../utils/macCommands';

interface CommandRepositoryProps {
  onRunCommand: (command: string, name?: string) => void;
}

export const CommandRepository: React.FC<CommandRepositoryProps> = ({ onRunCommand }) => {
  const [selectedCategory, setSelectedCategory] = useState<CommandCategory | 'all'>('all');
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Tweaks', icon: Sliders, count: MAC_COMMANDS_REPOSITORY.length },
    { id: 'ui', label: 'UI Customization', icon: Sliders, count: MAC_COMMANDS_REPOSITORY.filter(c => c.category === 'ui').length },
    { id: 'perf', label: 'Performance Profiles', icon: Zap, count: MAC_COMMANDS_REPOSITORY.filter(c => c.category === 'perf').length },
    { id: 'net', label: 'Network Utilities', icon: Wifi, count: MAC_COMMANDS_REPOSITORY.filter(c => c.category === 'net').length },
    { id: 'core', label: 'Core OS Tweaks', icon: Cpu, count: MAC_COMMANDS_REPOSITORY.filter(c => c.category === 'core').length },
  ];

  const filteredCommands = useMemo(() => {
    return MAC_COMMANDS_REPOSITORY.filter((cmd) => {
      const matchesCategory = selectedCategory === 'all' || cmd.category === selectedCategory;
      const matchesRisk = selectedRisk === 'all' || cmd.risk === selectedRisk;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        cmd.name.toLowerCase().includes(query) ||
        cmd.description.toLowerCase().includes(query) ||
        cmd.command.toLowerCase().includes(query) ||
        cmd.tags.some((t) => t.toLowerCase().includes(query));

      return matchesCategory && matchesRisk && matchesSearch;
    });
  }, [selectedCategory, selectedRisk, searchQuery]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'safe':
        return (
          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <ShieldCheck className="w-3 h-3" /> Safe
          </span>
        );
      case 'intermediate':
        return (
          <span className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
            <Info className="w-3 h-3" /> Intermediate
          </span>
        );
      case 'advanced':
        return (
          <span className="flex items-center gap-1 text-[11px] text-orange-400 font-medium">
            <AlertTriangle className="w-3 h-3" /> Advanced
          </span>
        );
      case 'sudo':
        return (
          <span className="flex items-center gap-1 text-[11px] text-rose-400 font-medium">
            <Flame className="w-3 h-3" /> Sudo / Admin
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#0c1017] border border-slate-800">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as CommandCategory | 'all')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{cat.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded-full font-mono">
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tweaks (e.g. dock, dns, ram)..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg bg-[#06080d] border border-slate-700/80 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Risk Filter Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span>Filter by risk level:</span>
          {(['all', 'safe', 'intermediate', 'advanced', 'sudo'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRisk(r)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize transition-colors ${
                selectedRisk === r
                  ? 'bg-slate-700 text-slate-100'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="font-mono text-[11px]">
          Showing {filteredCommands.length} tweaks
        </div>
      </div>

      {/* Grid of Command Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredCommands.map((cmd) => {
          const isCopied = copiedId === cmd.id;
          const isExpanded = expandedId === cmd.id;

          return (
            <div
              key={cmd.id}
              className="p-4 rounded-xl bg-[#0c1017] border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {cmd.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {cmd.description}
                    </p>
                  </div>
                  <div className="shrink-0">{getRiskBadge(cmd.risk)}</div>
                </div>

                {/* Command Code Box */}
                <div className="relative mt-3 p-3 rounded-lg bg-[#06080d] border border-slate-800/90 font-mono text-xs text-cyan-300 break-all select-all">
                  <code>{cmd.command}</code>
                </div>

                {/* Explanation Details */}
                {isExpanded && (
                  <div className="mt-3 p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2 animate-in fade-in duration-150">
                    <div>
                      <span className="font-semibold text-cyan-400">Technical Explanation: </span>
                      <span>{cmd.explanation}</span>
                    </div>
                    {cmd.undoCommand && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="font-semibold text-amber-400">Default Revert / Undo: </span>
                        <code className="text-slate-300 block mt-1 p-1.5 bg-black/40 rounded text-[11px]">
                          {cmd.undoCommand}
                        </code>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/60">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {cmd.tags.map((tag) => (
                    <span key={tag} className="text-[10px] text-slate-400 font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : cmd.id)}
                    className="p-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-md transition-colors"
                    title={isExpanded ? 'Hide explanation' : 'Show technical explanation'}
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleCopy(cmd.id, cmd.command)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-slate-100 bg-slate-800/60 hover:bg-slate-800 rounded-md transition-colors"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {cmd.undoCommand && (
                    <button
                      onClick={() => onRunCommand(cmd.undoCommand!, `Revert: ${cmd.name}`)}
                      className="p-1.5 text-xs text-slate-400 hover:text-amber-300 hover:bg-slate-800/60 rounded-md transition-colors"
                      title="Run Undo Command in Simulator"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => onRunCommand(cmd.command, cmd.name)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-md transition-colors shadow-sm shadow-cyan-500/20"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run in Simulator</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
