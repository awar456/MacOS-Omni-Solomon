import React, { useState } from 'react';
import { 
  Cloud, 
  ArrowRight, 
  Copy, 
  Check, 
  Play, 
  FolderSync, 
  Gauge, 
  ShieldCheck,
  Download
} from 'lucide-react';
import { CloudSyncConfig, AudioSettings } from '../types';
import { generateCloudSyncScript } from '../utils/macCommands';

interface CloudSyncProps {
  audioSettings: AudioSettings;
  onRunInTerminal: (cmd: string, name?: string) => void;
}

export const CloudSync: React.FC<CloudSyncProps> = ({
  audioSettings,
  onRunInTerminal,
}) => {
  const [config, setConfig] = useState<CloudSyncConfig>({
    sourcePath: '~/Documents/HeavyProjects',
    targetCloudPath: 'gdrive:MacBook_Vault/Backups_2026',
    tool: 'rclone',
    bandwidthLimit: '25M',
    dryRun: true,
    backupRetentionDays: 30,
    syncExcludes: ['node_modules', '.git', '*.tmp', '.DS_Store'],
  });

  const [copied, setCopied] = useState(false);

  const updateProp = <K extends keyof CloudSyncConfig>(key: K, value: CloudSyncConfig[K]) => {
    setConfig({ ...config, [key]: value });
  };

  const syncScript = generateCloudSyncScript(config, audioSettings);

  const handleCopy = () => {
    navigator.clipboard.writeText(syncScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([syncScript], { type: 'text/x-shellscript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'google_drive_sync.command';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-[#0c1017] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Cloud className="w-4 h-4 text-cyan-400" />
            <span>Google Drive Backup & Cloud Clone Pipeline</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure high-speed command-line sync pipelines (rclone / rsync) to migrate local folders into Google Drive with bandwidth limits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm shadow-cyan-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .command Script</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Wizard Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <FolderSync className="w-4 h-4 text-cyan-400" />
              <span>Migration Path Configuration</span>
            </h3>

            {/* Source and Destination inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Local Source Directory (on MacBook SSD)
                </label>
                <input
                  type="text"
                  value={config.sourcePath}
                  onChange={(e) => updateProp('sourcePath', e.target.value)}
                  placeholder="~/Documents/HeavyProjects"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-lg bg-[#06080d] border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Google Drive Target Remote Path
                </label>
                <input
                  type="text"
                  value={config.targetCloudPath}
                  onChange={(e) => updateProp('targetCloudPath', e.target.value)}
                  placeholder="gdrive:MacBook_Vault/Backups_2026"
                  className="w-full px-3.5 py-2 text-xs font-mono rounded-lg bg-[#06080d] border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Tool & Throttling Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Sync Engine Tool
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateProp('tool', 'rclone')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                      config.tool === 'rclone'
                        ? 'bg-cyan-950/60 border-cyan-800 text-cyan-300'
                        : 'bg-[#06080d] border-slate-800 text-slate-400'
                    }`}
                  >
                    rclone (Recommended)
                  </button>
                  <button
                    onClick={() => updateProp('tool', 'rsync')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                      config.tool === 'rsync'
                        ? 'bg-cyan-950/60 border-cyan-800 text-cyan-300'
                        : 'bg-[#06080d] border-slate-800 text-slate-400'
                    }`}
                  >
                    rsync (Local Drive)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5 flex items-center justify-between">
                  <span>Bandwidth Throttle</span>
                  <span className="font-mono text-cyan-400">{config.bandwidthLimit || 'Unlimited'}</span>
                </label>
                <select
                  value={config.bandwidthLimit}
                  onChange={(e) => updateProp('bandwidthLimit', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#06080d] border border-slate-700 text-slate-100"
                >
                  <option value="10M">10 MB/s (Low CPU / Background)</option>
                  <option value="25M">25 MB/s (Balanced)</option>
                  <option value="50M">50 MB/s (High Speed)</option>
                  <option value="">Unlimited (Max Fiber / Wi-Fi 6E)</option>
                </select>
              </div>
            </div>

            {/* Dry Run Toggle */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.dryRun}
                  onChange={(e) => updateProp('dryRun', e.target.checked)}
                  className="w-4 h-4 rounded bg-[#06080d] border-slate-700 text-cyan-400 focus:ring-0"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-200">
                    Enable Dry-Run Simulation Mode (--dry-run)
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Simulates file transfer operations without moving or deleting actual data on disk.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Generated Pipeline Command (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300">
                Generated Migration Script
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-100"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => onRunInTerminal(syncScript, 'Google Drive Cloud Sync Pipeline')}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Run in Simulator</span>
                </button>
              </div>
            </div>

            <pre className="p-3 rounded-lg bg-[#06080d] border border-slate-800 text-[11px] font-mono text-cyan-300/90 max-h-64 overflow-y-auto whitespace-pre leading-relaxed">
              {syncScript}
            </pre>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-200">How to configure Google Drive on macOS:</p>
              <p>1. Install rclone: <code className="text-cyan-300 font-mono">brew install rclone</code></p>
              <p>2. Link Google Drive remote: <code className="text-cyan-300 font-mono">rclone config</code> (name remote: <code className="text-cyan-300 font-mono">gdrive</code>)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
