import React, { useState } from 'react';
import { Database, Plus, Check, Server, ShieldCheck } from 'lucide-react';
import { CrypticGateSimulator, MerkleTree, computeCommitment } from '../../../contract/src/contract_simulator';

interface AdminPortalProps {
  contract: CrypticGateSimulator;
  onRootUpdated: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ contract, onRootUpdated }) => {
  const [newSecret, setNewSecret] = useState('');
  const [newSalt, setNewSalt] = useState('');
  const [addedMembers, setAddedMembers] = useState<{ secret: string; salt: string; commitment: string }[]>([
    { secret: 'MEMBER_SECRET_ALICE_9921', salt: 'SALT_A_001', commitment: computeCommitment('MEMBER_SECRET_ALICE_9921', 'SALT_A_001') },
    { secret: 'MEMBER_SECRET_BOB_4410', salt: 'SALT_B_002', commitment: computeCommitment('MEMBER_SECRET_BOB_4410', 'SALT_B_002') },
    { secret: 'MEMBER_SECRET_CHARLIE_8829', salt: 'SALT_C_003', commitment: computeCommitment('MEMBER_SECRET_CHARLIE_8829', 'SALT_C_003') }
  ]);
  const [statusMsg, setStatusMsg] = useState('');

  const state = contract.getState();

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecret || !newSalt) return;

    const commitment = computeCommitment(newSecret, newSalt);
    const updated = [...addedMembers, { secret: newSecret, salt: newSalt, commitment }];
    setAddedMembers(updated);

    // Recompute Merkle root
    const commitments = updated.map(m => m.commitment);
    const newTree = new MerkleTree(commitments, 8);
    contract.updateAllowlistRoot(newTree.getRoot());

    setNewSecret('');
    setNewSalt('');
    setStatusMsg(`New member commitment added. Updated Merkle Root: ${newTree.getRoot().slice(0, 16)}...`);
    onRootUpdated();
  };

  return (
    <div className="rounded-2xl bg-midnight-800/90 border border-midnight-700/80 p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2.5 rounded-xl bg-midnight-cyan/10 border border-midnight-cyan/30 text-midnight-cyan">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Admin Private Allowlist Portal</h3>
          <p className="text-xs text-slate-400 font-mono">Manage hashed commitment commitments in Midnight private state</p>
        </div>
      </div>

      {/* Current Public State Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-3.5 rounded-xl bg-midnight-900/70 border border-midnight-700/50">
          <div className="text-[11px] font-mono text-slate-400">Allowlist Merkle Root</div>
          <div className="text-xs font-mono font-bold text-midnight-cyan truncate mt-1">{state.allowlistRoot}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-midnight-900/70 border border-midnight-700/50">
          <div className="text-[11px] font-mono text-slate-400">Total Access Granted Count</div>
          <div className="text-sm font-mono font-bold text-emerald-400 mt-1">{state.totalAccessCount} Proofs</div>
        </div>
        <div className="p-3.5 rounded-xl bg-midnight-900/70 border border-midnight-700/50">
          <div className="text-[11px] font-mono text-slate-400">Used Nullifiers</div>
          <div className="text-sm font-mono font-bold text-slate-200 mt-1">{state.nullifierSet.size} Nullifiers</div>
        </div>
      </div>

      {/* Add Member Commitment Form */}
      <form onSubmit={handleAddMember} className="p-4 rounded-xl bg-midnight-900/60 border border-midnight-700/50 mb-6 space-y-3">
        <div className="text-xs font-mono font-semibold text-slate-200 flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-midnight-cyan" />
          <span>Register New Hashed Commitment</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="New Member Secret Passphrase"
            value={newSecret}
            onChange={(e) => setNewSecret(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-midnight-800 border border-midnight-700 text-xs font-mono text-white focus:outline-none focus:border-midnight-cyan"
            required
          />
          <input
            type="text"
            placeholder="Salt string (e.g., SALT_D_004)"
            value={newSalt}
            onChange={(e) => setNewSalt(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-midnight-800 border border-midnight-700 text-xs font-mono text-white focus:outline-none focus:border-midnight-cyan"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 rounded-xl bg-midnight-700 hover:bg-midnight-600 border border-midnight-600/60 text-xs font-mono font-bold text-white transition-all"
        >
          Add Commitment & Update Merkle Root
        </button>
      </form>

      {statusMsg && (
        <div className="mb-4 text-xs font-mono text-emerald-400 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30">
          {statusMsg}
        </div>
      )}

      {/* Commitments List */}
      <div>
        <h4 className="text-xs font-mono text-slate-400 mb-2">Registered Allowlist Commitments ({addedMembers.length}):</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {addedMembers.map((m, idx) => (
            <div key={idx} className="p-2.5 rounded-lg bg-midnight-900/80 border border-midnight-700/40 text-xs font-mono flex items-center justify-between text-slate-300">
              <span className="font-semibold text-slate-200">Leaf {idx}:</span>
              <span className="text-slate-400 text-[11px] truncate max-w-[200px]">{m.commitment}</span>
              <span className="text-emerald-400 text-[10px]">Registered</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
