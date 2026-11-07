import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Play, 
  Copy, 
  Check, 
  Sparkles, 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  Zap,
  Info
} from 'lucide-react';
import { ChatMessage, CopilotModel, CopilotRole, AudioSettings } from '../types';
import { SoundEngine } from '../utils/soundEngine';

interface ChatbotPanelProps {
  apiKey: string;
  audioSettings: AudioSettings;
  onRunInTerminal: (cmd: string, name?: string) => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-init-1',
    role: 'model',
    content: `Greetings. I am OmniOS God-Mode Systems Copilot, powered by Google Gemini.
I specialize in macOS Darwin internals, Apple Silicon optimization, launchd daemon authoring, and security audits.

How can I assist your MacBook setup today? You can select my active role persona and underlying Gemini model above.`,
    timestamp: new Date().toLocaleTimeString(),
    model: 'gemini-3.8-flash'
  }
];

export const ChatbotPanel: React.FC<ChatbotPanelProps> = ({
  apiKey,
  audioSettings,
  onRunInTerminal,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<CopilotModel>('gemini-3.8-flash');
  const [selectedRole, setSelectedRole] = useState<CopilotRole>('architect');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const prompt = inputText.trim();
    if (!prompt || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString()
    };

    const newThread = [...messages, userMessage];
    setMessages(newThread);
    setInputText('');
    setIsLoading(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      // Convert thread to API format
      const apiMessages = newThread.map((m) => ({
        role: m.role,
        content: m.content
      }));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          messages: apiMessages,
          model: selectedModel,
          role: selectedRole
        })
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const replyText = data.text || 'Command execution routine completed.';
        
        // Extract code snippet if present
        const codeMatch = replyText.match(/```(?:zsh|bash|sh)?([\s\S]*?)```/);
        const codeSnippet = codeMatch ? codeMatch[1].trim() : undefined;

        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-model`,
          role: 'model',
          content: replyText,
          timestamp: new Date().toLocaleTimeString(),
          model: data.modelUsed || selectedModel,
          codeSnippet
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        // Fallback simulated intelligent response
        let fallbackReply = `[OmniOS Local Fallback Mode]\nI analyzed your query regarding: "${prompt}".\n\nHere is the recommended macOS automation command:`;
        let codeSnippet = 'defaults read com.apple.dock';

        if (prompt.toLowerCase().includes('port') || prompt.toLowerCase().includes('network')) {
          codeSnippet = 'lsof -iTCP -sTCP:LISTEN -P -n';
          fallbackReply += `\n\`\`\`zsh\n${codeSnippet}\n\`\`\`\nThis audits all open TCP listening sockets without resolving IP addresses, identifying rogue background daemons.`;
        } else if (prompt.toLowerCase().includes('clean') || prompt.toLowerCase().includes('cache')) {
          codeSnippet = 'rm -rf ~/Library/Caches/* 2>/dev/null && qlmanage -r cache';
          fallbackReply += `\n\`\`\`zsh\n${codeSnippet}\n\`\`\`\nThis purges volatile user caches and resets the QuickLook thumbnail generation cache.`;
        } else {
          codeSnippet = 'system_profiler SPHardwareDataType SPPowerDataType';
          fallbackReply += `\n\`\`\`zsh\n${codeSnippet}\n\`\`\`\nExtracts deep Apple Silicon hardware specifications and battery health cycle metrics.`;
        }

        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now()}-model`,
          role: 'model',
          content: fallbackReply,
          timestamp: new Date().toLocaleTimeString(),
          model: selectedModel,
          codeSnippet
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch {
      // Local fallback
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-model`,
        role: 'model',
        content: `OmniOS Systems Copilot (Offline Mode):
Ready to automate your macOS environment. You can test native commands in the Terminal Simulator directly.`,
        timestamp: new Date().toLocaleTimeString(),
        model: selectedModel,
        codeSnippet: 'defaults write com.apple.dock autohide-delay -float 0; killall Dock'
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
      if (audioSettings.soundEnabled) {
        SoundEngine.playPreset(audioSettings.synthPreset, audioSettings.synthVolume);
      }
    }
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const roles = [
    { id: 'architect' as const, label: 'Principal Systems Architect', icon: Cpu, desc: 'Deep Unix/Darwin, LaunchAgents, and Plists' },
    { id: 'security' as const, label: 'Offensive Security Auditor', icon: ShieldCheck, desc: 'Firewall, Gatekeeper, SIP, and Port Hardening' },
    { id: 'performance' as const, label: 'Apple Silicon Tuner', icon: Zap, desc: 'Unified Memory, Thermals, and Battery' },
  ];

  const models = [
    { id: 'gemini-3.8-flash' as const, label: 'gemini-3.8-flash', desc: 'General Tasks (Default)' },
    { id: 'gemini-3.1-flash-lite' as const, label: 'gemini-3.1-flash-lite', desc: 'Fast Responses' },
    { id: 'gemini-4-argon' as const, label: 'gemini-4-argon', desc: 'Complex Systems Reasoning' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Strip */}
      <div className="p-4 rounded-xl bg-[#0c1017] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span>Multi-Turn Gemini Systems Copilot</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive multi-turn conversation maintaining contextual thread memory. Switch roles and models to match query complexity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMessages(INITIAL_MESSAGES)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors border border-slate-700/60"
            title="Reset conversation thread"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Thread</span>
          </button>
        </div>
      </div>

      {/* Role & Model Switcher Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Role Selector */}
        <div className="p-3.5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 block">
            System Instruction Persona Role:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRole(r.id)}
                  className={`p-2 rounded-lg text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-700 text-cyan-200 shadow-sm'
                      : 'bg-[#06080d] border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs font-semibold truncate">{r.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate mt-1">{r.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Model Selector */}
        <div className="p-3.5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 block">
            Gemini Multimodal Engine Tier:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {models.map((m) => {
              const isSelected = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`p-2 rounded-lg text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-700 text-cyan-200 shadow-sm'
                      : 'bg-[#06080d] border-slate-800/80 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-xs font-mono font-semibold truncate">{m.id.split('-').slice(1).join('-')}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate mt-1">{m.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chat Thread Viewport */}
      <div className="rounded-xl border border-slate-800 bg-[#06080d] flex flex-col h-[520px] overflow-hidden shadow-2xl">
        {/* Messages Thread Container */}
        <div
          ref={scrollRef}
          className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-4"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-4 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-slate-800 border border-slate-700 text-slate-100'
                    : 'bg-[#0c1017] border border-slate-800 text-slate-200 space-y-2'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] text-slate-400 pb-1 border-b border-slate-800/40">
                  <span className="font-semibold uppercase font-mono">
                    {msg.role === 'user' ? 'Operator' : 'OmniOS Copilot'}
                  </span>
                  <div className="flex items-center gap-2">
                    {msg.model && (
                      <span className="text-cyan-400 font-mono">
                        {msg.model}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                <div className="whitespace-pre-wrap font-sans text-xs pt-1">
                  {msg.content}
                </div>

                {/* Interactive Code Action Box if script detected */}
                {msg.codeSnippet && (
                  <div className="mt-3 p-3 rounded-lg bg-[#06080d] border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono text-cyan-400">Executable Script:</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyCode(msg.id, msg.codeSnippet!)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200"
                        >
                          {copiedCodeId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedCodeId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                        <button
                          onClick={() => onRunInTerminal(msg.codeSnippet!, 'Copilot Script Execution')}
                          className="flex items-center gap-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Run in Terminal</span>
                        </button>
                      </div>
                    </div>
                    <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-2 bg-black/40 rounded">
                      {msg.codeSnippet}
                    </pre>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="p-3.5 rounded-xl bg-[#0c1017] border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>OmniOS Copilot synthesizing response using {selectedModel}...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-3 bg-[#0a0e16] border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about macOS automation, kernel flags, launchd daemons, or security..."
            className="flex-1 px-4 py-2 text-xs rounded-lg bg-[#06080d] border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm shadow-cyan-500/20 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
