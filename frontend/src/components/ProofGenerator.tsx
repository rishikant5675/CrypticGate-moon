import React, { useState } from 'react';
import { KeyRound, ShieldAlert, CheckCircle, Loader2, Sparkles, Lock, ArrowRight, ExternalLink } from 'lucide-react';
import {
  MidnightContractService,
  PREPROD_CONFIG,
  computeLeaf,
  computeNullifier,
} from '../services/midnightContractService';
import { ContractExecutionResult } from '../types/wallet';

interface ProofGeneratorProps {
  onProofSuccess?: (nullifier: string, txHash: string) => void;
}

export const ProofGenerator: React.FC<ProofGeneratorProps> = ({ onProofSuccess }) => {
  const [secret, setSecret] = useState('MEMBER_SECRET_ALICE_9921');
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [result, setResult] = useState<ContractExecutionResult | null>(null);

  const presetMembers = [
    { label: 'Alice (Member 1)', secret: 'MEMBER_SECRET_ALICE_9921', desc: 'Authorized Cohort 1' },
    { label: 'Bob (Member 2)', secret: 'MEMBER_SECRET_BOB_4410', desc: 'Authorized Cohort 1' },
    { label: 'Charlie (Member 3)', secret: 'MEMBER_SECRET_CHARLIE_8829', desc: 'Authorized Cohort 1' },
    { label: 'Attacker (Non-Member)', secret: 'ATTACKER_SECRET_MALORY_666', desc: 'Unauthorized (Will Reject)' },
  ];

  const handleGenerateProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret) return;

    setIsGenerating(true);
    setResult(null);
    setStep(1);

    // Step 1: Off-chain witness computation
    await new Promise((r) => setTimeout(r, 600));
    setStep(2);

    // Step 2: Compact ZK Circuit Execution (leafOf, nullifierOf, merkleRootFrom)
    await new Promise((r) => setTimeout(r, 800));
    setStep(3);

    // Step 3: DApp Connector & Preprod Block submission
    await new Promise((r) => setTimeout(r, 700));
    setStep(4);

    const contractService = MidnightContractService.getInstance();
    
    // Witness path vectors matching Compact Vector<5, Bytes<32>>
    const sampleProofWitness = {
      merklePath: [
        '0x10a2f38c89b702910fa312984ab10e987162534a761524351627384950a1b2c3',
        '0x55b1c2d3e4f5061728394a5b6c7d8e9fa0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5',
        '0x99e8d7c6b5a4938271605f4e3d2c1b0a9f8e7d6c5b4a39281706f5e4d3c2b1a0',
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
      ],
      pathDirections: [false, true, false, true, false],
    };

    const res = await contractService.executeCheckAccess(secret, sampleProofWitness);
    setIsGenerating(false);
    setResult(res);

    if (res.success && res.nullifier && res.txHash) {
      onProofSuccess?.(res.nullifier, res.txHash);
    }
  };

  const calculatedLeaf = secret ? computeLeaf(secret) : '';
  const calculatedNullifier = secret ? computeNullifier(secret) : '';

  return (
    <div className="rounded-2xl bg-midnight-800/90 border border-midnight-700/80 p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-midnight-purple/20 border border-midnight-purple/40 text-midnight-purple">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Execute ZK Membership Proof</h3>
            <p className="text-xs text-slate-400 font-mono">
              Compact circuit execution via Midnight Preprod DApp Connector
            </p>
          </div>
        </div>

        <span className="px-3 py-1 text-xs font-mono rounded-full bg-midnight-cyan/10 text-midnight-cyan border border-midnight-cyan/30">
          Compact v0.15+ Engine
        </span>
      </div>

      {/* Preset Profile Selector */}
      <div className="mb-6">
        <label className="block text-xs font-mono text-slate-400 mb-2">Select User Persona:</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {presetMembers.map((m) => (
            <button
              key={m.label}
              type="button"
              onClick={() => {
                setSecret(m.secret);
                setResult(null);
                setStep(0);
              }}
              className={`px-3 py-2 text-xs rounded-xl font-mono text-left border transition-all ${
                secret === m.secret
                  ? 'bg-midnight-cyan/15 border-midnight-cyan text-midnight-cyan font-semibold'
                  : 'bg-midnight-900/60 border-midnight-700/50 text-slate-300 hover:bg-midnight-700/50'
              }`}
            >
              <div className="font-bold truncate">{m.label}</div>
              <div className="text-[10px] text-slate-400 truncate mt-0.5">{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleGenerateProof} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-slate-300 mb-1.5">
            Private Member Secret (<code className="text-midnight-cyan font-semibold">witness secretKey()</code>)
          </label>
          <div className="relative">
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="e.g. MEMBER_SECRET_ALICE_9921"
              className="w-full px-3.5 py-2.5 rounded-xl bg-midnight-900/90 border border-midnight-700/80 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-midnight-cyan focus:ring-1 focus:ring-midnight-cyan"
              required
            />
            <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Kept strictly client-side in private witness memory. Never broadcast to the public blockchain.
          </p>
        </div>

        {/* Cryptographic Witness Inspection */}
        <div className="p-3.5 rounded-xl bg-midnight-900/60 border border-midnight-700/50 space-y-2 text-xs font-mono">
          <div className="flex justify-between items-center text-slate-400">
            <span>Derived Leaf Hash (<code className="text-slate-300">leafOf</code>):</span>
            <span className="text-midnight-cyan truncate max-w-[200px]">{calculatedLeaf ? `0x${calculatedLeaf.slice(0, 16)}...` : 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Derived Nullifier (<code className="text-slate-300">nullifierOf</code>):</span>
            <span className="text-midnight-purple truncate max-w-[200px]">{calculatedNullifier ? `0x${calculatedNullifier.slice(0, 16)}...` : 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Target Contract:</span>
            <a
              href={PREPROD_CONFIG.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-midnight-cyan hover:underline flex items-center space-x-1"
            >
              <span>{PREPROD_CONFIG.rawContractAddress.slice(0, 10)}...</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Step-by-Step Progress Pipeline */}
        {isGenerating && (
          <div className="p-4 rounded-xl bg-midnight-900/80 border border-midnight-cyan/40 space-y-3">
            <div className="flex items-center space-x-2 text-midnight-cyan text-sm font-mono font-semibold">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Compact ZK Proving Pipeline Active</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
              <div className={`p-2 rounded-lg ${step >= 1 ? 'bg-midnight-cyan/20 border border-midnight-cyan text-midnight-cyan' : 'bg-midnight-800 text-slate-500'}`}>
                1. Private Witness
              </div>
              <div className={`p-2 rounded-lg ${step >= 2 ? 'bg-midnight-cyan/20 border border-midnight-cyan text-midnight-cyan' : 'bg-midnight-800 text-slate-500'}`}>
                2. Compact ZK
              </div>
              <div className={`p-2 rounded-lg ${step >= 3 ? 'bg-midnight-cyan/20 border border-midnight-cyan text-midnight-cyan' : 'bg-midnight-800 text-slate-500'}`}>
                3. DApp Connector
              </div>
              <div className={`p-2 rounded-lg ${step >= 4 ? 'bg-midnight-cyan/20 border border-midnight-cyan text-midnight-cyan' : 'bg-midnight-800 text-slate-500'}`}>
                4. Preprod Block
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isGenerating || !secret}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-midnight-cyan via-cyan-400 to-midnight-purple text-midnight-950 font-bold text-sm hover:opacity-95 transition-all shadow-lg shadow-midnight-cyan/20 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Executing Proof on Midnight Preprod...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Prove Membership & Unlock Gate (<code className="text-midnight-950 font-mono">checkAccess</code>)</span>
            </>
          )}
        </button>
      </form>

      {/* Execution Result Banner */}
      {result && (
        <div
          className={`mt-5 p-4 rounded-xl border text-xs font-mono space-y-2 ${
            result.success
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center space-x-2 font-bold text-sm">
            {result.success ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>ZK Gate Passed! Access Verified on Preprod</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Verification Failed (Circuit Constraint)</span>
              </>
            )}
          </div>

          {result.success ? (
            <div className="space-y-1.5 pt-1 text-slate-300">
              <div className="flex justify-between items-center">
                <span>Transaction Hash:</span>
                <a
                  href={`${PREPROD_CONFIG.explorerUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-midnight-cyan hover:underline flex items-center space-x-1 font-bold"
                >
                  <span className="truncate max-w-[180px]">{result.txHash}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex justify-between">
                <span>Spent Nullifier:</span>
                <span className="text-slate-400 truncate max-w-[200px]">{result.nullifier}</span>
              </div>
              <div className="flex justify-between">
                <span>Preprod Block Height:</span>
                <span className="text-emerald-400 font-semibold">#{result.blockHeight}</span>
              </div>
              <div className="mt-2 text-[11px] text-emerald-400 bg-emerald-900/30 p-2 rounded-lg border border-emerald-500/20">
                🔒 Zero Identity Leakage: On-chain ledger state recorded <code className="text-white">accessGranted.increment(1)</code> without disclosing your secret or address.
              </div>
            </div>
          ) : (
            <div className="pt-1 text-rose-300">
              <p>{result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
