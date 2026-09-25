// ============================================================================
// CrypticGate Smart Contract Package
// ----------------------------------------------------------------------------
// Exports Midnight Compact contract schemas, types, and off-chain local
// cryptographic simulator used for Vitest invariant testing.
// ============================================================================

export * from './contract_simulator.js';

export const CONTRACT_NAME = "CrypticGate";
export const CIRCUIT_NAME = "checkAccess";
export const ADMIN_CIRCUIT_NAME = "publishAllowlist";

export interface CrypticGatePrivateState {
  readonly secretKey: Uint8Array;
  readonly merklePath: [Uint8Array, Uint8Array, Uint8Array, Uint8Array, Uint8Array];
  readonly pathDirections: [boolean, boolean, boolean, boolean, boolean];
}
