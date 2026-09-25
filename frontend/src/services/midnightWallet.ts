// ============================================================================
// Midnight Wallet Adapter Service
// ----------------------------------------------------------------------------
// Exposes the official Midnight DApp Connector API & connection manager
// ============================================================================

import { MidnightDAppClient, WalletConnectionState } from './midnightSdk';
import { WalletAccount } from '../types/wallet';

export class MidnightWalletService {
  private static instance: MidnightWalletService;
  private client: MidnightDAppClient = MidnightDAppClient.getInstance();

  private constructor() {}

  public static getInstance(): MidnightWalletService {
    if (!MidnightWalletService.instance) {
      MidnightWalletService.instance = new MidnightWalletService();
    }
    return MidnightWalletService.instance;
  }

  public hasLaceExtension(): boolean {
    const injected = this.client.getInjectedWallet();
    return !!injected && injected.name.toLowerCase().includes('lace');
  }

  public hasOneAmExtension(): boolean {
    const injected = this.client.getInjectedWallet();
    return !!injected && injected.name.toLowerCase().includes('1am');
  }

  public async connectLaceWallet(network: 'preprod' | 'preview' = 'preprod'): Promise<WalletAccount> {
    const state = await this.client.connectWallet(network);
    return {
      address: state.unshieldedAddress,
      network: state.network,
      balance: state.balanceNight,
      dustBalance: state.balanceDust,
      isConnected: state.isConnected,
      walletType: 'Lace Wallet',
    };
  }

  public async connectOneAmWallet(network: 'preprod' | 'preview' = 'preprod'): Promise<WalletAccount> {
    const state = await this.client.connectWallet(network);
    return {
      address: state.unshieldedAddress,
      network: state.network,
      balance: state.balanceNight,
      dustBalance: state.balanceDust,
      isConnected: state.isConnected,
      walletType: '1AM Wallet',
    };
  }

  public disconnect(): void {
    this.client.disconnect();
  }

  public getAccount(): WalletAccount | null {
    const state = this.client.getWalletState();
    if (!state) return null;
    return {
      address: state.unshieldedAddress,
      network: state.network,
      balance: state.balanceNight,
      dustBalance: state.balanceDust,
      isConnected: state.isConnected,
      walletType: state.walletName.includes('1AM') ? '1AM Wallet' : 'Lace Wallet',
    };
  }

  public subscribe(listener: (account: WalletAccount | null) => void): () => void {
    return this.client.subscribe((state) => {
      if (!state) {
        listener(null);
      } else {
        listener({
          address: state.unshieldedAddress,
          network: state.network,
          balance: state.balanceNight,
          dustBalance: state.balanceDust,
          isConnected: state.isConnected,
          walletType: state.walletName.includes('1AM') ? '1AM Wallet' : 'Lace Wallet',
        });
      }
    });
  }
}
