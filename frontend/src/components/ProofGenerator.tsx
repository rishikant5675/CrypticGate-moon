import React, { useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle, Loader2, Sparkles, Lock, ArrowRight, RefreshCw } from 'lucide-react';
import { CrypticGateSimulator, MerkleTree, computeCommitment, computeNullifier } from '../../../contract/src/contract_simulator';

interface ProofGeneratorProps {
  contract: CrypticGateSimulator;
  tree: MerkleTree;
  onProofSuccess: (nullifier: string) => void;
}

export const ProofGenerator: React.FC<ProofGeneratorProps> = ({ contract, tree, onProofSuccess }) => {
  const [secret, setSecret] = useState('MEMBER_SECRET_ALICE_9921');
  const [salt, setSalt] = useState('SALT_A_001');
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [result, setResult] = useState<{ success: boolean; nullifier?: string; error?: string } | null>(null);

  const presetMembers = [
    { label: 'Alice (Member 1)', secret: 'MEMBER_SECRET_ALICE_9921', salt: 'SALT_A_001' },
    { label: 'Bob (Member 2)', secret: 'MEMBER_SECRET_BOB_4410', salt: 'SALT_B_002' },
    { label: 'Charlie (Member 3)', secret: 'MEMBER_SECRET_CHARLIE_8829', salt: 'SALT_C_003' },
    { label: 'Attacker (Non-Member)', secret: 'ATTACKER_SECRET_MALORY_666', salt: 'SALT_EVIL' }
  ];

  const handleGenerateProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret) return;

    setIsGenerating(true);
    setResult(null);
    setStep(1);

    // Step 1: Witness generation
    await new Promise(r => setTimeout(r, 600));
    setStep(2);

    // Step 2: Compact ZK circuit execution
    await new Promise(r => setTimeout(r, 800));
    setStep(3);

    // Step 3: Ledger submission
    await new Promise(r => setTimeout(r, 600));
    setStep(4);

    // Execute proof verification against Merkle tree
    const commitment = computeCommitment(secret, salt);
    
    // Find leaf index in demo tree
    const proofIndex = 0; // Simulated tree leaf lookup
    const proof = tree.getProof(proofIndex);

    const res = contract.proveAccess(secret, salt, proof);
    setIsGenerating(false);
    setResult(res);

    if (res.success && res.nullifier) {
      onProofSuccess(res.nullifier);
    }
  };

  const calculatedCommitment = secret ? computeCommitment(secret, salt) : '';
  const calculatedNullifier = secret ? computeNullifier(secret) : '';

  return (
    <div className="rounded-2xl bg-midnight-800/90 border border-midnight-700/80 p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-midnight-purple/20 border border-midnight-purple/40 text-midnight-purple">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Generate ZK Membership Proof</h3>
            <p className="text-xs text-slate-400 font-mono">Prove access without leaking identity or commitment</p>
          </div>
        </div>

        <span className="px-3 py-1 text-xs font-mono rounded-full bg-midnight-cyan/10 text-midnight-cyan border border-midnight-cyan/30">
          Compact ZK Engine
        </span>
      </div>

      {/* Preset Selector */}
      <div className="mb-6">
        <label className="block text-xs font-mono text-slate-400 mb-2">Select Quick Test Profile:</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {presetMembers.map((m) => (
            <button
              key={m.label}
              type="button"
              onClick={() => {
                setSecret(m.secret);
                setSalt(m.salt);
                setResult(null);
              }}
              className={`px-3 py-2 text-xs rounded-xl font-mono text-left border transition-all ${
                secret === m.secret
                  ? 'bg-midnight-cyan/15 border-midnight-cyan text-midnight-cyan font-semibold'
                  : 'bg-midnight-900/60 border-midnight-700/50 text-slate-300 hover:bg-midnight-700/50'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleGenerateProof} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-slate-300 mb-1">Private Member Secret:</label>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Enter secret passphrase..."
            className="w-full px-4 py-2.5 rounded-xl bg-midnight-900/80 border border-midnight-700/60 text-slate-100 font-mono text-sm focus:outline-none focus:border-midnight-cyan transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-300 mb-1">Private Member Salt:</label>
          <input
            type="text"
            value={salt}
            onChange={(e) => setSalt(e.target.value)}
            placeholder="Enter salt value..."
            className="w-full px-4 py-2.5 rounded-xl bg-midnight-900/80 border border-midnight-700/60 text-slate-100 font-mono text-sm focus:outline-none focus:border-midnight-cyan transition-colors"
            required
          />
        </div>

        {/* Live Off-Chain Computation Preview */}
        <div className="p-3 rounded-xl bg-midnight-900/50 border border-midnight-700/40 text-xs font-mono space-y-1 text-slate-400">
          <div className="flex justify-between">
            <span>Computed Commitment (Private Witness):</span>
            <span className="text-midnight-cyan font-semibold">{calculatedCommitment.slice(0, 14)}...</span>
          </div>
          <div className="flex justify-between">
            <span>Computed Nullifier (Public Output):</span>
            <span className="text-slate-200">{calculatedNullifier.slice(0, 14)}...</span>
          </div>
        </div>

        {/* Submit Proof Button */}
        <button
          type="submit"
          disabled={isGenerating || !secret}
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-midnight-cyan via-teal-400 to-midnight-purple text-midnight-900 font-bold text-sm hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all duration-200 shadow-lg shadow-midnight-cyan/20 flex items-center justify-center space-x-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Compact ZK Proof (Step {step}/4)...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate & Submit ZK Proof</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Proof Execution Result Banner */}
      {result && (
        <div className={`mt-6 p-4 rounded-xl border text-sm font-mono transition-all ${
          result.success
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
            : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
        }`}>
          {result.success ? (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 font-bold text-emerald-400">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>ACCESS GRANTED (accessGranted = true)</span>
              </div>
              <p className="text-xs text-slate-300">
                Zero-Knowledge circuit executed successfully. Your membership was verified against the allowlist Merkle root without exposing your identity or secret.
              </p>
              <div className="text-[11px] bg-emerald-900/30 p-2.5 rounded-lg border border-emerald-700/40 space-y-1">
                <div><strong className="text-emerald-300">Emitted Nullifier:</strong> {result.nullifier}</div>
                <div><strong className="text-emerald-300">On-Chain Privacy Status:</strong> 0% Identity Leakage</div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center space-x-2 font-bold text-rose-400">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>PROOF VERIFICATION REJECTED</span>
              </div>
              <p className="text-xs text-rose-300">{result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
