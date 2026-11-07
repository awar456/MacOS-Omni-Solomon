import { AudioSettings } from '../types/index';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const SoundEngine = {
  // Preset Synthesizers using Web Audio API
  playPreset(preset: AudioSettings['synthPreset'], volume = 0.5) {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(Math.min(Math.max(volume, 0.05), 1), now);
    masterGain.connect(ctx.destination);

    switch (preset) {
      case 'obsidian': {
        // Deep obsidian sub-bass chime with warm resonance
        const osc = ctx.createOscillator();
        const subOsc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.exponentialRampToValueAtTime(120, now + 0.6);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.5);

        subOsc.type = 'triangle';
        subOsc.frequency.setValueAtTime(55, now);

        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        osc.connect(filter);
        subOsc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        subOsc.start(now);
        osc.stop(now + 0.7);
        subOsc.stop(now + 0.7);
        break;
      }

      case 'quantum': {
        // High-tech quantum blip with frequency modulation
        const osc = ctx.createOscillator();
        const mod = ctx.createOscillator();
        const modGain = ctx.createGain();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.15);

        mod.type = 'sawtooth';
        mod.frequency.setValueAtTime(40, now);
        modGain.gain.setValueAtTime(120, now);

        mod.connect(modGain);
        modGain.connect(osc.frequency);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(masterGain);

        mod.start(now);
        osc.start(now);
        mod.stop(now + 0.25);
        osc.stop(now + 0.25);
        break;
      }

      case 'warp': {
        // Sci-fi cyber warp upward sweep
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.exponentialRampToValueAtTime(920, now + 0.35);

        filter.type = 'bandpass';
        filter.Q.value = 4;
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(1800, now + 0.35);

        gain.gain.setValueAtTime(0.35, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.45);
        break;
      }

      case 'glass': {
        // Crystalline Apple-style glass tap
        const freqs = [1046.5, 1318.51, 1567.98]; // C6, E6, G6
        freqs.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.04);
          gain.gain.setValueAtTime(0.3 / (idx + 1), now + idx * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4 + idx * 0.04);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + idx * 0.04);
          osc.stop(now + 0.5);
        });
        break;
      }

      case 'triad': {
        // Harmonic major triad chord of triumph
        const chordFreqs = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        chordFreqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now);

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8 + i * 0.1);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 1.0);
        });
        break;
      }
    }
  },

  // Browser Speech Synthesis preview
  speak(text: string, voiceName?: string, rate = 1.0, pitch = 1.0) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (voiceName) {
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(v => v.name.toLowerCase().includes(voiceName.toLowerCase()));
      if (match) utterance.voice = match;
    }
    window.speechSynthesis.speak(utterance);
  },

  // Compile native macOS shell completion hooks (say + afplay)
  compileBashAudioHook(settings: AudioSettings): string {
    const lines: string[] = [];
    if (settings.soundEnabled) {
      lines.push('# OmniOS Audio Notification Hook');
      lines.push('if [ -f "/System/Library/Sounds/Glass.aiff" ]; then');
      lines.push('  afplay /System/Library/Sounds/Glass.aiff 2>/dev/null &');
      lines.push('fi');
    }
    if (settings.voiceEnabled && settings.completionMessage.trim()) {
      const escapedMsg = settings.completionMessage.replace(/"/g, '\\"');
      const voiceFlag = settings.speechVoice ? `-v "${settings.speechVoice}"` : '';
      const rateFlag = settings.speechRate ? `-r ${settings.speechRate}` : '';
      lines.push(`say ${voiceFlag} ${rateFlag} "${escapedMsg}" 2>/dev/null &`);
    }
    return lines.join('\n');
  }
};
