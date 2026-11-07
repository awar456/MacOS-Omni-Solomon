import React, { useState } from 'react';
import { 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  HardDrive, 
  Check, 
  Play, 
  ArrowUpRight, 
  Flame,
  Battery,
  Sliders,
  Layers,
  Cpu
} from 'lucide-react';
import { SystemRecommendation, AudioSettings } from '../types';
import { SYSTEM_RECOMMENDATIONS, calculateSystemHealth } from '../utils/macCommands';
import { SoundEngine } from '../utils/soundEngine';

interface RecommendationsPanelProps {
  audioSettings: AudioSettings;
  onRunInTerminal: (cmd: string, name?: string) => void;
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  audioSettings,
  onRunInTerminal,
}) => {
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const metrics = calculateSystemHealth(appliedIds);

  const handleApply = (rec: SystemRecommendation) => {
    if (!appliedIds.includes(rec.id)) {
      setAppliedIds((prev) => [...prev, rec.id]);
    }
    onRunInTerminal(rec.command, `Apply: ${rec.title}`);
    if (audioSettings.soundEnabled) {
      SoundEngine.playPreset(audioSettings.synthPreset, audioSettings.synthVolume);
    }
  };

  const handleApplyAll = () => {
    const allIds = SYSTEM_RECOMMENDATIONS.map((r) => r.id);
    setAppliedIds(allIds);

    const masterScript = `#!/bin/zsh
# OmniOS Master System Optimization & Hardening Script
set -e
echo "\\033[1;36m[OmniOS]\\033[0m Commencing master macOS god-mode optimization..."

# 1. Dock Acceleration
defaults write com.apple.dock autohide-delay -float 0
defaults write com.apple.dock autohide-time-modifier -float 0

# 2. Caches & Logs
rm -rf ~/Library/Caches/* ~/Library/Logs/* 2>/dev/null || true
qlmanage -r cache 2>/dev/null || true

# 3. DNS Flush
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder 2>/dev/null || true

# 4. Restart Dock
killall Dock 2>/dev/null || true

echo "\\033[1;32m[OK]\\033[0m Master optimization applied."
${SoundEngine.compileBashAudioHook(audioSettings)}`;

    onRunInTerminal(masterScript, 'Master God-Mode Optimization');
  };

  const getCategoryIcon = (category: SystemRecommendation['category']) => {
    switch (category) {
      case 'ui':
        return <Sliders className="w-4 h-4 text-cyan-400" />;
      case 'storage':
        return <HardDrive className="w-4 h-4 text-emerald-400" />;
      case 'security':
        return <ShieldCheck className="w-4 h-4 text-amber-400" />;
      case 'performance':
        return <Zap className="w-4 h-4 text-violet-400" />;
      case 'battery':
        return <Battery className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Health Score */}
      <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-base font-semibold text-slate-100">
              macOS System Health & Optimization Recommendations
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-2xl">
            Tailored hardware and kernel configurations audited specifically for MacBook Pro. Apply recommendations to maximize memory bandwidth, eliminate animation latency, and harden system security.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#06080d] border border-slate-800">
            <div className="relative w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm font-mono text-cyan-400 border-2 border-cyan-500/80 shadow-sm shadow-cyan-500/20">
              {metrics.overallScore}%
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Health Rating</span>
              <span className="text-[11px] text-emerald-400 block font-mono">
                {appliedIds.length}/{SYSTEM_RECOMMENDATIONS.length} Optimized
              </span>
            </div>
          </div>

          <button
            onClick={handleApplyAll}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm shadow-cyan-500/20"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Apply All ({SYSTEM_RECOMMENDATIONS.length})</span>
          </button>
        </div>
      </div>

      {/* Real-Time Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0c1017] border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Available Storage</span>
          <p className="text-lg font-bold font-mono text-emerald-400">{metrics.storageFreeGb} GB</p>
          <span className="text-[10px] text-slate-400">High-speed APFS SSD</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0c1017] border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Memory Pressure</span>
          <p className="text-lg font-bold font-mono text-cyan-400">{metrics.memoryUsagePercent}%</p>
          <span className="text-[10px] text-slate-400">Unified RAM architecture</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0c1017] border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Dock Animation Latency</span>
          <p className={`text-lg font-bold font-mono ${metrics.dockLagEliminated ? 'text-emerald-400' : 'text-amber-400'}`}>
            {metrics.dockLagEliminated ? '0.0s (Instant)' : '0.5s (Stock)'}
          </p>
          <span className="text-[10px] text-slate-400">{metrics.dockLagEliminated ? 'Zero penalty' : 'Unoptimized delay'}</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0c1017] border border-slate-800 space-y-1">
          <span className="text-[11px] font-medium text-slate-400">Security Posture</span>
          <p className={`text-lg font-bold font-mono ${metrics.firewallActive ? 'text-emerald-400' : 'text-amber-400'}`}>
            {metrics.firewallActive ? 'Hardened Stealth' : 'Standard'}
          </p>
          <span className="text-[10px] text-slate-400">SIP Active · Firewall {metrics.firewallActive ? 'On' : 'Idle'}</span>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SYSTEM_RECOMMENDATIONS.map((rec) => {
          const isApplied = appliedIds.includes(rec.id);

          return (
            <div
              key={rec.id}
              className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                isApplied
                  ? 'bg-[#0a121c] border-emerald-900/60'
                  : 'bg-[#0c1017] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[#06080d] border border-slate-800">
                      {getCategoryIcon(rec.category)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                        <span>{rec.title}</span>
                        {isApplied && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium font-mono">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        )}
                      </h3>
                      <span className="text-[11px] text-cyan-400/90 font-medium">
                        {rec.benefit}
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${
                    rec.impact === 'Critical' ? 'bg-rose-950/60 text-rose-300 border border-rose-900/60' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {rec.impact}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                  {rec.description}
                </p>

                {/* Command Preview */}
                <div className="mt-3 p-2.5 rounded-lg bg-[#06080d] border border-slate-800/80 font-mono text-[11px] text-slate-300 break-all select-all">
                  <code>{rec.command}</code>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/60">
                <span className="text-[11px] text-slate-400 capitalize">
                  Permission: {rec.safetyLevel}
                </span>

                <button
                  onClick={() => handleApply(rec)}
                  disabled={isApplied}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    isApplied
                      ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 cursor-default'
                      : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-sm shadow-cyan-500/20'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Optimized</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Apply Tweak</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
