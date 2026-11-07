import React from 'react';
import { Terminal, Shield, Sparkles, Sliders, HardDrive, Key, Volume2, Cloud, Trash2, Bot, Radio, Zap } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenKeyModal: () => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenKeyModal,
  hasApiKey,
}) => {
  const navItems = [
    { id: 'recommendations', label: 'Recommendations', icon: Zap },
    { id: 'copilot', label: 'AI Copilot', icon: Bot },
    { id: 'voice-live', label: 'Voice Live', icon: Radio },
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'commands', label: 'Top Tweaks', icon: Sliders },
    { id: 'ai-compiler', label: 'AI Compiler', icon: Sparkles },
    { id: 'theme-studio', label: 'Theme Studio', icon: Sliders },
    { id: 'disk-maintenance', label: 'Storage & launchd', icon: HardDrive },
    { id: 'uninstaller', label: 'Deep Wipe', icon: Trash2 },
    { id: 'cloud-backup', label: 'Cloud Sync', icon: Cloud },
    { id: 'security-audit', label: 'Security', icon: Shield },
    { id: 'audio-engine', label: 'Audio Engine', icon: Volume2 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080b11]/90 backdrop-blur-md px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-6 max-w-7xl mx-auto">
        {/* Zone 1: Single element Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 p-[1px] shadow-sm shadow-cyan-500/20">
            <div className="w-full h-full bg-[#080b11] rounded-[7px] flex items-center justify-center">
              <span className="text-sm font-black tracking-wider text-cyan-400">Ω</span>
            </div>
          </div>
          <span className="text-base font-bold tracking-tight text-slate-100 whitespace-nowrap">
            OmniOS God-Mode
          </span>
        </div>

        {/* Zone 2: Navigation Links (Single line, clean typography) */}
        <nav className="hidden xl:flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-800/90 text-cyan-300 border border-slate-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action (API Key & Authorization status) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenKeyModal}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap shrink-0 ${
              hasApiKey
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-cyan-950/40 border-cyan-700/60 text-cyan-300 hover:bg-cyan-900/40 shadow-sm shadow-cyan-500/10'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>{hasApiKey ? 'Gemini Active' : 'Configure Gemini'}</span>
          </button>
        </div>
      </div>

      {/* Responsive mobile / tablet horizontal scroll nav */}
      <div className="xl:hidden flex items-center gap-1.5 overflow-x-auto pt-2.5 pb-1 border-t border-slate-800/40 mt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                isActive
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
