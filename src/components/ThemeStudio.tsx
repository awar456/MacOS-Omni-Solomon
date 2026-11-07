import React, { useState } from 'react';
import { 
  Download, 
  Terminal, 
  Copy, 
  Check, 
  Play, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { ThemeConfig, AudioSettings } from '../types';
import { 
  generateTerminalPlist, 
  generateITermColors, 
  generateThemeInstallerScript 
} from '../utils/macCommands';

interface ThemeStudioProps {
  theme: ThemeConfig;
  onChangeTheme: (theme: ThemeConfig) => void;
  audioSettings: AudioSettings;
  onRunInTerminal: (cmd: string, name?: string) => void;
}

export const ThemeStudio: React.FC<ThemeStudioProps> = ({
  theme,
  onChangeTheme,
  audioSettings,
  onRunInTerminal,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const presetColors = [
    { name: 'Electric Cyan', hex: '#06b6d4' },
    { name: 'Cyber Emerald', hex: '#10b981' },
    { name: 'Solar Amber', hex: '#f59e0b' },
    { name: 'Neon Violet', hex: '#8b5cf6' },
    { name: 'Crimson Matrix', hex: '#ef4444' },
    { name: 'Ghost White', hex: '#f8fafc' },
  ];

  const fonts = [
    'JetBrains Mono',
    'SF Mono',
    'Menlo',
    'Fira Code',
    'Monaco',
    'Hack',
  ];

  const updateProp = <K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]) => {
    onChangeTheme({ ...theme, [key]: value });
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

  const handleCopyScript = (content: string, type: string) => {
    navigator.clipboard.writeText(content);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const installerScript = generateThemeInstallerScript(theme, audioSettings);
  const terminalPlist = generateTerminalPlist(theme);
  const itermColors = generateITermColors(theme);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-[#0c1017] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>macOS Theme & Dock Personalization Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Compile native Apple Terminal profiles, iTerm2 colors, and Dock plist preferences into one-click installers.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleDownload(terminalPlist, 'OmniOS_Obsidian.terminal', 'application/x-plist')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/60"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.terminal Plist</span>
          </button>

          <button
            onClick={() => handleDownload(itermColors, 'OmniOS_Obsidian.itermcolors', 'application/x-plist')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700/60"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.itermcolors</span>
          </button>

          <button
            onClick={() => handleDownload(installerScript, 'install_omnios_theme.command', 'text/x-shellscript')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm shadow-cyan-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Compile Installer (.command)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Color & Font Card */}
          <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Accent Palette & Typography</span>
            </h3>

            {/* Accent Color Presets */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                System Accent Color
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {presetColors.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => updateProp('accentColor', color.hex)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      theme.accentColor === color.hex
                        ? 'border-cyan-400 bg-slate-800/90 text-slate-100 shadow-sm'
                        : 'border-slate-800 bg-[#06080d] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span>{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Font Family & Size Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Terminal Font Family
                </label>
                <select
                  value={theme.terminalFont}
                  onChange={(e) => updateProp('terminalFont', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#06080d] border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  {fonts.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1.5">
                  <span>Font Size</span>
                  <span className="font-mono text-cyan-400">{theme.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="11"
                  max="20"
                  step="1"
                  value={theme.fontSize}
                  onChange={(e) => updateProp('fontSize', Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>

            {/* Opacity & Blur Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1.5">
                  <span>Window Opacity</span>
                  <span className="font-mono text-cyan-400">{Math.round(theme.windowOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.6"
                  max="1.0"
                  step="0.02"
                  value={theme.windowOpacity}
                  onChange={(e) => updateProp('windowOpacity', Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1.5">
                  <span>Window Blur</span>
                  <span className="font-mono text-cyan-400">{theme.windowBlur}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={theme.windowBlur}
                  onChange={(e) => updateProp('windowBlur', Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Dock Speed & Preference Matrix Card */}
          <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>macOS Dock Speed & Preference Matrix</span>
            </h3>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1.5">
                  <span>Autohide Speed</span>
                  <span className="font-mono text-cyan-400">{theme.dockAutohideSpeed}s</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={theme.dockAutohideSpeed}
                  onChange={(e) => updateProp('dockAutohideSpeed', Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <span className="text-[10px] text-slate-400">0s is instant zero-delay</span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1.5">
                  <span>Autohide Delay</span>
                  <span className="font-mono text-cyan-400">{theme.dockAutohideDelay}s</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.8"
                  step="0.05"
                  value={theme.dockAutohideDelay}
                  onChange={(e) => updateProp('dockAutohideDelay', Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
                <span className="text-[10px] text-slate-400">Delay before animation begins</span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1.5">
                  <span>Mission Control Speed</span>
                  <span className="font-mono text-cyan-400">{theme.missionControlSpeed}s</span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.4"
                  step="0.02"
                  value={theme.missionControlSpeed}
                  onChange={(e) => updateProp('missionControlSpeed', Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1.5">
                  <span>Dock Tile Size</span>
                  <span className="font-mono text-cyan-400">{theme.dockTileSize}px</span>
                </div>
                <input
                  type="range"
                  min="24"
                  max="96"
                  step="4"
                  value={theme.dockTileSize}
                  onChange={(e) => updateProp('dockTileSize', Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>

            {/* Selectors and Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Minimize Animation
                </label>
                <select
                  value={theme.minimizeEffect}
                  onChange={(e) => updateProp('minimizeEffect', e.target.value as 'genie' | 'scale' | 'suck')}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#06080d] border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="genie">Genie (Default)</option>
                  <option value="scale">Scale</option>
                  <option value="suck">Suck (Secret Vortex)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Dock Screen Position
                </label>
                <select
                  value={theme.dockPosition}
                  onChange={(e) => updateProp('dockPosition', e.target.value as 'bottom' | 'left' | 'right')}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#06080d] border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="bottom">Bottom Edge</option>
                  <option value="left">Left Edge</option>
                  <option value="right">Right Edge</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={theme.showRecentApps}
                    onChange={(e) => updateProp('showRecentApps', e.target.checked)}
                    className="w-4 h-4 rounded bg-[#06080d] border-slate-700 text-cyan-400 focus:ring-0"
                  />
                  <span className="text-xs font-medium text-slate-300">Show Recent Apps</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview & Compilation Code Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live macOS Preview Card */}
          <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center justify-between">
              <span>Real-Time macOS Layout Preview</span>
              <span className="text-[11px] font-mono text-cyan-400">WYSIWYG</span>
            </h3>

            {/* Simulated Desktop Preview Box */}
            <div className="relative w-full h-56 rounded-lg overflow-hidden bg-gradient-to-b from-[#090e17] to-[#04060a] border border-slate-800 flex flex-col justify-between p-3 select-none">
              {/* Simulated Window Frame */}
              <div 
                style={{ 
                  opacity: theme.windowOpacity, 
                  backdropFilter: `blur(${theme.windowBlur / 5}px)` 
                }}
                className="w-4/5 mx-auto h-28 rounded-md bg-[#0d121c]/90 border border-slate-700/60 shadow-lg p-2.5 flex flex-col font-mono text-[10px]"
              >
                <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-800/80">
                  <span className="w-2 h-2 rounded-full bg-rose-500/80" />
                  <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-slate-400">Terminal · {theme.terminalFont} ({theme.fontSize}px)</span>
                </div>
                <div className="pt-2 text-slate-300 leading-tight">
                  <p><span className="text-emerald-400">mbp@omnios</span>:<span className="text-cyan-400">~</span>$ defaults write</p>
                  <p style={{ color: theme.accentColor }}>[OK] Profile: {theme.activeProfileName || 'Obsidian'}</p>
                </div>
              </div>

              {/* Simulated Dock */}
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                  {['Finder', 'Terminal', 'Safari', 'Code', 'Slack'].map((app, idx) => (
                    <div
                      key={app}
                      style={{ width: `${Math.min(theme.dockTileSize / 2, 32)}px`, height: `${Math.min(theme.dockTileSize / 2, 32)}px` }}
                      className="rounded-lg bg-gradient-to-tr from-slate-700 to-slate-500 flex items-center justify-center text-[9px] text-white font-bold shadow-sm"
                      title={app}
                    >
                      {app[0]}
                    </div>
                  ))}
                  {theme.showRecentApps && (
                    <>
                      <div className="w-[1px] h-5 bg-white/20 mx-0.5" />
                      <div
                        style={{ width: `${Math.min(theme.dockTileSize / 2, 32)}px`, height: `${Math.min(theme.dockTileSize / 2, 32)}px` }}
                        className="rounded-lg bg-cyan-700/80 flex items-center justify-center text-[9px] text-cyan-200 font-bold"
                        title="Recent"
                      >
                        R
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Compiled Script Box */}
          <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300">
                Compiled .command Script
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyScript(installerScript, 'installer')}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-100"
                >
                  {copiedType === 'installer' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedType === 'installer' ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={() => onRunInTerminal(installerScript, 'Theme & Dock Installation')}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Test in Simulator</span>
                </button>
              </div>
            </div>

            <pre className="p-3 rounded-lg bg-[#06080d] border border-slate-800 text-[11px] font-mono text-cyan-300/90 max-h-48 overflow-y-auto whitespace-pre leading-relaxed">
              {installerScript}
            </pre>
            <p className="text-[11px] text-slate-400">
              Run locally: <code className="text-slate-300">chmod +x install_omnios_theme.command && ./install_omnios_theme.command</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
