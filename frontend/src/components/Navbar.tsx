import React, { useState } from 'react';
import { Shield, Wallet, Cpu, ExternalLink, CheckCircle2, ChevronDown } from 'lucide-react';
import { WalletAccount } from '../types/wallet';
import { MidnightWalletService } from '../services/midnightWallet';

interface NavbarProps {
  account: WalletAccount | null;
  onConnectOneAm: () => void;
  onConnectLace: () => void;
  onDisconnect: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  account,
  onConnectOneAm,
  onConnectLace,
  onDisconnect
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const walletService = MidnightWalletService.getInstance();
  const hasOneAm = walletService.hasOneAmExtension();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-midnight-900/80 border-b border-midnight-700/60 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-midnight-cyan via-midnight-purple to-midnight-pink p-[2px] shadow-lg shadow-midnight-cyan/20">
            <div className="w-full h-full bg-midnight-900 rounded-[10px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-midnight-cyan" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-midnight-cyan bg-clip-text text-transparent">
                CrypticGate
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-midnight-purple/20 text-midnight-purple border border-midnight-purple/40 rounded-full">
                Midnight ZK
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Private Allowlist Protocol</p>
          </div>
        </div>

        {/* Network & Wallet Actions */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-midnight-800/80 border border-midnight-700/50 text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <Cpu className="w-3.5 h-3.5 text-midnight-cyan" />
            <span>Midnight Testnet</span>
          </div>

          {account ? (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col items-end text-xs">
                <span className="text-slate-300 font-mono font-medium">{account.balance}</span>
                <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {account.walletType || 'Connected'}
                </span>
              </div>
              <button
                onClick={onDisconnect}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-midnight-800 hover:bg-midnight-700 border border-midnight-600/50 text-xs font-mono text-slate-200 transition-all duration-200 shadow-md"
              >
                <span>{account.address.slice(0, 8)}...{account.address.slice(-6)}</span>
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="flex items-center gap-2">
                {/* Direct Connect 1AM Button */}
                <button
                  onClick={onConnectOneAm}
                  className="group relative inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm text-midnight-900 bg-gradient-to-r from-midnight-cyan via-teal-300 to-midnight-cyan hover:brightness-110 transition-all duration-200 shadow-lg shadow-midnight-cyan/20 active:scale-95"
                >
                  <Wallet className="w-4 h-4 text-midnight-900" />
                  <span>Connect 1AM Wallet</span>
                  {hasOneAm && (
                    <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-midnight-900 text-midnight-cyan">
                      Detected
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2.5 rounded-xl bg-midnight-800 hover:bg-midnight-700 border border-midnight-700/60 text-slate-300"
                  title="More Wallet Options"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Wallet Options Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-midnight-800 border border-midnight-700 shadow-2xl p-2 z-50 text-xs font-mono">
                  <button
                    onClick={() => {
                      onConnectOneAm();
                      setShowDropdown(false);
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-midnight-700/80 flex items-center justify-between text-slate-200"
                  >
                    <span>🚀 1AM Wallet</span>
                    {hasOneAm ? (
                      <span className="text-[10px] text-emerald-400 font-bold">Installed</span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Sandbox</span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onConnectLace();
                      setShowDropdown(false);
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-midnight-700/80 flex items-center justify-between text-slate-200"
                  >
                    <span>🌙 Lace Wallet</span>
                    <span className="text-[10px] text-slate-400">Midnight Standard</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
