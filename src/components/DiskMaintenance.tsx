import React, { useState } from 'react';
import { 
  HardDrive, 
  Clock, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  Play, 
  Calendar,
  Layers
} from 'lucide-react';
import { DiskMaintenanceConfig, AudioSettings } from '../types';
import { 
  generateDiskMaintenanceScript, 
  generateLaunchAgentPlist 
} from '../utils/macCommands';

interface DiskMaintenanceProps {
  audioSettings: AudioSettings;
  onRunInTerminal: (cmd: string, name?: string) => void;
}

export const DiskMaintenance: React.FC<DiskMaintenanceProps> = ({
  audioSettings,
  onRunInTerminal,
}) => {
  const [config, setConfig] = useState<DiskMaintenanceConfig>({
    purgeUserCaches: true,
    purgeSystemLogs: true,
    purgeXcodeDerivedData: true,
    purgeHomebrew: true,
    purgeTrash: false,
    purgeQuickLook: true,
    minAuditSizeGb: 1,
    schedule: {
      type: 'daily',
      hour: 3,
      minute: 0,
      weekday: 1,
      intervalHours: 6,
    },
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const updateProp = <K extends keyof DiskMaintenanceConfig>(key: K, value: DiskMaintenanceConfig[K]) => {
    setConfig({ ...config, [key]: value });
  };

  const updateSchedule = (key: keyof DiskMaintenanceConfig['schedule'], value: unknown) => {
    setConfig({
      ...config,
      schedule: {
        ...config.schedule,
        [key]: value,
      },
    });
  };

  const handleCopy = (content: string, key: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownload = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const cleanScript = generateDiskMaintenanceScript(config, audioSettings);
  const launchAgentPlist = generateLaunchAgentPlist(config.schedule);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-[#0c1017] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <span>Automated Disk Maintenance & Storage Dispatcher</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit massive files, purge cache backlogs, and compile native launchd LaunchAgent XML daemons for background scheduling.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownload(cleanScript, 'omnios_disk_cleanup.sh', 'text/x-shellscript')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/60"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Clean Script</span>
          </button>
          <button
            onClick={() => handleDownload(launchAgentPlist, 'com.omnios.optimizer.plist', 'application/x-plist')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm shadow-cyan-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Compile .plist Agent</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Storage Audit & Selection Matrix (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-cyan-400" />
              <span>Target Cache & Disk Paths to Purge</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[
                {
                  key: 'purgeUserCaches' as const,
                  label: 'User Cache Directory',
                  path: '~/Library/Caches/*',
                  desc: 'Browser temp buffers, Spotify cache, Slack media.',
                },
                {
                  key: 'purgeSystemLogs' as const,
                  label: 'Crash & Diagnostic Logs',
                  path: '~/Library/Logs/*',
                  desc: 'Accumulated .ips diagnostic logs and system traces.',
                },
                {
                  key: 'purgeXcodeDerivedData' as const,
                  label: 'Xcode DerivedData',
                  path: '~/Library/Developer/Xcode/*',
                  desc: 'Orphaned intermediate build objects & index caches.',
                },
                {
                  key: 'purgeHomebrew' as const,
                  label: 'Homebrew Downloads',
                  path: 'brew cleanup -s',
                  desc: 'Old bottle tarballs and obsolete formulas.',
                },
                {
                  key: 'purgeQuickLook' as const,
                  label: 'QuickLook Thumbnail Cache',
                  path: 'qlmanage -r cache',
                  desc: 'Flushes stale thumbnail previews and restarts daemon.',
                },
                {
                  key: 'purgeTrash' as const,
                  label: 'Empty macOS Trash',
                  path: '~/.Trash/*',
                  desc: 'Permanently removes pending items from Trash.',
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    config[item.key]
                      ? 'bg-cyan-950/20 border-cyan-800/60 text-slate-100'
                      : 'bg-[#06080d] border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={config[item.key]}
                    onChange={(e) => updateProp(item.key, e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded bg-slate-900 border-slate-700 text-cyan-400 focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-semibold block">{item.label}</span>
                    <span className="text-[10px] font-mono text-cyan-400/80 block mt-0.5">
                      {item.path}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-1">
                      {item.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            {/* Massive Files Filter */}
            <div className="pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-2">
                <span>Filter Massive Files Greater Than</span>
                <span className="font-mono text-cyan-400">{config.minAuditSizeGb} GB</span>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 5, 10].map((gb) => (
                  <button
                    key={gb}
                    onClick={() => updateProp('minAuditSizeGb', gb)}
                    className={`px-3 py-1 text-xs font-medium rounded-md border transition-all ${
                      config.minAuditSizeGb === gb
                        ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200'
                        : 'border-slate-800 bg-[#06080d] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    &gt; {gb} GB
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* launchd Scheduling Node Card */}
          <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Background launchd Schedule Dispatcher</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['daily', 'weekly', 'hourly'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => updateSchedule('type', type)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    config.schedule.type === type
                      ? 'bg-cyan-950/40 border-cyan-800/80 text-cyan-200 shadow-sm'
                      : 'bg-[#06080d] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs font-semibold capitalize block">{type} Schedule</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {type === 'daily' && 'Run every day at fixed time'}
                    {type === 'weekly' && 'Run on selected weekday'}
                    {type === 'hourly' && 'Repeat every X hours'}
                  </span>
                </button>
              ))}
            </div>

            {/* Time Configuration */}
            {config.schedule.type === 'daily' && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Hour (24h)</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={config.schedule.hour}
                    onChange={(e) => updateSchedule('hour', Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#06080d] border border-slate-700 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Minute</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={config.schedule.minute}
                    onChange={(e) => updateSchedule('minute', Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#06080d] border border-slate-700 text-slate-100 font-mono"
                  />
                </div>
              </div>
            )}

            {config.schedule.type === 'weekly' && (
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Weekday</label>
                  <select
                    value={config.schedule.weekday ?? 1}
                    onChange={(e) => updateSchedule('weekday', Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#06080d] border border-slate-700 text-slate-100"
                  >
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                    <option value="0">Sunday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Hour</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={config.schedule.hour}
                    onChange={(e) => updateSchedule('hour', Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#06080d] border border-slate-700 text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Minute</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={config.schedule.minute}
                    onChange={(e) => updateSchedule('minute', Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-[#06080d] border border-slate-700 text-slate-100 font-mono"
                  />
                </div>
              </div>
            )}

            {config.schedule.type === 'hourly' && (
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1.5">
                  <span>Interval in Hours</span>
                  <span className="font-mono text-cyan-400">{config.schedule.intervalHours} hours</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="24"
                  value={config.schedule.intervalHours}
                  onChange={(e) => updateSchedule('intervalHours', Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            )}
          </div>
        </div>

        {/* Code & Deployment Instructions Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* LaunchAgent Plist Preview */}
          <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Compiled LaunchAgent XML (.plist)</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(launchAgentPlist, 'plist')}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-100"
                >
                  {copiedKey === 'plist' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'plist' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <pre className="p-3 rounded-lg bg-[#06080d] border border-slate-800 text-[11px] font-mono text-amber-300/90 max-h-52 overflow-y-auto whitespace-pre leading-relaxed">
              {launchAgentPlist}
            </pre>

            {/* Native Launchctl Setup Guide */}
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300 space-y-2">
              <p className="font-semibold text-cyan-300">How to Activate Background Daemon in macOS:</p>
              <ol className="list-decimal list-inside space-y-1 text-slate-400 font-mono">
                <li>mkdir -p ~/Library/LaunchAgents</li>
                <li>cp com.omnios.optimizer.plist ~/Library/LaunchAgents/</li>
                <li>launchctl load -w ~/Library/LaunchAgents/com.omnios.optimizer.plist</li>
              </ol>
            </div>
          </div>

          {/* Clean Script Quick Action */}
          <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Compiled Clean Script</span>
              </h3>
              <button
                onClick={() => onRunInTerminal(cleanScript, 'Automated Disk Clean Sequence')}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Run in Simulator</span>
              </button>
            </div>

            <pre className="p-3 rounded-lg bg-[#06080d] border border-slate-800 text-[11px] font-mono text-slate-300 max-h-40 overflow-y-auto whitespace-pre leading-relaxed">
              {cleanScript}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
