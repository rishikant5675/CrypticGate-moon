import React from 'react';
import { Eye, EyeOff, ShieldCheck, Lock } from 'lucide-react';

export const PrivacyBanner: React.FC = () => {
  return (
    <div className="rounded-2xl bg-midnight-800/90 border border-midnight-700/80 p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center space-x-3 mb-4">
        <ShieldCheck className="w-6 h-6 text-midnight-cyan" />
        <h2 className="text-lg font-bold text-white tracking-wide">Midnight Privacy Model Guarantee</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* What Observer CAN See */}
        <div className="p-4 rounded-xl bg-midnight-900/60 border border-midnight-700/50">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm mb-3">
            <Eye className="w-4 h-4" />
            <span>Observer of Public Ledger CAN See:</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300 font-mono">
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Boolean outcome: <code className="text-emerald-300">accessGranted = true</code></span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Incremental total access counter (+1)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Single-use 1-way nullifier hash</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Allowlist Merkle Root commitment string</span>
            </li>
          </ul>
        </div>

        {/* What Observer CANNOT See */}
        <div className="p-4 rounded-xl bg-midnight-900/60 border border-rose-500/20">
          <div className="flex items-center space-x-2 text-rose-400 font-semibold text-sm mb-3">
            <EyeOff className="w-4 h-4" />
            <span>Observer CANNOT See (Zero Leakage):</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300 font-mono">
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              <span>Which member proved access or leaf index</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              <span>Prover's raw wallet address or identity</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              <span>Private secret key or salt parameter</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              <span>Full list of allowlist identities</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};
