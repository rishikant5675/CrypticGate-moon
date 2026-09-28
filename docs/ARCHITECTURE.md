# 🏗️ CrypticGate System Architecture

CrypticGate is a decentralized, privacy-preserving allowlist verification protocol built natively on the **Midnight Network** utilizing **Compact smart contracts** and **client-side Zero-Knowledge proofs**.

---

## 1. High-Level Topology

```
+─────────────────────────────────────────────────────────────────────────────+
|                              CLIENT BROWSER                                 |
|                                                                             |
|  +─────────────────────────+          +──────────────────────────────────+  |
|  |   React 18 + Vite dApp  | <──────> |   Midnight Lace / 1AM Wallet     |  |
|  |   (UI & State Manager)  |          |   (DApp Connector API Standard)  |  |
|  +────────────┬────────────+          +─────────────────┬────────────────+  |
|               │                                         │                   |
|               ▼                                         │                   |
|  +─────────────────────────+                            │                   |
|  | Compact Witness Engine  |                            │                   |
|  | (secretKey, merklePath) |                            │                   |
|  +────────────┬────────────+                            │                   |
|               │                                         │                   |
+───────────────┼─────────────────────────────────────────┼───────────────────+
                │                                         │
                ▼                                         │ (Signed ZK Tx)
+──────────────────────────────+                          │
| Midnight HTTP Proof Server   |                          │
| (ZK-SNARK Circuit Synthesis) |                          │
+───────────────┬──────────────+                          │
                │                                         │
                ▼                                         ▼
+─────────────────────────────────────────────────────────────────────────────+
|                         MIDNIGHT PREPROD BLOCKCHAIN                         |
|                                                                             |
|  +───────────────────────────────────────────────────────────────────────+  |
|  | Compact Smart Contract: contracts/cryptic_gate.compact                |  |
|  |                                                                       |  |
|  | • allowlistRoot : Bytes<32> (Merkle tree root of eligible members)    |  |
|  | • nullifiers    : Set<Bytes<32>> (Spent nullifiers / anti-replay)     |  |
|  | • accessGranted : Counter (Verified public check-ins)                 |  |
|  | • issuer        : ZswapCoinPublicKey (Authorized admin address)       |  |
|  +───────────────────────────────────────────────────────────────────────+  |
|                                                                             |
+──────────────────────────────────────┬──────────────────────────────────────+
                                       │
                                       ▼
+─────────────────────────────────────────────────────────────────────────────+
|                    MIDNIGHT GRAPHQL INDEXER & EXPLORER                      |
|  Endpoint: https://indexer.preprod.midnight.network/api/v4/graphql          |
|  Explorer: https://preprod.midnightexplorer.com/contracts/0x1fbba1f1...     |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 2. Component Breakdown

### 1. Compact Smart Contract (`contracts/cryptic_gate.compact`)
- **Language**: Midnight Compact (v0.15+)
- **Circuits**:
  - `checkAccess()`: Verifies membership witness against `allowlistRoot`, validates that `nullifierOf(secret)` is unspent, inserts nullifier, and increments `accessGranted`.
  - `publishAllowlist(newRoot)`: Allows the issuer to update or rotate the allowlist Merkle root on-chain.
  - `publicStats()`: Read-only circuit returning `[allowlistRoot, accessGranted]`.

### 2. Off-Chain Private Witness Generator
- Executed entirely client-side in the user's browser.
- Supplies:
  - `secretKey`: Private identity credential.
  - `merklePath`: Vector of 5 sibling hashes proving leaf membership.
  - `pathDirections`: Vector of 5 boolean branch directions (left/right).

### 3. Midnight DApp Connector API Adapter
- Interacts with browser-injected wallets (`window.midnight.mnLace`, `window.midnight.lace`, `window.midnight.oneam`).
- Handles wallet authorization, unshielded address queries, shielded coin public keys, and balancing/submitting unsealed transactions.

### 4. Midnight GraphQL Indexer & Event Monitor
- Queries live contract state directly from `indexer.preprod.midnight.network`.
- Emits real-time access confirmations on Preprod blocks.
