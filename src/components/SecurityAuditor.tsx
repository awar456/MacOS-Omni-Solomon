import React, { useState } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Play, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  Lock, 
  Wifi, 
  Share2, 
  FileCheck
} from 'lucide-react';
import { SecurityCheckItem, AudioSettings } from '../types';
import { SECURITY_AUDIT_CHECKS, generateSecurityAuditScript } from '../utils/macCommands';

interface SecurityAuditorProps {
  audioSettings: AudioSettings;
  onRunInTerminal: (cmd: string, name?: string) => void;
}

export const SecurityAuditor: React.FC<SecurityAuditorProps> = ({
  audioSettings,
  onRunInTerminal,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const auditScript = generateSecurityAuditScript(audioSettings);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([auditScript], { type: 'text/x-shellscript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'audit_macos_security.command';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCategoryIcon = (category: SecurityCheckItem['category']) => {
    switch (category) {
      case 'system':
        return <Lock className="w-4 h-4 text-cyan-400" />;
      case 'integrity':
        return <FileCheck className="w-4 h-4 text-emerald-400" />;
      case 'network':
        return <Wifi className="w-4 h-4 text-amber-400" />;
      case 'sharing':
        return <Share2 className="w-4 h-4 text-violet-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-4 rounded-xl bg-[#0c1017] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Local Security Auditing & Compliance Tool</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Diagnostic routines to verify global file sharing permissions, audit open network ports, scan active launch agents, and check firewall integrity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onRunInTerminal(auditScript, 'Complete macOS Security Audit')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 rounded-lg hover:bg-cyan-900/60 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Run Full Audit in Simulator</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm shadow-cyan-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Audit Script (.command)</span>
          </button>
        </div>
      </div>

      {/* Grid of Security Check Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECURITY_AUDIT_CHECKS.map((check) => {
          const isCopied = copiedId === check.id;

          return (
            <div
              key={check.id}
              className="p-5 rounded-xl bg-[#0c1017] border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[#06080d] border border-slate-800">
                      {getCategoryIcon(check.category)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-100">{check.title}</h3>
                      <span className="text-[10px] text-slate-400 font-mono capitalize">
                        Scope: {check.category} · Priority: {check.severity}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {check.description}
                </p>

                {/* Command box */}
                <div className="mt-3 p-2.5 rounded-lg bg-[#06080d] border border-slate-800 font-mono text-xs text-cyan-300 break-all">
                  <code>{check.checkCommand}</code>
                </div>

                {check.expectedHealthyOutput && (
                  <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Expected healthy: <code className="text-emerald-400 font-mono">{check.expectedHealthyOutput}</code></span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => handleCopy(check.id, check.checkCommand)}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? 'Copied' : 'Copy Check'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onRunInTerminal(check.remediationCommand, `Remediate: ${check.title}`)}
                    className="px-2.5 py-1 text-[11px] font-medium text-amber-300 bg-amber-950/40 border border-amber-800/50 hover:bg-amber-900/40 rounded transition-colors"
                    title="Remediation command"
                  >
                    Remediate
                  </button>

                  <button
                    onClick={() => onRunInTerminal(check.checkCommand, `Audit: ${check.title}`)}
                    className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Scan</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
