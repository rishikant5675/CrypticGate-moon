import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PrivacyBanner } from './components/PrivacyBanner';
import { ProofGenerator } from './components/ProofGenerator';
import { AdminPortal } from './components/AdminPortal';
import { MidnightWalletService } from './services/midnightWallet';
import {
  MidnightContractService,
  PREPROD_CONFIG,
} from './services/midnightContractService';
import { WalletAccount, AllowlistStats } from './types/wallet';
import { ConfirmedTransaction } from './services/indexerService';
import { Activity, ShieldCheck, Lock, ExternalLink, Cpu, CheckCircle2, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [account, setAccount] = useState<WalletAccount | null>(null);
  const [stats, setStats] = useState<AllowlistStats | null>(null);
  const [eventLogs, setEventLogs] = useState<ConfirmedTransaction[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const wallet = MidnightWalletService.getInstance();
    const unsubWallet = wallet.subscribe((acc) => setAccount(acc));

    const contractService = MidnightContractService.getInstance();
    const unsubStats = contractService.subscribe((newStats) => {
      setStats(newStats);
      setEventLogs([...contractService.getEventLogs()]);
    });

    return () => {
      unsubWallet();
      unsubStats();
    };
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const contractService = MidnightContractService.getInstance();
    await contractService.refreshState();
    setEventLogs([...contractService.getEventLogs()]);
    setIsRefreshing(false);
  };

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
            CrypticGate executes Midnight Compact ZK circuits to allow community members to prove membership on-chain. The public ledger records <code className="text-midnight-cyan">accessGranted = true</code> with zero identity correlation.
          </p>
        </div>

        {/* Privacy Model Highlight Banner */}
        <PrivacyBanner />

        {/* Core App Grid: Prover & Admin */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProofGenerator onProofSuccess={handleRefresh} />
          <AdminPortal onRootUpdated={handleRefresh} />
        </div>

        {/* Live Preprod Ledger Event Monitor */}
        <div className="rounded-2xl bg-midnight-800/90 border border-midnight-700/80 p-6 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center space-x-3">
              <Activity className="w-5 h-5 text-midnight-cyan" />
              <h3 className="text-base font-bold text-white">
                Confirmed Midnight Preprod Ledger State (<code className="text-midnight-cyan">checkAccess</code>)
              </h3>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-midnight-700 hover:bg-midnight-600 text-slate-200 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Sync Indexer</span>
              </button>
              <span>Contract:</span>
              <a
                href={PREPROD_CONFIG.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-midnight-cyan hover:underline flex items-center space-x-1 font-bold"
              >
                <span>{PREPROD_CONFIG.rawContractAddress.slice(0, 10)}...</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {eventLogs.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-midnight-700/60 rounded-xl text-slate-500 text-xs font-mono">
              Ready to verify proofs. Execute a membership proof above to generate an on-chain transaction!
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {eventLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-midnight-900/80 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
                >
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> PREPROD TX
                    </span>
                    <a
                      href={PREPROD_CONFIG.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-300 hover:text-midnight-cyan flex items-center space-x-1"
                    >
                      <span>Tx: {log.txHash.slice(0, 18)}...</span>
                      <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                    </a>
                  </div>
                  <div className="flex items-center space-x-4 text-slate-400 text-[11px]">
                    <span>Block #{log.blockHeight}</span>
                    <span className="text-slate-500">{log.timestamp}</span>
                    <span className="text-emerald-400 font-semibold">{log.status}</span>
                  </div>
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
            <a
              href="https://midnight.network"
              target="_blank"
              rel="noreferrer"
              className="hover:text-midnight-cyan transition-colors"
            >
              Midnight Docs
            </a>
            <a
              href={PREPROD_CONFIG.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-midnight-cyan transition-colors"
            >
              Preprod Explorer
            </a>
            <a
              href="https://github.com/rishikant5675/CrypticGate-moon"
              target="_blank"
              rel="noreferrer"
              className="hover:text-midnight-cyan transition-colors"
            >
              GitHub Repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
