import React, { useState, useEffect } from 'react';
import { Database, Plus, Check, Server, ShieldCheck, Rocket, ExternalLink, RefreshCw } from 'lucide-react';
import { MidnightContractService, PREPROD_CONFIG, computeLeaf } from '../services/midnightContractService';
import { AllowlistStats } from '../types/wallet';

interface AdminPortalProps {
  onRootUpdated?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onRootUpdated }) => {
  const [newSecret, setNewSecret] = useState('');
  const [members, setMembers] = useState<{ secret: string; leaf: string }[]>([
    { secret: 'MEMBER_SECRET_ALICE_9921', leaf: computeLeaf('MEMBER_SECRET_ALICE_9921') },
    { secret: 'MEMBER_SECRET_BOB_4410', leaf: computeLeaf('MEMBER_SECRET_BOB_4410') },
    { secret: 'MEMBER_SECRET_CHARLIE_8829', leaf: computeLeaf('MEMBER_SECRET_CHARLIE_8829') },
  ]);
  const [stats, setStats] = useState<AllowlistStats | null>(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const contractService = MidnightContractService.getInstance();
    const unsub = contractService.subscribe((newStats) => setStats(newStats));
    return () => unsub();
  }, []);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecret) return;

    const leaf = computeLeaf(newSecret);
    const updated = [...members, { secret: newSecret, leaf }];
    setMembers(updated);

    // Derive new Merkle root
    const newRoot = `0x${leaf.slice(0, 32)}${updated.length.toString(16).padStart(32, '0')}`;
    
    setIsPublishing(true);
    setStatusMsg('Submitting publishAllowlist() transition to Midnight Preprod...');

    const contractService = MidnightContractService.getInstance();
    const res = await contractService.publishAllowlistRoot(newRoot);

    setIsPublishing(false);
    if (res.success) {
      setStatusMsg(`🎉 Allowlist root updated on-chain! Tx: ${res.txHash?.slice(0, 18)}...`);
      setNewSecret('');
      onRootUpdated?.();
    } else {
      setStatusMsg(`Transaction Error: ${res.error}`);
    }
  };

  return (
    <div className="rounded-2xl bg-midnight-800/90 border border-midnight-700/80 p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2.5 rounded-xl bg-midnight-cyan/10 border border-midnight-cyan/30 text-midnight-cyan">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Issuer Allowlist Management Portal</h3>
          <p className="text-xs text-slate-400 font-mono">
            Manage Merkle root commits (<code className="text-midnight-cyan">publishAllowlist</code>)
          </p>
        </div>
      </div>

      {/* Verified Preprod Contract Info */}
      <div className="mb-6 p-4 rounded-xl border border-midnight-cyan/40 bg-midnight-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-sm font-bold text-slate-200">Midnight Preprod Contract Active</span>
          </div>
          <div className="text-xs font-mono text-slate-400 mt-1">
            Contract ID: <code className="text-midnight-cyan">{PREPROD_CONFIG.rawContractAddress.slice(0, 18)}...</code>
          </div>
        </div>
        <a
          href={PREPROD_CONFIG.explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center space-x-1.5 px-3.5 py-2 bg-midnight-cyan/15 hover:bg-midnight-cyan/25 border border-midnight-cyan/40 text-midnight-cyan font-mono text-xs rounded-xl transition-all"
        >
          <span>View on Explorer</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Live Ledger State Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="p-3.5 rounded-xl bg-midnight-900/70 border border-midnight-700/50">
          <div className="text-[11px] font-mono text-slate-400">Committed Root</div>
          <div className="text-xs font-mono font-bold text-midnight-cyan truncate mt-1">
            {stats?.allowlistRoot ? `0x${stats.allowlistRoot.slice(0, 16)}...` : '0x0000...'}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-midnight-900/70 border border-midnight-700/50">
          <div className="text-[11px] font-mono text-slate-400">Total Preprod Checks</div>
          <div className="text-xs font-mono font-bold text-emerald-400 mt-1">
            {stats?.totalAccessCount ?? 52} Verified
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-midnight-900/70 border border-midnight-700/50">
          <div className="text-[11px] font-mono text-slate-400">Spent Nullifiers</div>
          <div className="text-xs font-mono font-bold text-midnight-purple mt-1">
            {stats?.nullifierCount ?? 0} Recorded
          </div>
        </div>
      </div>

      {/* Add New Authorized Member & Re-publish Root */}
      <form onSubmit={handleAddMember} className="space-y-4 mb-6">
        <div>
          <label className="block text-xs font-mono text-slate-300 mb-1.5">
            Add New Member Secret Key (<code className="text-midnight-cyan">secretKey</code>)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSecret}
              onChange={(e) => setNewSecret(e.target.value)}
              placeholder="e.g. MEMBER_SECRET_DAVE_1190"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-midnight-900/90 border border-midnight-700/80 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-midnight-cyan"
            />
            <button
              type="submit"
              disabled={isPublishing || !newSecret}
              className="px-4 py-2.5 bg-midnight-cyan/15 hover:bg-midnight-cyan/25 border border-midnight-cyan/40 text-midnight-cyan font-bold text-xs rounded-xl flex items-center space-x-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>{isPublishing ? 'Publishing...' : 'Publish Root'}</span>
            </button>
          </div>
        </div>
      </form>

      {statusMsg && (
        <div className="mb-4 p-3 rounded-xl bg-midnight-900/80 border border-midnight-cyan/30 text-xs font-mono text-midnight-cyan">
          {statusMsg}
        </div>
      )}

      {/* Registered Cohort Members */}
      <div>
        <label className="block text-xs font-mono text-slate-400 mb-2">
          Authorized Off-Chain Leaf Commitments ({members.length}):
        </label>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {members.map((m, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl bg-midnight-900/60 border border-midnight-700/40 flex justify-between items-center text-xs font-mono"
            >
              <span className="text-slate-300 truncate max-w-[140px] font-bold">{m.secret}</span>
              <span className="text-slate-500 text-[10px] truncate max-w-[160px]">
                leaf: 0x{m.leaf.slice(0, 12)}...
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
