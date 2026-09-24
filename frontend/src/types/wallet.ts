export interface WalletAccount {
  address: string;
  network: string;
  balance: string;
  isConnected: boolean;
  walletType?: '1AM Wallet' | 'Lace Wallet' | 'Midnight DApp Connector';
  dustBalance?: string;
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
  contractAddress: string;
  network: string;
}

export interface ZkProofWitness {
  secretKey: string;
  leaf: string;
  nullifier: string;
  merklePath: string[];
  pathDirections: boolean[];
}

export interface ContractExecutionResult {
  success: boolean;
  txHash?: string;
  nullifier?: string;
  blockHeight?: number;
  error?: string;
  timestamp: string;
}
