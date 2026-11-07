import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Key, ShieldCheck, Check, AlertCircle, X, Sparkles } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey: (key: string) => void;
  hasServerKey: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveKey,
  hasServerKey,
}) => {
  const [keyInput, setKeyInput] = useState(apiKey);
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    setKeyInput(apiKey);
  }, [apiKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveKey(keyInput.trim());
    onClose();
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Validating connection with Google Gemini API...');
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (keyInput.trim()) {
        headers['Authorization'] = `Bearer ${keyInput.trim()}`;
      }

      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt: 'Respond with the word "CONNECTED" only.',
          systemInstruction: 'Answer with one word: CONNECTED'
        })
      });

      const data = await res.json();
      if (res.ok && data.text) {
        setTestStatus('success');
        setTestMessage('Authentication Verified: Gemini-3.8-Flash online and responding.');
      } else {
        setTestStatus('error');
        setTestMessage(data.error || 'Connection failed. Please check the API key.');
      }
    } catch (err) {
      setTestStatus('error');
      setTestMessage('Network error or server endpoint unavailable.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-[#0c1017] border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/50 text-cyan-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 id="modal-title" className="text-base font-semibold text-slate-100">
                Security & Access Authorization
              </h2>
              <p className="text-xs text-slate-400">
                Google Gemini API Key Configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          {/* Server Key Status Banner */}
          {hasServerKey && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-200">Server Environment Key Detected</p>
                <p className="text-emerald-400/80 mt-0.5">
                  AI Studio backend has an active injected key. You can also specify a custom override key below.
                </p>
              </div>
            </div>
          )}

          {/* Password-masked API key input */}
          <div>
            <label htmlFor="gemini-key" className="block text-xs font-medium text-slate-300 mb-1.5">
              Google Gemini API Key
            </label>
            <div className="relative">
              <input
                id="gemini-key"
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3.5 py-2.5 pr-10 text-sm font-mono rounded-lg bg-[#06080d] border border-slate-700/80 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                aria-label={showKey ? 'Mask API key' : 'Show API key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Stored locally in client browser memory (localStorage) with zero external database telemetry.
            </p>
          </div>

          {/* Connection Test Output */}
          {testStatus !== 'idle' && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2.5 border ${
                testStatus === 'testing'
                  ? 'bg-slate-900 border-slate-700 text-slate-300'
                  : testStatus === 'success'
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
              }`}
            >
              {testStatus === 'testing' && <Sparkles className="w-4 h-4 animate-spin text-cyan-400 shrink-0" />}
              {testStatus === 'success' && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
              {testStatus === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              <span>{testMessage}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testStatus === 'testing'}
            className="px-3.5 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm shadow-cyan-500/20"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
