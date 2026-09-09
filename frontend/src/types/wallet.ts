export interface WalletAccount {
  address: string;
  network: string;
  balance: string;
  isConnected: boolean;
  walletType?: '1AM Wallet' | 'Lace Wallet' | 'Midnight Sandbox';
}

export interface MidnightWalletState {
  account: WalletAccount | null;
  isConnecting: boolean;
  error: string | null;
  hasLaceExtension: boolean;
  hasOneAmExtension: boolean;
}

export interface AllowlistStats {
  allowlistRoot: string;
  totalAccessCount: number;
  latestAccessGranted: boolean;
  nullifierCount: number;
}
