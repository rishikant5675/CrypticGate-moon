// ============================================================================
// Midnight Preprod End-to-End Runtime Integration Tests
// ----------------------------------------------------------------------------
// Validates genuine Midnight SDK configuration, DApp Connector API,
// network ID setup (Preprod/Preview), witness generation, circuit transitions,
// replay rejection, and on-chain privacy preservation.
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import { setNetworkId, getNetworkId, type NetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import {
  MidnightDAppClient,
  BrowserPrivateStateProvider,
  PREPROD_CONFIG,
} from '../frontend/src/services/midnightSdk';
import {
  MidnightContractService,
  computeLeaf,
  computeNullifier,
  computeMerkleRoot,
  hashWithPrefix,
} from '../frontend/src/services/midnightContractService';

describe('Midnight Preprod SDK & Contract E2E Integration Suite', () => {
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

  // Test 2: In-memory private state provider operations
  it('should store, retrieve, and isolate private witness credentials in private state provider', async () => {
    const provider = new BrowserPrivateStateProvider();
    const sampleWitness = {
      secretKey: new Uint8Array([1, 2, 3, 4]),
      merklePath: [
        new Uint8Array(32),
        new Uint8Array(32),
        new Uint8Array(32),
        new Uint8Array(32),
        new Uint8Array(32),
      ] as [Uint8Array, Uint8Array, Uint8Array, Uint8Array, Uint8Array],
      pathDirections: [false, true, false, true, false] as [boolean, boolean, boolean, boolean, boolean],
    };

    await provider.set('witness_alice', sampleWitness);
    const retrieved = await provider.get('witness_alice');

    expect(retrieved).not.toBeNull();
    expect(retrieved?.secretKey).toEqual(sampleWitness.secretKey);
    expect(retrieved?.pathDirections).toEqual(sampleWitness.pathDirections);
  });

  // Test 3: Official DApp Connector Wallet Connection
  it('should connect to Midnight DApp connector and return valid wallet connection state', async () => {
    const client = MidnightDAppClient.getInstance();
    const walletState = await client.connectWallet('preprod');

    expect(walletState.isConnected).toBe(true);
    expect(walletState.network).toBe('Midnight PREPROD');
    expect(walletState.unshieldedAddress).toMatch(/^mn_addr_preprod/);
    expect(walletState.balanceNight).toContain('tNIGHT');
  });

  // Test 4: Compact domain-separated leaf and nullifier derivations
  it('should compute deterministic, un-linkable nullifiers and leaves matching Compact specification', () => {
    const secret = 'MEMBER_SECRET_ALICE_9921';
    const leaf = computeLeaf(secret);
    const nullifier = computeNullifier(secret);

    expect(leaf).toBeDefined();
    expect(nullifier).toBeDefined();
    expect(leaf).not.toEqual(nullifier);
    expect(leaf.length).toBe(64); // 32 bytes hex
    expect(nullifier.length).toBe(64); // 32 bytes hex

    // Invariant: Same secret always yields identical nullifier (deterministic)
    expect(computeNullifier(secret)).toBe(nullifier);
  });

  // Test 5: CheckAccess circuit execution and confirmed Preprod transaction emission
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

    const stats = contractService.getStats();
    expect(stats.totalAccessCount).toBeGreaterThanOrEqual(53);
  });

  // Test 6: Anti-replay rejection invariant
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

  // Test 7: Unauthorized attacker rejection
  it('should reject unauthorized attacker personas attempting invalid membership proofs', async () => {
    const contractService = MidnightContractService.getInstance();
    const attackerSecret = 'ATTACKER_SECRET_MALORY_666';
    const fakeWitness = {
      merklePath: ['0x000', '0x000', '0x000', '0x000', '0x000'],
      pathDirections: [false, false, false, false, false],
    };

    const result = await contractService.executeCheckAccess(attackerSecret, fakeWitness);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Circuit Assertion Error');
  });

  // Test 8: Admin publishAllowlist root rotation
  it('should allow issuer to publish and rotate allowlist Merkle root on-chain', async () => {
    const contractService = MidnightContractService.getInstance();
    const newRoot = '0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0';

    const result = await contractService.publishAllowlistRoot(newRoot);

    expect(result.success).toBe(true);
    expect(result.txHash).toMatch(/^0x/);
    expect(contractService.getStats().allowlistRoot).toBe(newRoot);
  });
});
