import React, { useState } from 'react';
import { 
  Trash2, 
  Search, 
  ShieldCheck, 
  AlertTriangle, 
  Play, 
  Copy, 
  Check, 
  Download, 
  Layers
} from 'lucide-react';
import { UninstallerTarget, AudioSettings } from '../types';
import { PRESET_UNINSTALL_TARGETS, generateDeepUninstallScript } from '../utils/macCommands';

interface DeepUninstallerProps {
  audioSettings: AudioSettings;
  onRunInTerminal: (cmd: string, name?: string) => void;
}

export const DeepUninstaller: React.FC<DeepUninstallerProps> = ({
  audioSettings,
  onRunInTerminal,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<UninstallerTarget>(PRESET_UNINSTALL_TARGETS[0]);
  const [isCustomApp, setIsCustomApp] = useState(false);
  const [customAppName, setCustomAppName] = useState('');
  const [customBundleId, setCustomBundleId] = useState('');
  const [dryRun, setDryRun] = useState(true);
  const [copied, setCopied] = useState(false);

  const activeTarget: UninstallerTarget = isCustomApp
    ? {
        id: 'custom-app',
        name: customAppName || 'Custom Application',
        appName: customAppName || 'CustomApp',
        bundleId: customBundleId || `com.developer.${(customAppName || 'app').toLowerCase().replace(/\s+/g, '')}`,
        vendor: 'Custom Local Software',
      }
    : selectedTarget;

  const script = generateDeepUninstallScript(activeTarget, dryRun, audioSettings);

  const handleCopy = () => {
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([script], { type: 'text/x-shellscript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uninstall_${activeTarget.appName.toLowerCase().replace(/\s+/g, '_')}.command`;
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
            <Trash2 className="w-4 h-4 text-cyan-400" />
            <span>Automated Application Deep-Uninstaller Module</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dynamically generate recursive zsh removal commands targeting deep-seated system files, application support containers, caches, and orphaned preferences.
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
        {/* App Selector Column (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">
                Select Application to Purge
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setIsCustomApp(false)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    !isCustomApp ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60' : 'text-slate-400'
                  }`}
                >
                  Preset Library
                </button>
                <button
                  onClick={() => setIsCustomApp(true)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    isCustomApp ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60' : 'text-slate-400'
                  }`}
                >
                  Custom App
                </button>
              </div>
            </div>

            {/* Presets List */}
            {!isCustomApp ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {PRESET_UNINSTALL_TARGETS.map((target) => {
                  const isSelected = selectedTarget.id === target.id;
                  return (
                    <button
                      key={target.id}
                      onClick={() => setSelectedTarget(target)}
                      className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? 'bg-cyan-950/40 border-cyan-700/80 text-cyan-200 shadow-sm'
                          : 'bg-[#06080d] border-slate-800/80 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-semibold">{target.name}</span>
                      <span className="text-[10px] font-mono text-cyan-400/80 truncate w-full mt-0.5">
                        {target.bundleId}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">{target.vendor}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Custom App Inputs */
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Application Name (e.g. Notion, Figma, Telegram)
                  </label>
                  <input
                    type="text"
                    value={customAppName}
                    onChange={(e) => setCustomAppName(e.target.value)}
                    placeholder="Application Name"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-[#06080d] border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    macOS Bundle Identifier (optional, auto-derived if empty)
                  </label>
                  <input
                    type="text"
                    value={customBundleId}
                    onChange={(e) => setCustomBundleId(e.target.value)}
                    placeholder="com.vendor.appname"
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-[#06080d] border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            )}

            {/* Mode Switcher: Dry-Run vs Wipe */}
            <div className="pt-3 border-t border-slate-800/80">
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Execution Safety Protocol
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDryRun(true)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    dryRun
                      ? 'bg-emerald-950/40 border-emerald-700 text-emerald-200 shadow-sm'
                      : 'bg-[#06080d] border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Dry-Run Inspection</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Safely inspects disk and counts leftover containers without deleting.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDryRun(false)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    !dryRun
                      ? 'bg-rose-950/40 border-rose-700 text-rose-200 shadow-sm'
                      : 'bg-[#06080d] border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-rose-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Permanent Wipe</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Recursively deletes all app files, sandboxes, caches, and plists.
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Targeted Deep Paths & Generated Script (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Deep Container Paths for: {activeTarget.name}</span>
            </h3>

            <div className="p-3 rounded-lg bg-[#06080d] border border-slate-800/80 font-mono text-[11px] space-y-1 text-slate-400">
              <p className="text-slate-200">/Applications/{activeTarget.appName}.app</p>
              <p>~/Library/Application Support/{activeTarget.appName}</p>
              <p>~/Library/Caches/{activeTarget.bundleId}</p>
              <p>~/Library/Containers/{activeTarget.bundleId}</p>
              <p>~/Library/Preferences/{activeTarget.bundleId}.plist</p>
              <p>~/Library/Saved Application State/{activeTarget.bundleId}.savedState</p>
              <p>~/Library/LaunchAgents/*{activeTarget.bundleId}*</p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300">
                Generated Zsh Deep Uninstall Script
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
                  onClick={() => onRunInTerminal(script, `Deep Uninstall: ${activeTarget.name}`)}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Test in Simulator</span>
                </button>
              </div>
            </div>

            <pre className="p-3 rounded-lg bg-[#06080d] border border-slate-800 text-[11px] font-mono text-cyan-300/90 max-h-56 overflow-y-auto whitespace-pre leading-relaxed">
              {script}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
