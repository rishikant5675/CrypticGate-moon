import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PrivacyBanner } from './components/PrivacyBanner';
import { ProofGenerator } from './components/ProofGenerator';
import { AdminPortal } from './components/AdminPortal';
import { MidnightWalletService } from './services/midnightWallet';
import { WalletAccount } from './types/wallet';
import { CrypticGateSimulator, MerkleTree, computeCommitment } from '../../contract/src/contract_simulator';
import { Activity, ShieldCheck, Lock, ExternalLink, Cpu, FileCode2 } from 'lucide-react';

export const App: React.FC = () => {
  const [account, setAccount] = useState<WalletAccount | null>(null);
  
  // Initialize contract & Merkle Tree state
  const [contract] = useState(() => {
    const memberA = computeCommitment('MEMBER_SECRET_ALICE_9921', 'SALT_A_001');
    const memberB = computeCommitment('MEMBER_SECRET_BOB_4410', 'SALT_B_002');
    const memberC = computeCommitment('MEMBER_SECRET_CHARLIE_8829', 'SALT_C_003');
    const tree = new MerkleTree([memberA, memberB, memberC], 8);
    return { simulator: new CrypticGateSimulator(tree.getRoot()), tree };
  });

  const [nullifiers, setNullifiers] = useState<string[]>([]);
  const [ticker, setTicker] = useState<number>(0);

  useEffect(() => {
    const wallet = MidnightWalletService.getInstance();
    const unsubscribe = wallet.subscribe((acc) => setAccount(acc));
    return () => unsubscribe();
  }, []);

  const handleConnectOneAm = async () => {
    const wallet = MidnightWalletService.getInstance();
    await wallet.connectOneAmWallet();
  };

  const handleConnectLace = async () => {
    const wallet = MidnightWalletService.getInstance();
    await wallet.connectLaceWallet();
  };

  const handleDisconnect = () => {
    const wallet = MidnightWalletService.getInstance();
    wallet.disconnect();
  };

  const handleProofSuccess = (nullifier: string) => {
    setNullifiers(prev => [nullifier, ...prev]);
    setTicker(t => t + 1);
  };

  const state = contract.simulator.getState();

  return (
    <div className="min-h-screen bg-midnight-900 text-slate-100 flex flex-col font-sans">
      <Navbar
        account={account}
        onConnectOneAm={handleConnectOneAm}
        onConnectLace={handleConnectLace}
        onDisconnect={handleDisconnect}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-midnight-cyan/10 border border-midnight-cyan/30 text-midnight-cyan text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Knowledge Proof of Membership Protocol</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-midnight-cyan bg-clip-text text-transparent">
            Private Allowlist Access without Identity Leakage
          </h1>
          <p className="text-slate-400 text-sm sm:text-base font-normal leading-relaxed">
            CrypticGate leverages Midnight Compact ZK circuits to allow community members to prove membership on-chain. The public ledger records <code className="text-midnight-cyan">accessGranted = true</code> with zero identity correlation.
          </p>
        </div>

        {/* Privacy Model Highlight Banner */}
        <PrivacyBanner />

        {/* Core App Grid: Prover & Admin */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProofGenerator
            contract={contract.simulator}
            tree={contract.tree}
            onProofSuccess={handleProofSuccess}
          />

          <AdminPortal
            contract={contract.simulator}
            onRootUpdated={() => setTicker(t => t + 1)}
          />
        </div>

        {/* Ledger Event Monitor */}
        <div className="rounded-2xl bg-midnight-800/90 border border-midnight-700/80 p-6 backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-midnight-cyan" />
              <h3 className="text-base font-bold text-white">Live Ledger Access Log (<code className="text-midnight-cyan">accessGranted</code>)</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Total Proved Access: {state.totalAccessCount}</span>
          </div>

          {nullifiers.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-midnight-700/60 rounded-xl text-slate-500 text-xs font-mono">
              No proofs submitted yet in this session. Generate a proof above to emit a public on-chain event!
            </div>
          ) : (
            <div className="space-y-2">
              {nullifiers.map((nullifier, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-midnight-900/80 border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                      VERIFIED PROOF
                    </span>
                    <span className="text-slate-300">Nullifier: {nullifier.slice(0, 24)}...</span>
                  </div>
                  <span className="text-emerald-400 font-semibold">accessGranted = true</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      <footer className="border-t border-midnight-800 bg-midnight-950/80 py-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>CrypticGate &copy; 2026 — Built on Midnight Blockchain Compact ZK Engine</div>
          <div className="flex items-center space-x-4">
            <a href="https://midnight.network" target="_blank" rel="noreferrer" className="hover:text-midnight-cyan transition-colors">Midnight Docs</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-midnight-cyan transition-colors">GitHub Repository</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
