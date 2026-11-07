import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Trash2, Play, MousePointer, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { TerminalLogEntry } from '../types';

interface TerminalEmulatorProps {
  logs: TerminalLogEntry[];
  onExecuteCommand: (command: string) => void;
  onClear: () => void;
  accentColor?: string;
  fontFamily?: string;
  fontSize?: number;
}

export const TerminalEmulator: React.FC<TerminalEmulatorProps> = ({
  logs,
  onExecuteCommand,
  onClear,
  accentColor = '#06b6d4',
  fontFamily = 'JetBrains Mono',
  fontSize = 13,
}) => {
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [pointerCoords, setPointerCoords] = useState<{ x: number; y: number } | null>(null);
  const [clickWave, setClickWave] = useState<{ x: number; y: number; id: number } | null>(null);

  const terminalViewportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on logs change
  useEffect(() => {
    if (terminalViewportRef.current) {
      terminalViewportRef.current.scrollTop = terminalViewportRef.current.scrollHeight;
    }
  }, [logs]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const trimmed = input.trim();
      if (trimmed) {
        setHistory((prev) => [...prev, trimmed]);
        setHistoryIndex(null);
        onExecuteCommand(trimmed);
        setInput('');
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === null ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === null) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(null);
        setInput('');
      } else {
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPointerCoords({
      x: Math.round(e.clientX - rect.left),
      y: Math.round(e.clientY - rect.top),
    });
  };

  const handleTerminalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);
    setClickWave({ x, y, id: Date.now() });
    inputRef.current?.focus();
  };

  return (
    <div className="w-full rounded-xl overflow-hidden border border-slate-800 bg-[#06080d] shadow-2xl flex flex-col font-mono text-slate-200">
      {/* macOS Window Chrome Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0e131d] border-b border-slate-800/80 select-none">
        <div className="flex items-center gap-2">
          {/* Traffic Light Buttons */}
          <button
            onClick={onClear}
            title="Clear terminal buffer"
            className="w-3 h-3 rounded-full bg-[#ff5f56] hover:brightness-110 transition-all border border-[#e0443e]/40"
            aria-label="Close terminal and clear"
          />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]/40" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]/40" />
          <span className="ml-3 text-xs font-medium text-slate-400 font-sans flex items-center gap-1.5">
            <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>macOS Darwin zsh — OmniOS God-Mode Shell</span>
          </span>
        </div>

        {/* Emulated Mousepad Coordinates & Actions */}
        <div className="flex items-center gap-3">
          {pointerCoords && (
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
              <MousePointer className="w-3 h-3 text-cyan-400" />
              <span>
                X: {pointerCoords.x}px · Y: {pointerCoords.y}px
              </span>
            </div>
          )}
          <button
            onClick={onClear}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-sans text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 rounded transition-colors"
            title="Clear Terminal (clear)"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div
        ref={terminalViewportRef}
        onMouseMove={handleMouseMove}
        onClick={handleTerminalClick}
        style={{ fontFamily, fontSize: `${fontSize}px` }}
        className="relative flex-1 p-4 overflow-y-auto max-h-[460px] min-h-[340px] space-y-2 bg-[#06080d] cursor-text leading-relaxed selection:bg-cyan-500/30"
      >
        {/* Click ripple animation for coordinate emulation */}
        {clickWave && (
          <div
            key={clickWave.id}
            style={{ left: clickWave.x, top: clickWave.y }}
            className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-cyan-400/60 pointer-events-none animate-ping duration-700"
          />
        )}

        {/* Terminal Welcome Banner */}
        <div className="pb-3 border-b border-slate-900 text-xs text-slate-400">
          <p className="text-cyan-400 font-semibold">OmniOS God-Mode System Emulator v2.6.4 (Darwin 24.1.0 Apple Silicon)</p>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Interactive macOS automation runtime. Type <span className="text-amber-400">help</span> for commands, or trigger commands from modules below.
          </p>
        </div>

        {/* Log Entries */}
        {logs.map((log) => (
          <div key={log.id} className="text-xs break-words">
            {log.type === 'input' && (
              <div className="flex items-start gap-2 text-slate-100">
                <span className="text-emerald-400 select-none">mbp@omnios</span>
                <span className="text-slate-500 select-none">:</span>
                <span className="text-cyan-400 select-none">~</span>
                <span className="text-slate-400 select-none">%</span>
                <span className="font-semibold text-slate-100">{log.content}</span>
              </div>
            )}

            {log.type === 'output' && (
              <pre className="whitespace-pre-wrap text-slate-300 font-mono text-[12px] pl-4 border-l border-slate-800 my-1">
                {log.content}
              </pre>
            )}

            {log.type === 'success' && (
              <div className="flex items-center gap-2 text-emerald-400 text-xs pl-4 my-1">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{log.content}</span>
              </div>
            )}

            {log.type === 'error' && (
              <div className="flex items-center gap-2 text-rose-400 text-xs pl-4 my-1">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>{log.content}</span>
              </div>
            )}

            {log.type === 'system' && (
              <p className="text-cyan-400/90 text-xs italic pl-4 my-0.5">
                {log.content}
              </p>
            )}
          </div>
        ))}

        {/* Active Command Input Line */}
        <div className="flex items-center gap-2 pt-1 text-xs">
          <span className="text-emerald-400 select-none">mbp@omnios</span>
          <span className="text-slate-500 select-none">:</span>
          <span className="text-cyan-400 select-none">~</span>
          <span className="text-slate-400 select-none">%</span>
          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full bg-transparent text-slate-100 outline-none border-none p-0 m-0 font-mono text-xs"
              placeholder="Type command (e.g. 'audit', 'help', 'clean') or pick a tweak below..."
              aria-label="Terminal prompt input"
            />
            <span
              style={{ backgroundColor: accentColor }}
              className="inline-block w-1.5 h-3.5 animate-pulse ml-0.5 shrink-0"
            />
          </div>
        </div>
      </div>

      {/* Terminal Quick Bar Footer */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#090d14] border-t border-slate-800/80 text-[11px] text-slate-400 font-sans">
        <div className="flex items-center gap-2">
          <span>Quick actions:</span>
          <button
            onClick={() => onExecuteCommand('help')}
            className="px-2 py-0.5 bg-slate-800/60 hover:bg-slate-700 text-slate-300 rounded font-mono"
          >
            help
          </button>
          <button
            onClick={() => onExecuteCommand('audit')}
            className="px-2 py-0.5 bg-slate-800/60 hover:bg-slate-700 text-cyan-300 rounded font-mono"
          >
            audit
          </button>
          <button
            onClick={() => onExecuteCommand('defaults read com.apple.dock autohide-time-modifier')}
            className="px-2 py-0.5 bg-slate-800/60 hover:bg-slate-700 text-emerald-300 rounded font-mono"
          >
            dock speed
          </button>
          <button
            onClick={() => onExecuteCommand('lsof -iTCP -sTCP:LISTEN -P -n')}
            className="px-2 py-0.5 bg-slate-800/60 hover:bg-slate-700 text-amber-300 rounded font-mono"
          >
            open ports
          </button>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
          <Play className="w-3 h-3 text-emerald-400" />
          <span>Press Enter to execute</span>
        </div>
      </div>
    </div>
  );
};
