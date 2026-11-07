import React, { useState } from 'react';
import { 
  Sparkles, 
  Terminal, 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  Copy, 
  Check, 
  Play, 
  Download, 
  RefreshCw,
  Sliders,
  Send
} from 'lucide-react';
import { AudioSettings } from '../types';
import { compileSmartLocalScript } from '../utils/macCommands';
import { SoundEngine } from '../utils/soundEngine';

interface AiCompilerProps {
  apiKey: string;
  audioSettings: AudioSettings;
  onRunInTerminal: (cmd: string, name?: string) => void;
}

export const AiCompiler: React.FC<AiCompilerProps> = ({
  apiKey,
  audioSettings,
  onRunInTerminal,
}) => {
  const [intentInput, setIntentInput] = useState(
    'Deep-clean my system caches and logs, synthesize an audio chime when finished, and verify my Mac sharing permissions.'
  );
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledScript, setCompiledScript] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [safetyNotice, setSafetyNotice] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const promptChips = [
    'Deep-clean system caches, flush DNS, and play glass audio chime',
    'Audit open ports, firewall status, and file sharing permissions',
    'Set Dock autohide speed to instant (0s) and hide recent apps',
    'Rebuild Spotlight index and clean Xcode DerivedData',
    'Purge all remnants and caches of Zoom and Slack',
  ];

  const handleCompile = async (textToCompile?: string) => {
    const prompt = (textToCompile || intentInput).trim();
    if (!prompt) return;

    setIsCompiling(true);
    setCompiledScript('');
    setExplanation('');
    setSafetyNotice('');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      let res: Response | null = null;
      try {
        res = await fetch('/api/gemini/generate', {
          method: 'POST',
          headers,
          signal: controller.signal,
          body: JSON.stringify({
            prompt: `User goal for macOS: "${prompt}".
Please synthesize a complete, safe, production-grade zsh shell script.
Return the script inside a single markdown code block (\`\`\`zsh ... \`\`\`), followed by a brief bulleted explanation of what each flag does, and a safety level assessment.
Append this audio completion hook at the end of the script:
${SoundEngine.compileBashAudioHook(audioSettings)}`,
          }),
        });
      } catch (networkErr) {
        // Fetch timed out or network offline, proceed to local smart compilation
      } finally {
        clearTimeout(timeoutId);
      }

      if (res && res.ok) {
        const data = await res.json();
        const rawText: string = data.text || '';

        // Extract script between ```zsh or ```
        const match = rawText.match(/```(?:zsh|bash|sh)?([\s\S]*?)```/);
        const scriptPart = match ? match[1].trim() : rawText.trim();
        const explanationPart = rawText.replace(/```(?:zsh|bash|sh)?[\s\S]*?```/, '').trim();

        setCompiledScript(scriptPart);
        setExplanation(explanationPart || 'Synthesized custom zsh routine via Gemini 2.5/3.8 Flash.');
        setSafetyNotice(
          scriptPart.includes('sudo')
            ? 'Sudo / Administrator privileges required for one or more commands.'
            : 'Safe / Non-destructive user environment routine.'
        );
      } else {
        // Fallback to local intelligent compiler
        const local = compileSmartLocalScript(prompt, audioSettings);
        setCompiledScript(local.script);
        setExplanation(local.explanation);
        setSafetyNotice(local.safety);
      }
    } catch {
      // Offline fallback
      const local = compileSmartLocalScript(prompt, audioSettings);
      setCompiledScript(local.script);
      setExplanation(local.explanation);
      setSafetyNotice(local.safety);
    } finally {
      setIsCompiling(false);
      // Play audio chime if enabled
      if (audioSettings.soundEnabled) {
        SoundEngine.playPreset(audioSettings.synthPreset, audioSettings.synthVolume);
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(compiledScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([compiledScript], { type: 'text/x-shellscript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'omnios_ai_compiled_task.command';
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
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Asynchronous Intelligent Compilation Pipeline</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Describe what you want to optimize or inspect in plain natural language. Gemini translates intent into non-destructive macOS zsh shell scripts.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Intention Input & Quick Chips (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-4">
            <label htmlFor="intent-prompt" className="block text-xs font-semibold text-slate-200">
              Natural Language Optimization Goal
            </label>
            <div className="relative">
              <textarea
                id="intent-prompt"
                rows={4}
                value={intentInput}
                onChange={(e) => setIntentInput(e.target.value)}
                placeholder="e.g. Deep-clean my system caches, flush DNS, check open ports, and synthesize an audio alert..."
                className="w-full p-3.5 text-xs rounded-lg bg-[#06080d] border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
              />
            </div>

            {/* Quick Chips */}
            <div className="space-y-2">
              <span className="text-[11px] font-medium text-slate-400">
                Quick-Prompt Templates:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {promptChips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => {
                      setIntentInput(chip);
                      handleCompile(chip);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-md bg-[#06080d] hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors text-left"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleCompile()}
                disabled={isCompiling || !intentInput.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
              >
                {isCompiling ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Compiling Intelligent Script with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 fill-current" />
                    <span>Compile Intelligent Script</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Output & Simulator Actions (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>Compiled Zsh Shell Routine</span>
              </h3>

              {compiledScript && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-100"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-100"
                    title="Download as .command"
                  >
                    <Download className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => onRunInTerminal(compiledScript, 'AI Compiled Routine')}
                    className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-semibold ml-2"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run in Simulator</span>
                  </button>
                </div>
              )}
            </div>

            {/* Safety Classification Badge */}
            {safetyNotice && (
              <div
                className={`p-2.5 rounded-lg text-[11px] flex items-center gap-2 border ${
                  safetyNotice.includes('Sudo')
                    ? 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                    : 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                }`}
              >
                {safetyNotice.includes('Sudo') ? (
                  <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
                <span>{safetyNotice}</span>
              </div>
            )}

            {/* Script Display */}
            <pre className="p-3.5 rounded-lg bg-[#06080d] border border-slate-800 text-[11px] font-mono text-cyan-300/90 max-h-64 overflow-y-auto whitespace-pre leading-relaxed">
              {compiledScript || (
                <span className="text-slate-500 italic">
                  # Enter your intention on the left and click "Compile Intelligent Script"
                  # Script output will appear here.
                </span>
              )}
            </pre>

            {/* Explanation box */}
            {explanation && (
              <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <span className="font-semibold text-slate-200">Execution Analysis:</span>
                <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">{explanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
