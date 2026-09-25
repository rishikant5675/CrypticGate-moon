# 🛡️ Product Proposal: CrypticGate

> **Confidential Allowlist Access Control Protocol Powered by Midnight Blockchain Compact Zero-Knowledge Proofs**

---

## 1. Executive Summary & Problem Statement

Modern decentralized applications (dApps) frequently require gating access—whether for exclusive token whitelist allocations, private DAO governance panels, confidential alpha software distribution, or gated community portals. 

However, on public blockchains like Ethereum and standard EVM networks, proving membership requires either:
1. Publishing your public wallet address on an unencrypted on-chain allowlist (`mapping(address => bool)`).
2. Signing an on-chain transaction from your whitelisted address, which permanently links your personal wallet identity to complete financial holdings, net worth, and past transaction graphs.

This fundamental architectural flaw destroys user privacy, enables deanonymization attacks, and makes high-value community participants prime targets for phishing, social engineering, and targeted surveillance.

**CrypticGate** solves this problem by utilizing **Midnight's Compact ZK smart contract language**. Members prove they belong to an admin-managed private allowlist using client-side zero-knowledge membership proofs without ever revealing their secret credentials, wallet address, or specific leaf index to the public blockchain ledger.

---

## 2. Technical Architecture & Cryptographic Model

CrypticGate operates on Midnight's **dual-state privacy architecture**, cleanly separating off-chain private witness generation from on-chain public verification:

```
 +─────────────────────────────────────────────────────────────────────────+
 |                     OFF-CHAIN PROVER (CLIENT-SIDE)                      |
 |                                                                         |
 |   [Private Secret + Salt] ───> [Compact Witness Generator]              |
 |                                          │                              |
 |                                          ▼                              |
 |   [Private Merkle Proof]  ───> [Midnight HTTP Prover / Proof Server]    |
 |                                          │                              |
 |                                          ▼                              |
 |   [ZK Proof + Nullifier]  ───> [Midnight Lace / 1AM DApp Connector]     |
 +──────────────────────────────────────────┬──────────────────────────────+
                                            │ (Signed Transaction)
                                            ▼
 +─────────────────────────────────────────────────────────────────────────+
 |                      MIDNIGHT PREPROD BLOCKCHAIN                        |
 |                                                                         |
 |   Smart Contract: contracts/cryptic_gate.compact                        |
 |                                                                         |
 |   1. Merkle Inclusion Check:                                            |
 |      Reconstructs candidate root from private witness leaf and path.    |
 |      assert(candidateRoot == allowlistRoot, "not in allowlist");        |
 |                                                                         |
 |   2. Single-Use Nullifier Verification (Anti-Replay):                   |
 |      assert(!nullifiers.member(nullifier), "already spent");            |
 |      nullifiers.insert(disclose(nullifier));                            |
 |                                                                         |
 |   3. Access Signal Emission:                                            |
 |      accessGranted.increment(1);                                        |
 +─────────────────────────────────────────────────────────────────────────+
```

### Key Cryptographic Primitives:
1. **Leaf Commitment Derivation (`leafOf`)**:
   $$\text{Leaf} = \text{persistentHash}([\text{pad}(32, \text{"crypticgate:leaf"}), \text{secret}])$$
2. **Deterministic Unlinkable Nullifier (`nullifierOf`)**:
   $$\text{Nullifier} = \text{persistentHash}([\text{pad}(32, \text{"crypticgate:null"}), \text{secret}])$$
3. **On-Chain Merkle Tree Inclusion**:
   $$\text{candidateRoot} = \text{merkleRootFrom}(\text{Leaf}, \text{WitnessPath}, \text{Directions})$$

---

## 3. Comparative Analysis: CrypticGate vs Existing Solutions

| Feature / Dimension | Public EVM Whitelist | Centralized Relayers / API | CrypticGate (Midnight Compact) |
| :--- | :---: | :---: | :---: |
| **Identity Privacy** | ❌ None (Public Address) | ⚠️ Partial (Server Logs IP/Data) | ✅ **Absolute Zero-Knowledge** |
| **Trust Model** | Decentralized, but unprivate | Centralized Trusted Third Party | ✅ **Decentralized & Trustless** |
| **Double-Claim Prevention** | On-chain address check | Centralized Database | ✅ **On-Chain Nullifier Set** |
| **Sybil Resistance** | Wallet-based | IP/Email/KYC | ✅ **Merkle Root Cryptography** |
| **Identity Leakage to Explorer** | 100% Leaked | Leaked to Relayer | ✅ **0% Leakage (No Address in Tx)** |

---

## 4. Privacy Guarantees & Threat Model

### An Observer of the Public Ledger CANNOT See:
- ❌ The prover's wallet address or real-world identity.
- ❌ Which specific member index in the allowlist proved eligibility.
- ❌ The secret key or salt used to generate the commitment.
- ❌ Any link between multiple transactions originating from the same member under different cohorts.

### An Observer of the Public Ledger CAN See:
- ✅ A verifiable boolean confirmation that a legitimate member unlocked the gate (`accessGranted.increment(1)`).
- ✅ Total access count counter on-chain.
- ✅ The spent nullifier hash (preventing replay attacks).
- ✅ The current allowlist Merkle root published by the issuer.

---

## 5. Smart Contract Specification (`contracts/cryptic_gate.compact`)

- **Language Version**: `pragma language_version >= 0.15;`
- **Ledger States**:
  - `export ledger allowlistRoot: Bytes<32>`: Root hash committing to authorized members.
  - `export ledger issuer: ZswapCoinPublicKey`: Address authorized to rotate allowlists.
  - `export ledger accessGranted: Counter`: Public counter tracking total verified check-ins.
  - `export ledger nullifiers: Set<Bytes<32>>`: Spent nullifiers preventing double-spending.
- **Circuit Transitions**:
  - `export circuit publishAllowlist(newRoot: Bytes<32>): []`: Admin updates/rotates root.
  - `export circuit checkAccess(): []`: Core private proof verification transition.
  - `export circuit publicStats(): [Bytes<32>, Uint<64>]`: Read-only view for dashboards.

---

## 6. Preprod Deployment & Verifiability

- **Network**: Midnight Preprod (Testnet)
- **Deployed Contract ID**: `0x1fbba1f1ec77fd9b00e8381a3229a4043e69cf964df5cdad3abb53136dc44f3e`
- **Midnight Explorer**: [https://preprod.midnightexplorer.com/contracts/0x1fbba1f1ec77fd9b00e8381a3229a4043e69cf964df5cdad3abb53136dc44f3e](https://preprod.midnightexplorer.com/contracts/0x1fbba1f1ec77fd9b00e8381a3229a4043e69cf964df5cdad3abb53136dc44f3e)
- **Verified Preprod Cohort Users**: 50 real community participants logged in `USERS.md` and `PREPROD_USERS.md`.

---

## 7. Roadmap & Future Work

1. **Phase 1 (Completed - Level 5)**:
   - Implementation of `cryptic_gate.compact` with Merkle tree inclusion and anti-replay nullifiers.
   - Preprod contract deployment and 50-user testing cohort feedback loop.
   - Genuine Midnight SDK integration with Lace & 1AM DApp Connector.
2. **Phase 2 (Post-Hackathon)**:
   - Dynamic threshold-gated tiers (e.g. Bronze, Silver, Gold pass levels within a single circuit).
   - Integration with Midnight ZSwap tokens for private pay-to-access gates.
   - Automated Merkle tree batch insertion via off-chain indexer service.
