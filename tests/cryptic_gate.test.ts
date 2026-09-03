import { describe, it, expect, beforeEach } from 'vitest';
import {
  CrypticGateSimulator,
  MerkleTree,
  computeCommitment,
  computeNullifier,
  sha256
} from '../contract/src/contract_simulator.js';

describe('CrypticGate - Private Allowlist Membership ZK Proofs', () => {
  // Test Setup: Create private allowlist members
  const memberA = { secret: 'MEMBER_SECRET_ALICE_9921', salt: 'SALT_A_001' };
  const memberB = { secret: 'MEMBER_SECRET_BOB_4410', salt: 'SALT_B_002' };
  const memberC = { secret: 'MEMBER_SECRET_CHARLIE_8829', salt: 'SALT_C_003' };
  const nonMember = { secret: 'ATTACKER_SECRET_MALORY_666', salt: 'SALT_EVIL' };

  let commitmentA: string;
  let commitmentB: string;
  let commitmentC: string;
  let tree: MerkleTree;
  let contract: CrypticGateSimulator;

  beforeEach(() => {
    commitmentA = computeCommitment(memberA.secret, memberA.salt);
    commitmentB = computeCommitment(memberB.secret, memberB.salt);
    commitmentC = computeCommitment(memberC.secret, memberC.salt);

    tree = new MerkleTree([commitmentA, commitmentB, commitmentC], 8);
    contract = new CrypticGateSimulator(tree.getRoot());
  });

  // Requirement Test (a): Valid member proof succeeds
  it('(a) should grant access when a valid member provides a correct ZK membership proof', () => {
    const proofA = tree.getProof(0); // Member A leaf index
    const result = contract.proveAccess(memberA.secret, memberA.salt, proofA);

    expect(result.success).toBe(true);
    expect(result.nullifier).toBe(computeNullifier(memberA.secret));
    
    const state = contract.getState();
    expect(state.latestAccessGranted).toBe(true);
    expect(state.totalAccessCount).toBe(1);
  });

  // Requirement Test (b): Non-member proof fails
  it('(b) should reject access when a non-member attempts to generate a proof with invalid credentials', () => {
    const fakeProof = tree.getProof(0);
    const result = contract.proveAccess(nonMember.secret, nonMember.salt, fakeProof);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid allowlist proof');
    
    const state = contract.getState();
    expect(state.latestAccessGranted).toBe(false);
    expect(state.totalAccessCount).toBe(0);
  });

  // Requirement Test (c): Zero identity leakage — commitments/secrets/addresses never appear in public ledger
  it('(c) should strictly ensure secret, identity address, and commitment never appear in public ledger state', () => {
    const proofB = tree.getProof(1);
    contract.proveAccess(memberB.secret, memberB.salt, proofB);

    const state = contract.getState();
    const serializedState = JSON.stringify({
      allowlistRoot: state.allowlistRoot,
      adminPk: state.adminPk,
      latestAccessGranted: state.latestAccessGranted,
      totalAccessCount: state.totalAccessCount,
      nullifiers: Array.from(state.nullifierSet)
    });

    // Verify secret is NOT in public state
    expect(serializedState).not.toContain(memberB.secret);
    
    // Verify salt is NOT in public state
    expect(serializedState).not.toContain(memberB.salt);
    
    // Verify individual raw commitment hash is NOT stored in public state (only Merkle root is public)
    expect(serializedState).not.toContain(commitmentB);

    // Verify raw user wallet address/identity is completely absent
    expect(serializedState).not.toContain('0xAlice');
    expect(serializedState).not.toContain('0xBob');

    // Verify nullifier IS present, but it's a 1-way un-linkable hash
    const expectedNullifier = computeNullifier(memberB.secret);
    expect(state.nullifierSet.has(expectedNullifier)).toBe(true);
  });

  it('should prevent double-spending or replay attacks via nullifier set', () => {
    const proofA = tree.getProof(0);
    
    // First attempt succeeds
    const res1 = contract.proveAccess(memberA.secret, memberA.salt, proofA);
    expect(res1.success).toBe(true);

    // Second attempt with same secret fails
    const res2 = contract.proveAccess(memberA.secret, memberA.salt, proofA);
    expect(res2.success).toBe(false);
    expect(res2.error).toContain('Nullifier already used');
    expect(contract.getState().totalAccessCount).toBe(1);
  });

  it('should allow admin to update Merkle root when new members are onboarded', () => {
    const newMember = { secret: 'NEW_MEMBER_SECRET_55', salt: 'SALT_NEW' };
    const commitmentNew = computeCommitment(newMember.secret, newMember.salt);
    
    const newTree = new MerkleTree([commitmentA, commitmentB, commitmentC, commitmentNew], 8);
    contract.updateAllowlistRoot(newTree.getRoot());

    expect(contract.getState().allowlistRoot).toBe(newTree.getRoot());

    const proofNew = newTree.getProof(3);
    const result = contract.proveAccess(newMember.secret, newMember.salt, proofNew);
    expect(result.success).toBe(true);
  });

  it('should correctly compute Merkle proof verification for deep trees', () => {
    const testLeaves = Array.from({ length: 16 }, (_, i) => sha256(`LEAF_${i}`));
    const testTree = new MerkleTree(testLeaves, 8);
    const proof = testTree.getProof(5);

    const isValid = MerkleTree.verifyProof(testLeaves[5], testTree.getRoot(), proof);
    expect(isValid).toBe(true);
  });
});
