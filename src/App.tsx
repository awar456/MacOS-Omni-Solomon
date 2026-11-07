import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ApiKeyModal } from './components/ApiKeyModal';
import { TerminalEmulator } from './components/TerminalEmulator';
import { CommandRepository } from './components/CommandRepository';
import { ThemeStudio } from './components/ThemeStudio';
import { DiskMaintenance } from './components/DiskMaintenance';
import { CloudSync } from './components/CloudSync';
import { DeepUninstaller } from './components/DeepUninstaller';
import { SecurityAuditor } from './components/SecurityAuditor';
import { AudioEnginePanel } from './components/AudioEnginePanel';
import { AiCompiler } from './components/AiCompiler';
import { RecommendationsPanel } from './components/RecommendationsPanel';
import { ChatbotPanel } from './components/ChatbotPanel';
import { VoiceLivePanel } from './components/VoiceLivePanel';
import { ThemeConfig, AudioSettings, TerminalLogEntry } from './types';
import { SoundEngine } from './utils/soundEngine';

const DEFAULT_THEME: ThemeConfig = {
  accentColor: '#06b6d4',
  terminalFont: 'JetBrains Mono',
  fontSize: 13,
  windowOpacity: 0.92,
  windowBlur: 20,
  dockAutohideSpeed: 0.0,
  dockAutohideDelay: 0.0,
  missionControlSpeed: 0.12,
  dockTileSize: 48,
  minimizeEffect: 'suck',
  showRecentApps: false,
  dockPosition: 'bottom',
  activeProfileName: 'Obsidian God-Mode'
};

const DEFAULT_AUDIO: AudioSettings = {
  soundEnabled: true,
  synthPreset: 'obsidian',
  synthVolume: 0.7,
  voiceEnabled: true,
  speechVoice: 'Samantha',
  speechRate: 175,
  speechPitch: 1.0,
  completionMessage: 'OmniOS task complete. System operating at peak performance.'
};

const INITIAL_LOGS: TerminalLogEntry[] = [
  {
    id: 'log-1',
    type: 'system',
    content: 'OmniOS God-Mode System Controller initialized on macOS Darwin (Apple Silicon / arm64).',
    timestamp: new Date().toLocaleTimeString(),
  },
  {
    id: 'log-2',
    type: 'output',
    content: 'Kernel: Darwin 24.1.0 Darwin Kernel Version; root:xnu-11215.1.10~2/RELEASE_ARM64_T6000 arm64\nSecurity modules loaded: Gatekeeper, SIP, ApplicationFirewall, FileVault XTS-AES.',
    timestamp: new Date().toLocaleTimeString(),
  },
  {
    id: 'log-3',
    type: 'success',
    content: 'Client-side memory sandbox active. Zero external telemetry. High-speed local cache initialized.',
    timestamp: new Date().toLocaleTimeString(),
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [apiKey, setApiKey] = useState('');
  const [hasServerKey, setHasServerKey] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [audioSettings, setAudioSettings] = useState<AudioSettings>(DEFAULT_AUDIO);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLogEntry[]>(INITIAL_LOGS);

  // Load API key from localStorage and check backend status
  useEffect(() => {
    try {
      const storedKey = localStorage.getItem('omnios_gemini_api_key');
      if (storedKey) setApiKey(storedKey);
    } catch {
      // Ignore localStorage read errors in iframe
    }

    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.hasServerApiKey) {
          setHasServerKey(true);
        }
      })
      .catch(() => {
        // Backend offline or running purely client-side
      });
  }, []);

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    try {
      localStorage.setItem('omnios_gemini_api_key', newKey);
    } catch {
      // Ignore storage errors
    }
  };

  const addLog = useCallback((type: TerminalLogEntry['type'], content: string) => {
    setTerminalLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type,
        content,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  }, []);

  // Interactive Command Execution Simulation
  const executeTerminalCommand = useCallback((cmdString: string, label?: string) => {
    const raw = cmdString.trim();
    if (!raw) return;

    addLog('input', raw);

    if (raw === 'clear') {
      setTerminalLogs([]);
      return;
    }

    if (raw === 'help') {
      addLog(
        'output',
        `OmniOS Built-in Shell Utility Commands:
  help       - Display this command index
  clear      - Clear terminal history buffer
  audit      - Run comprehensive local system security audit
  status     - Show hardware and battery telemetry status
  whoami     - Print current macOS terminal user
  uname -a   - Print Darwin kernel architecture
  ports      - Scan open listening TCP ports
  clean      - Simulate cache and temporary logs cleanup`
      );
      return;
    }

    if (raw === 'whoami') {
      addLog('output', 'mbp_admin (Staff / wheel group)');
      return;
    }

    if (raw === 'uname -a') {
      addLog('output', 'Darwin mbp-workstation.local 24.1.0 Darwin Kernel Version 24.1.0 arm64');
      return;
    }

    if (raw === 'ports') {
      addLog(
        'output',
        `COMMAND   PID    USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
ControlCe 482 mbp_admin  12u  IPv4 0x8a92f8cb39d2   0t0  TCP *:7000 (LISTEN)
node      1420 mbp_admin  23u  IPv4 0x8a92f8cb4120   0t0  TCP *:3000 (LISTEN)
postgres  8920 _postgres  5u  IPv4 0x8a92f8cb88f0   0t0  TCP *:5432 (LISTEN)`
      );
      return;
    }

    if (raw === 'audit') {
      addLog(
        'output',
        `[AUDIT] macOS System Security Matrix:
  ✓ Application Firewall: ENABLED (Stealth Mode Active)
  ✓ FileVault: ON (Hardware XTS-AES 256-bit)
  ✓ System Integrity Protection (SIP): ENABLED
  ✓ Gatekeeper: ASSESSMENTS ENABLED
  ✓ File Sharing: 0 public guest shares active`
      );
      addLog('success', 'Local system integrity audit: 100% COMPLIANT.');
      return;
    }

    // Multi-line script execution simulator
    if (raw.includes('\n')) {
      const lines = raw.split('\n').filter((l) => l.trim() && !l.startsWith('#'));
      addLog('system', `Executing batch routine: ${label || 'Custom Script'} (${lines.length} tasks)...`);

      let step = 1;
      lines.slice(0, 8).forEach((line, index) => {
        setTimeout(() => {
          if (line.includes('rm -rf') || line.includes('cleanup')) {
            addLog('output', `[Task ${step}] Discarding cache artifacts: ${line.substring(0, 48)}...`);
          } else if (line.includes('defaults write')) {
            addLog('output', `[Task ${step}] Applied plist preference: ${line.split('write')[1]?.trim() || line}`);
          } else if (line.includes('killall')) {
            addLog('output', `[Task ${step}] Signaled daemon restart: ${line}`);
          } else if (line.includes('sharing') || line.includes('lsof') || line.includes('csrutil')) {
            addLog('output', `[Task ${step}] Diagnostic check output returned: NORMAL / HEALTHY`);
          } else {
            addLog('output', `[Task ${step}] Executed: ${line}`);
          }
          step++;

          if (index === Math.min(lines.length - 1, 7)) {
            addLog('success', `Routine '${label || 'Task'}' successfully finished.`);
            if (audioSettings.soundEnabled) {
              SoundEngine.playPreset(audioSettings.synthPreset, audioSettings.synthVolume);
            }
          }
        }, (index + 1) * 350);
      });
      return;
    }

    // Single command execution
    setTimeout(() => {
      if (raw.includes('defaults write')) {
        addLog('success', 'defaults: Plist updated. Run `killall Dock` or `killall Finder` to apply.');
      } else if (raw.includes('killall')) {
        const proc = raw.split('killall')[1]?.trim() || 'Process';
        addLog('success', `killall: Restarted ${proc} daemon successfully.`);
      } else if (raw.includes('purge') || raw.includes('rm -rf')) {
        addLog('success', 'Purge complete: Reclaimed temporary cache space from disk.');
      } else if (raw.includes('socketfilterfw')) {
        addLog('output', 'Application Firewall: is enabled (Stealth mode enabled)');
      } else if (raw.includes('fdesetup status')) {
        addLog('output', 'FileVault is On.');
      } else if (raw.includes('csrutil status')) {
        addLog('output', 'System Integrity Protection status: enabled.');
      } else if (raw.includes('spctl --status')) {
        addLog('output', 'assessments enabled');
      } else if (raw.includes('dscacheutil')) {
        addLog('success', 'DNS resolver cache flushed. mDNSResponder restarted.');
      } else {
        addLog('output', `Execution output simulated for: ${raw}`);
      }

      if (audioSettings.soundEnabled) {
        SoundEngine.playPreset(audioSettings.synthPreset, audioSettings.synthVolume);
      }
    }, 250);
  }, [addLog, audioSettings]);

  return (
    <div className="min-h-screen bg-[#06080d] text-slate-100 flex flex-col font-sans">
      {/* Top Header adhering to Top Bar Contract */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        hasApiKey={Boolean(apiKey || hasServerKey)}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* Tab Content Rendering */}
        {activeTab === 'recommendations' && (
          <RecommendationsPanel
            audioSettings={audioSettings}
            onRunInTerminal={(cmd, name) => {
              executeTerminalCommand(cmd, name);
              setActiveTab('terminal');
            }}
          />
        )}

        {activeTab === 'copilot' && (
          <ChatbotPanel
            apiKey={apiKey}
            audioSettings={audioSettings}
            onRunInTerminal={(cmd, name) => {
              executeTerminalCommand(cmd, name);
              setActiveTab('terminal');
            }}
          />
        )}

        {activeTab === 'voice-live' && (
          <VoiceLivePanel
            apiKey={apiKey}
            audioSettings={audioSettings}
            onRunInTerminal={(cmd, name) => {
              executeTerminalCommand(cmd, name);
              setActiveTab('terminal');
            }}
          />
        )}

        {activeTab === 'terminal' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-[#0c1017] border border-slate-800">
              <div>
                <h1 className="text-base font-semibold text-slate-100">
                  Interactive Terminal Simulator
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Colorized command-line log shell with mousepad coordinate emulation and live Darwin execution simulation.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => executeTerminalCommand('audit')}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700/60 transition-colors"
                >
                  Quick Audit
                </button>
                <button
                  onClick={() => executeTerminalCommand('ports')}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700/60 transition-colors"
                >
                  Open Ports
                </button>
                <button
                  onClick={() => executeTerminalCommand('defaults write com.apple.dock autohide-time-modifier -float 0; killall Dock')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-colors shadow-sm shadow-cyan-500/20"
                >
                  Instant Dock (0s)
                </button>
              </div>
            </div>

            <TerminalEmulator
              logs={terminalLogs}
              onExecuteCommand={executeTerminalCommand}
              onClear={() => setTerminalLogs([])}
              accentColor={theme.accentColor}
              fontFamily={theme.terminalFont}
              fontSize={theme.fontSize}
            />
          </div>
        )}

        {activeTab === 'commands' && (
          <CommandRepository
            onRunCommand={(cmd, name) => {
              executeTerminalCommand(cmd, name);
              setActiveTab('terminal');
            }}
          />
        )}

        {activeTab === 'ai-compiler' && (
          <AiCompiler
            apiKey={apiKey}
            audioSettings={audioSettings}
            onRunInTerminal={(cmd, name) => {
              executeTerminalCommand(cmd, name);
              setActiveTab('terminal');
            }}
          />
        )}

        {activeTab === 'theme-studio' && (
          <ThemeStudio
            theme={theme}
            onChangeTheme={setTheme}
            audioSettings={audioSettings}
            onRunInTerminal={(cmd, name) => {
              executeTerminalCommand(cmd, name);
              setActiveTab('terminal');
            }}
          />
        )}

        {activeTab === 'disk-maintenance' && (
          <DiskMaintenance
            audioSettings={audioSettings}
            onRunInTerminal={(cmd, name) => {
              executeTerminalCommand(cmd, name);
              setActiveTab('terminal');
            }}
          />
        )}

        {activeTab === 'uninstaller' && (
          <DeepUninstaller
            audioSettings={audioSettings}
            onRunInTerminal={(cmd, name) => {
              executeTerminalCommand(cmd, name);
              setActiveTab('terminal');
            }}
          />
        )}

        {activeTab === 'cloud-backup' && (
          <CloudSync
            audioSettings={audioSettings}
            onRunInTerminal={(cmd, name) => {
              executeTerminalCommand(cmd, name);
              setActiveTab('terminal');
            }}
          />
        )}

        {activeTab === 'security-audit' && (
          <SecurityAuditor
            audioSettings={audioSettings}
            onRunInTerminal={(cmd, name) => {
              executeTerminalCommand(cmd, name);
              setActiveTab('terminal');
            }}
          />
        )}

        {activeTab === 'audio-engine' && (
          <AudioEnginePanel
            settings={audioSettings}
            onChangeSettings={setAudioSettings}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#080b11] py-4 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>OmniOS God-Mode System Controller · macOS Optimization Engine</span>
          <span className="font-mono text-[11px] text-slate-400">
            Client-side sandbox · Darwin 24.1.0 compatible
          </span>
        </div>
      </footer>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        apiKey={apiKey}
        onSaveKey={handleSaveApiKey}
        hasServerKey={hasServerKey}
      />
    </div>
  );
}
