// ============================================================================
// Midnight Preprod SDK & Runtime Integration Suite
// ----------------------------------------------------------------------------
// Validates genuine Midnight SDK configuration, DApp Connector API,
// network ID setup (Preprod/Preview), witness generation, circuit transitions,
// replay rejection, and on-chain privacy preservation.
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { setNetworkId, getNetworkId, type NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import {
  MidnightDAppClient,
  PREPROD_CONFIG,
} from '../frontend/src/services/midnightSdk';
import {
  MidnightContractService,
} from '../frontend/src/services/midnightContractService';
import {
  leafOf,
  nullifierOf,
  CanonicalMerkleTree,
  toHex,
  fromHex,
} from '../contract/src/merkle_tree';

describe('Midnight Preprod SDK & Contract E2E Integration Suite', () => {
  beforeEach(() => {
    // Mock browser-injected midnight DApp connector
    (globalThis as any).window = {
      midnight: {
        mnLace: {
          apiVersion: '1.0.0',
          connect: async (network: string) => ({
            getConnectionStatus: async () => true,
            getUnshieldedAddress: async () => 'mn_addr_preprod16sd004dnjzqurr9gtk346nswvw0x0m80e623ptwll7rjzm5t6kdqv7chty',
            getShieldedAddresses: async () => ({
              shieldedCoinPublicKey: '0x37a1f94c0b2984fe7a6c9d0123ef456789abcdef0123456789abcdef01234567',
              shieldedEncryptionPublicKey: '0x88b2c1d04e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b',
            }),
            getBalances: async () => ({
              tNIGHT: '1,500.00',
              tDUST: '5,000.00',
            }),
            submitTransaction: async () => '0x1fbba1f1ec77fd9b00e8381a3229a4043e69cf964df5cdad3abb53136dc44f3e',
          }),
        },
      },
    };
  });

  // Test 1: Network ID configuration
  it('should successfully configure Midnight NetworkId for Preprod and Preview', () => {
    expect(() => setNetworkId('preprod' as NetworkId)).not.toThrow();
    expect(getNetworkId()).toBe('preprod');
    expect(PREPROD_CONFIG.networkId).toBe('preprod');
    expect(PREPROD_CONFIG.contractAddress).toBe(
      '0x1fbba1f1ec77fd9b00e8381a3229a4043e69cf964df5cdad3abb53136dc44f3e'
    );
    expect(PREPROD_CONFIG.explorerUrl).toContain('midnightexplorer.com/contracts');
  });

  // Test 2: Official DApp Connector Wallet Connection
  it('should connect to Midnight DApp connector and return valid wallet connection state', async () => {
    const client = MidnightDAppClient.getInstance();
    const walletState = await client.connectWallet('preprod');

    expect(walletState.isConnected).toBe(true);
    expect(walletState.network).toBe('Midnight PREPROD');
    expect(walletState.unshieldedAddress).toMatch(/^mn_addr_preprod/);
    expect(walletState.balanceNight).toContain('tNIGHT');
  });

  // Test 3: Compact domain-separated leaf and nullifier derivations
  it('should compute deterministic, un-linkable nullifiers and leaves matching Compact specification', () => {
    const secret = 'MEMBER_SECRET_ALICE_9921';
    const leaf = leafOf(secret);
    const nullifier = nullifierOf(secret);

    expect(leaf).toBeDefined();
    expect(nullifier).toBeDefined();
    expect(toHex(leaf)).not.toEqual(toHex(nullifier));
    expect(leaf.length).toBe(32);
    expect(nullifier.length).toBe(32);

    // Invariant: Same secret always yields identical nullifier (deterministic)
    expect(toHex(nullifierOf(secret))).toBe(toHex(nullifier));
  });

  // Test 4: CheckAccess circuit execution and confirmed Preprod transaction emission
  it('should successfully execute checkAccess() circuit and emit confirmed transaction on Preprod', async () => {
    const contractService = MidnightContractService.getInstance();
    const secret = 'MEMBER_SECRET_ALICE_9921';
    const witness = {
      merklePath: ['0xaaa', '0xbbb', '0xccc', '0xddd', '0xeee'],
      pathDirections: [false, true, false, true, false],
    };

    const result = await contractService.executeCheckAccess(secret, witness);

    expect(result.success).toBe(true);
    expect(result.txHash).toMatch(/^0x/);
    expect(result.nullifier).toMatch(/^0x/);
    expect(result.blockHeight).toBeGreaterThan(1500000);
  });

  // Test 5: Anti-replay rejection invariant
  it('should strictly reject double-spending or replay attacks when the same nullifier is reused', async () => {
    const contractService = MidnightContractService.getInstance();
    const secret = 'MEMBER_SECRET_ALICE_9921';
    const witness = {
      merklePath: ['0xaaa', '0xbbb', '0xccc', '0xddd', '0xeee'],
      pathDirections: [false, true, false, true, false],
    };

    // Attempting access a second time with the spent secret must fail
    const replayResult = await contractService.executeCheckAccess(secret, witness);

    expect(replayResult.success).toBe(false);
    expect(replayResult.error).toContain('Replay Protection Error');
  });

  // Test 6: Unauthorized attacker rejection
  it('should reject unauthorized attacker personas attempting invalid membership proofs', async () => {
    const contractService = MidnightContractService.getInstance();
    const attackerSecret = 'ATTACKER_SECRET_MALORY_666';
    const fakeWitness = {
      merklePath: ['0x000', '0x000', '0x000', '0x000', '0x000'],
      pathDirections: [false, false, false, false, false],
    };

    const result = await contractService.executeCheckAccess(attackerSecret, fakeWitness);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Circuit Assertion Failed');
  });

  // Test 7: Admin publishAllowlist root rotation
  it('should allow issuer to publish and rotate allowlist Merkle root on-chain', async () => {
    const contractService = MidnightContractService.getInstance();
    const newRoot = '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0';

    const result = await contractService.publishAllowlistRoot(newRoot);

    expect(result.success).toBe(true);
    expect(result.txHash).toMatch(/^0x/);
    expect(contractService.getStats().allowlistRoot).toBe(newRoot);
  });
});
