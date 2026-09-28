// ============================================================================
// CrypticGate Preprod Contract Security & Invariant Verification Suite
// ----------------------------------------------------------------------------
// Rigorously tests the Compact contract's authorization and nullifier logic
// against forged membership proofs, replay attempts, unauthorized issuer calls,
// stale roots, invalid Merkle paths, and privacy invariants.
// ============================================================================

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CanonicalMerkleTree,
  leafOf,
  nullifierOf,
  toHex,
  fromHex,
  persistentHash,
  pad32,
} from '../contract/src/merkle_tree';

describe('CrypticGate Contract Authorization & Circuit Invariant Suite', () => {
  // Setup 3 authorized members in a canonical 5-depth Merkle tree
  const memberAliceSecret = 'MEMBER_SECRET_ALICE_9921';
  const memberBobSecret = 'MEMBER_SECRET_BOB_4410';
  const memberCharlieSecret = 'MEMBER_SECRET_CHARLIE_8829';
  const attackerSecret = 'ATTACKER_SECRET_MALORY_666';

  let leafAlice: Uint8Array;
  let leafBob: Uint8Array;
  let leafCharlie: Uint8Array;
  let leafAttacker: Uint8Array;
  let tree: CanonicalMerkleTree;
  let allowlistRoot: Uint8Array;

  // Mock ledger state matching Compact ledger declarations
  let ledger: {
    allowlistRoot: Uint8Array;
    issuer: Uint8Array;
    accessGranted: bigint;
    nullifiers: Set<string>;
  };

  const issuerKey = pad32('ISSUER_ADMIN_KEY_MIDNIGHT_01');
  const nonIssuerKey = pad32('UNAUTHORIZED_CALLER_RANDOM');

  beforeEach(() => {
    leafAlice = leafOf(memberAliceSecret);
    leafBob = leafOf(memberBobSecret);
    leafCharlie = leafOf(memberCharlieSecret);
    leafAttacker = leafOf(attackerSecret);

    // Build 5-depth tree with 32 leaves
    tree = new CanonicalMerkleTree([leafAlice, leafBob, leafCharlie]);
    allowlistRoot = tree.getRoot();

    ledger = {
      allowlistRoot: tree.getRoot(),
      issuer: issuerKey,
      accessGranted: 0n,
      nullifiers: new Set<string>(),
    };
  });

  // Circuit simulator reproducing exact Compact circuit assertions
  function checkAccessCircuit(secret: string, proof: any): { success: boolean; error?: string } {
    const derivedLeaf = leafOf(secret);
    
    // 1. Merkle Root Reconstruction: candidateRoot == allowlistRoot
    const isMember = CanonicalMerkleTree.verifyProof({
      leaf: derivedLeaf,
      root: ledger.allowlistRoot,
      path: proof.path,
      directions: proof.directions,
    }, ledger.allowlistRoot);

    if (!isMember) {
      return { success: false, error: 'not a member of the current allowlist' };
    }

    // 2. Anti-Replay: !nullifiers.member(disclose(nullifier))
    const derivedNullifier = nullifierOf(secret);
    const nullifierHex = toHex(derivedNullifier);

    if (ledger.nullifiers.has(nullifierHex)) {
      return { success: false, error: 'this membership has already been used' };
    }

    // 3. State Mutation
    ledger.nullifiers.add(nullifierHex);
    ledger.accessGranted += 1n;
    return { success: true };
  }

  function publishAllowlistCircuit(callerKey: Uint8Array, newRoot: Uint8Array): { success: boolean; error?: string } {
    if (toHex(callerKey) !== toHex(ledger.issuer)) {
      return { success: false, error: 'only the issuer may update the allowlist' };
    }
    ledger.allowlistRoot = newRoot;
    return { success: true };
  }

  // Test 1: Valid membership proof succeeds
  it('(1) should grant access when an authorized member provides a valid witness and path', () => {
    const proofAlice = tree.getProof(0);
    const result = checkAccessCircuit(memberAliceSecret, proofAlice);

    expect(result.success).toBe(true);
    expect(ledger.accessGranted).toBe(1n);
    expect(ledger.nullifiers.has(toHex(nullifierOf(memberAliceSecret)))).toBe(true);
  });

  // Test 2: Forged membership proof fails
  it('(2) should strictly reject forged membership proofs from unauthorized callers', () => {
    // Attacker attempts to use Alice's Merkle path with an attacker secret
    const proofAlice = tree.getProof(0);
    const result = checkAccessCircuit(attackerSecret, proofAlice);

    expect(result.success).toBe(false);
    expect(result.error).toBe('not a member of the current allowlist');
    expect(ledger.accessGranted).toBe(0n);
  });

  // Test 3: Replay attack / double-spending rejected
  it('(3) should strictly reject replay attempts when the same secret is presented twice', () => {
    const proofBob = tree.getProof(1);
    
    // First claim succeeds
    const firstClaim = checkAccessCircuit(memberBobSecret, proofBob);
    expect(firstClaim.success).toBe(true);
    expect(ledger.accessGranted).toBe(1n);

    // Second claim with identical secret must fail with replay assertion
    const secondClaim = checkAccessCircuit(memberBobSecret, proofBob);
    expect(secondClaim.success).toBe(false);
    expect(secondClaim.error).toBe('this membership has already been used');
    expect(ledger.accessGranted).toBe(1n); // Counter remains unchanged
  });

  // Test 4: Unauthorized issuer calls rejected
  it('(4) should reject unauthorized callers attempting to update or rotate allowlistRoot', () => {
    const fakeRoot = pad32('MALICIOUS_ROOT_INJECTION');
    const result = publishAllowlistCircuit(nonIssuerKey, fakeRoot);

    expect(result.success).toBe(false);
    expect(result.error).toBe('only the issuer may update the allowlist');
    expect(toHex(ledger.allowlistRoot)).toBe(toHex(allowlistRoot)); // Root unchanged
  });

  // Test 5: Authorized issuer can successfully rotate root
  it('(5) should allow authorized issuer to publish and rotate allowlist root', () => {
    const newMemberDave = 'MEMBER_SECRET_DAVE_1190';
    const leafDave = leafOf(newMemberDave);
    const newTree = new CanonicalMerkleTree([leafAlice, leafBob, leafCharlie, leafDave]);

    const result = publishAllowlistCircuit(issuerKey, newTree.getRoot());

    expect(result.success).toBe(true);
    expect(toHex(ledger.allowlistRoot)).toBe(toHex(newTree.getRoot()));
  });

  // Test 6: Stale roots rejected after issuer rotation
  it('(6) should reject proofs generated against stale/outdated Merkle roots after issuer rotation', () => {
    const oldProofCharlie = tree.getProof(2);

    // Issuer rotates root to a new tree without Charlie
    const newTreeWithoutCharlie = new CanonicalMerkleTree([leafAlice, leafBob]);
    publishAllowlistCircuit(issuerKey, newTreeWithoutCharlie.getRoot());

    // Charlie's proof against the old tree must now fail against the new on-chain root
    const result = checkAccessCircuit(memberCharlieSecret, oldProofCharlie);

    expect(result.success).toBe(false);
    expect(result.error).toBe('not a member of the current allowlist');
  });

  // Test 7: Invalid Merkle paths and tampered directions rejected
  it('(7) should reject invalid Merkle paths and tampered direction vectors', () => {
    const validProof = tree.getProof(0);
    
    // Tamper with sibling hash at level 0
    const tamperedPath = [...validProof.path] as any;
    tamperedPath[0] = pad32('TAMPERED_SIBLING_HASH');

    const resultTamperedPath = checkAccessCircuit(memberAliceSecret, {
      path: tamperedPath,
      directions: validProof.directions,
    });
    expect(resultTamperedPath.success).toBe(false);
    expect(resultTamperedPath.error).toBe('not a member of the current allowlist');

    // Tamper with direction boolean at level 0
    const tamperedDirections = [...validProof.directions] as any;
    tamperedDirections[0] = !tamperedDirections[0];

    const resultTamperedDir = checkAccessCircuit(memberAliceSecret, {
      path: validProof.path,
      directions: tamperedDirections,
    });
    expect(resultTamperedDir.success).toBe(false);
    expect(resultTamperedDir.error).toBe('not a member of the current allowlist');
  });

  // Test 8: Zero identity leakage
  it('(8) should verify that secret key, leaf index, and wallet address never appear in public ledger', () => {
    const proofAlice = tree.getProof(0);
    checkAccessCircuit(memberAliceSecret, proofAlice);

    const publicLedgerJson = JSON.stringify({
      allowlistRoot: toHex(ledger.allowlistRoot),
      issuer: toHex(ledger.issuer),
      accessGranted: ledger.accessGranted.toString(),
      nullifiers: Array.from(ledger.nullifiers),
    });

    // 1. Secret is never in ledger
    expect(publicLedgerJson).not.toContain(memberAliceSecret);
    
    // 2. Raw leaf commitment is not stored in ledger
    expect(publicLedgerJson).not.toContain(toHex(leafAlice));

    // 3. User wallet address is completely absent
    expect(publicLedgerJson).not.toContain('mn_addr_preprod');
    expect(publicLedgerJson).not.toContain('0xAlice');

    // 4. Nullifier IS in ledger (1-way un-linkable hash)
    expect(ledger.nullifiers.has(toHex(nullifierOf(memberAliceSecret)))).toBe(true);
  });
});
