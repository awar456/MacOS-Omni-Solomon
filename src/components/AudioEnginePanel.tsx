import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Sparkles, 
  Sliders, 
  Mic, 
  Layers
} from 'lucide-react';
import { AudioSettings } from '../types';
import { SoundEngine } from '../utils/soundEngine';

interface AudioEnginePanelProps {
  settings: AudioSettings;
  onChangeSettings: (settings: AudioSettings) => void;
}

export const AudioEnginePanel: React.FC<AudioEnginePanelProps> = ({
  settings,
  onChangeSettings,
}) => {
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  const presets = [
    { id: 'obsidian', name: 'Sub-bass Obsidian Chime', desc: 'Warm 55Hz sub-bass sine wave with exponential decay' },
    { id: 'quantum', name: 'Quantum Blip', desc: 'High-frequency 880Hz FM modulation pulse' },
    { id: 'warp', name: 'Cyber Warp', desc: '130Hz upward resonant filter sweep' },
    { id: 'glass', name: 'Apple Clean Glass', desc: 'Three-stage harmonic C6-E6 crystalline glass chime' },
    { id: 'triad', name: 'Success Triad Chord', desc: 'Harmonic A-major chord of completion' },
  ] as const;

  const macVoices = ['Samantha', 'Daniel', 'Karen', 'Alex', 'Victoria', 'Fred'];

  const updateProp = <K extends keyof AudioSettings>(key: K, value: AudioSettings[K]) => {
    onChangeSettings({ ...settings, [key]: value });
  };

  const handleTestSynth = (preset: AudioSettings['synthPreset']) => {
    setIsPlayingTest(true);
    SoundEngine.playPreset(preset, settings.synthVolume);
    setTimeout(() => setIsPlayingTest(false), 800);
  };

  const handleTestSpeech = () => {
    SoundEngine.speak(
      settings.completionMessage || 'OmniOS optimization complete.',
      settings.speechVoice,
      settings.speechRate / 175,
      settings.speechPitch
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-[#0c1017] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>Audio Notification & Speech Synthesis Sound Engine</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Embed real-time HTML5 Web Audio API synthesizers and native macOS 'say' / 'afplay' hooks into your automated shell tasks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTestSynth(settings.synthPreset)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm shadow-cyan-500/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Test Sound Synth</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Web Audio API Synthesizer Card (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>HTML5 Web Audio Synthesizer Presets</span>
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => updateProp('soundEnabled', e.target.checked)}
                  className="w-4 h-4 rounded bg-[#06080d] border-slate-700 text-cyan-400 focus:ring-0"
                />
                <span className="text-xs text-slate-300 font-medium">Enable In Scripts</span>
              </label>
            </div>

            <div className="space-y-2.5">
              {presets.map((preset) => {
                const isSelected = settings.synthPreset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => updateProp('synthPreset', preset.id)}
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-800/80 text-cyan-200 shadow-sm'
                        : 'bg-[#06080d] border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">{preset.name}</span>
                      <span className="text-[11px] text-slate-400 block mt-0.5">{preset.desc}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTestSynth(preset.id);
                      }}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors shrink-0 ml-3"
                      title="Preview this sound"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Volume Slider */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1.5">
                <span>Synthesizer Volume</span>
                <span className="font-mono text-cyan-400">{Math.round(settings.synthVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={settings.synthVolume}
                onChange={(e) => updateProp('synthVolume', Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Native macOS Speech 'say' Compiler (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Mic className="w-4 h-4 text-cyan-400" />
                <span>macOS Native 'say' Speech Hook</span>
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.voiceEnabled}
                  onChange={(e) => updateProp('voiceEnabled', e.target.checked)}
                  className="w-4 h-4 rounded bg-[#06080d] border-slate-700 text-cyan-400 focus:ring-0"
                />
                <span className="text-xs text-slate-300 font-medium">Enable Spoken Alert</span>
              </label>
            </div>

            {/* Speech message input */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Spoken Completion Phrase
              </label>
              <input
                type="text"
                value={settings.completionMessage}
                onChange={(e) => updateProp('completionMessage', e.target.value)}
                placeholder="OmniOS optimization complete."
                className="w-full px-3.5 py-2 text-xs rounded-lg bg-[#06080d] border border-slate-700 text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Voice & Rate Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Native macOS Voice
                </label>
                <select
                  value={settings.speechVoice}
                  onChange={(e) => updateProp('speechVoice', e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-[#06080d] border border-slate-700 text-slate-100"
                >
                  {macVoices.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1.5">
                  <span>Speech Rate</span>
                  <span className="font-mono text-cyan-400">{settings.speechRate} wpm</span>
                </div>
                <input
                  type="range"
                  min="130"
                  max="240"
                  step="5"
                  value={settings.speechRate}
                  onChange={(e) => updateProp('speechRate', Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>

            {/* Test Voice Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleTestSpeech}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                <Mic className="w-3.5 h-3.5 text-cyan-400" />
                <span>Test Spoken Voice in Browser</span>
              </button>
            </div>

            {/* Compiled Audio Script Hook Preview */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <span className="text-xs font-semibold text-slate-400">
                Generated Native Shell Hook:
              </span>
              <pre className="p-3 rounded-lg bg-[#06080d] border border-slate-800 text-[11px] font-mono text-cyan-300/90 whitespace-pre">
{SoundEngine.compileBashAudioHook(settings) || '# Audio hooks disabled'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
