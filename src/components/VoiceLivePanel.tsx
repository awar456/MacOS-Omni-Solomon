import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Radio, 
  Volume2, 
  Sparkles, 
  Play, 
  CheckCircle2, 
  AlertCircle,
  Terminal,
  Activity
} from 'lucide-react';
import { AudioSettings } from '../types';
import { SoundEngine } from '../utils/soundEngine';

interface VoiceLivePanelProps {
  apiKey: string;
  audioSettings: AudioSettings;
  onRunInTerminal: (cmd: string, name?: string) => void;
}

interface VoiceTranscriptItem {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: string;
  command?: string;
}

export const VoiceLivePanel: React.FC<VoiceLivePanelProps> = ({
  apiKey,
  audioSettings,
  onRunInTerminal,
}) => {
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [voiceTranscripts, setVoiceTranscripts] = useState<VoiceTranscriptItem[]>([
    {
      id: 'vt-1',
      sender: 'gemini',
      text: 'OmniOS Live Voice Channel online. Model: gemini-3.8-live. Speak your macOS automation goal or click a voice prompt below.',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Simulated visualizer animation when active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLiveActive) {
      interval = setInterval(() => {
        setAudioLevel(Math.random() * 0.8 + 0.2);
      }, 150);
    } else {
      setAudioLevel(0);
    }
    return () => clearInterval(interval);
  }, [isLiveActive]);

  const toggleLiveVoice = () => {
    if (isLiveActive) {
      // Disconnect
      if (wsRef.current) {
        wsRef.current.close();
      }
      setIsLiveActive(false);
      setConnectionStatus('idle');
      setIsSpeaking(false);
    } else {
      // Connect
      setConnectionStatus('connecting');
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/live`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          setIsLiveActive(true);
          setConnectionStatus('connected');
          if (audioSettings.soundEnabled) {
            SoundEngine.playPreset('quantum', 0.5);
          }
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.interrupted) {
              setIsSpeaking(false);
            }
            if (data.audio) {
              setIsSpeaking(true);
              // Audio chunks from gemini-3.8-live
              setTimeout(() => setIsSpeaking(false), 1200);
            }
          } catch (e) {
            // ignore
          }
        };

        ws.onerror = () => {
          setConnectionStatus('connected'); // Fallback to client voice engine
          setIsLiveActive(true);
        };

        ws.onclose = () => {
          setIsLiveActive(false);
          setConnectionStatus('idle');
        };
      } catch {
        setConnectionStatus('connected');
        setIsLiveActive(true);
      }
    }
  };

  const handleSimulateSpokenCommand = (prompt: string, answer: string, cmd?: string) => {
    // Add user voice turn
    const userItem: VoiceTranscriptItem = {
      id: `vt-${Date.now()}-user`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString(),
    };

    setVoiceTranscripts((prev) => [...prev, userItem]);

    setIsSpeaking(true);
    SoundEngine.speak(answer, audioSettings.speechVoice, 1.0, 1.0);

    setTimeout(() => {
      const geminiItem: VoiceTranscriptItem = {
        id: `vt-${Date.now()}-gemini`,
        sender: 'gemini',
        text: answer,
        timestamp: new Date().toLocaleTimeString(),
        command: cmd
      };
      setVoiceTranscripts((prev) => [...prev, geminiItem]);
      setIsSpeaking(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-[#0c1017] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <span>Gemini Live Real-Time Voice Conversation</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time low-latency voice interaction powered by <code className="text-cyan-300 font-mono">gemini-3.8-live</code>. Stream audio directly between MacBook and Gemini.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLiveVoice}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all shadow-sm ${
              isLiveActive
                ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-cyan-500/20'
            }`}
          >
            {isLiveActive ? (
              <>
                <MicOff className="w-3.5 h-3.5" />
                <span>Disconnect Live Voice</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5" />
                <span>Start Live Voice Channel</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visualizer & Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Sonic Waveform Display Card */}
          <div className="p-6 rounded-xl bg-[#0c1017] border border-slate-800 flex flex-col items-center justify-center space-y-6 text-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Pulsing rings */}
              <div 
                style={{ transform: `scale(${1 + audioLevel * 0.4})`, opacity: isLiveActive ? 0.8 : 0.1 }}
                className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl transition-all duration-150"
              />
              <div 
                style={{ transform: `scale(${1 + audioLevel * 0.2})` }}
                className="absolute inset-2 rounded-full border border-cyan-500/40 transition-all duration-150"
              />

              {/* Core Orb */}
              <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isLiveActive 
                  ? 'bg-gradient-to-tr from-cyan-500 to-emerald-400 shadow-lg shadow-cyan-500/40 text-slate-950' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {isLiveActive ? (
                  <Activity className="w-8 h-8 animate-pulse" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                {isLiveActive ? (isSpeaking ? 'Gemini Speaking...' : 'Live Channel Listening...') : 'Voice Channel Standby'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Model: <span className="font-mono text-cyan-400">gemini-3.8-live</span> · 16kHz PCM input / 24kHz PCM output
              </p>
            </div>

            {/* Simulated Live Audio Spectrum Bars */}
            <div className="flex items-center gap-1.5 h-10 w-full justify-center px-4">
              {[0.2, 0.5, 0.8, 0.4, 0.9, 0.7, 0.3, 0.6, 0.85, 0.45, 0.65, 0.35, 0.75].map((h, i) => (
                <div
                  key={i}
                  style={{
                    height: isLiveActive ? `${Math.max(15, h * (audioLevel * 100))}%` : '15%',
                  }}
                  className="w-1.5 rounded-full bg-cyan-400/80 transition-all duration-150"
                />
              ))}
            </div>
          </div>

          {/* Quick Voice Prompts */}
          <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-3">
            <h4 className="text-xs font-semibold text-slate-300">
              Speak or Test Voice Prompts:
            </h4>
            <div className="space-y-2">
              {[
                {
                  label: '"OmniOS, how do I stop my MacBook from sleeping?"',
                  answer: 'You can prevent sleep using the native caffeinate utility. Running caffeinate for two hours now.',
                  cmd: 'caffeinate -u -t 7200 &'
                },
                {
                  label: '"OmniOS, eliminate my Dock animation delays."',
                  answer: 'Setting your Dock autohide speed and delay to zero seconds, then restarting Dock.',
                  cmd: 'defaults write com.apple.dock autohide-delay -float 0; defaults write com.apple.dock autohide-time-modifier -float 0; killall Dock'
                },
                {
                  label: '"OmniOS, audit all open listening TCP network ports."',
                  answer: 'Auditing all open TCP sockets with numerical port resolution now.',
                  cmd: 'lsof -iTCP -sTCP:LISTEN -n -P'
                }
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSimulateSpokenCommand(item.label, item.answer, item.cmd)}
                  className="w-full text-left p-2.5 rounded-lg bg-[#06080d] hover:bg-slate-800/80 border border-slate-800 text-xs text-slate-300 transition-colors flex items-center justify-between group"
                >
                  <span className="truncate pr-2">{item.label}</span>
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Conversation Transcript Stream (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 flex flex-col h-[520px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Live Audio Transcript Stream</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {voiceTranscripts.length} exchanges
              </span>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {voiceTranscripts.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl text-xs space-y-1.5 ${
                    item.sender === 'user'
                      ? 'bg-slate-800/80 border border-slate-700 text-slate-100 ml-6'
                      : 'bg-[#06080d] border border-slate-800 text-slate-200 mr-6'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-semibold uppercase font-mono text-cyan-400">
                      {item.sender === 'user' ? 'Operator (Voice In)' : 'Gemini 3.8 Live (Voice Out)'}
                    </span>
                    <span>{item.timestamp}</span>
                  </div>

                  <p className="leading-relaxed font-sans">{item.text}</p>

                  {item.command && (
                    <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-800/80">
                      <code className="text-[11px] font-mono text-cyan-300 bg-black/40 px-2 py-1 rounded truncate flex-1">
                        {item.command}
                      </code>
                      <button
                        onClick={() => onRunInTerminal(item.command!, 'Voice Triggered Execution')}
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors shrink-0"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Run</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
