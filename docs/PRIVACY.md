# 🔐 CrypticGate Privacy Model & Disclosure Policy

CrypticGate leverages Midnight's **dual-state ledger architecture** to achieve absolute selective disclosure. 

---

## 1. Dual-State Privacy Partitioning

| Data Dimension | State Visibility | Storage / Execution Location | Details |
| :--- | :---: | :---: | :--- |
| **Member Secret (`secretKey`)** | 🔒 **PRIVATE** | Client Browser RAM | User's private credential. Never serialized to disk or leaked to network. |
| **Merkle Path (`merklePath`)** | 🔒 **PRIVATE** | Client Browser RAM | Sibling hashes proving inclusion. Never written to blockchain ledger. |
| **Leaf Index / Position** | 🔒 **PRIVATE** | Client Browser RAM | Which specific leaf belonged to the prover remains 100% hidden. |
| **Allowlist Merkle Root** | 🌐 **PUBLIC** | Midnight Public Ledger | Root hash committing to all eligible members. |
| **Access Counter** | 🌐 **PUBLIC** | Midnight Public Ledger | Cumulative counter of total authorized accesses (`accessGranted`). |
| **Spent Nullifier** | 🌐 **PUBLIC** | Midnight Public Ledger | Deterministic 1-way cryptographic tag (`nullifierOf`). Un-linkable to secret. |
| **Admin Address (`issuer`)** | 🌐 **PUBLIC** | Midnight Public Ledger | Public key authorized to update the allowlist root. |

---

## 2. Public Ledger Observer Matrix

### What an Observer of the Public Blockchain CAN See:
1. **Valid Execution Signal**: An on-chain proof verification indicating a legitimate allowlisted member executed `checkAccess()`.
2. **Access Count Increment**: Incremental counter increase (+1).
3. **Spent Nullifier Hash**: A unique 32-byte hash preventing duplicate access claims.
4. **Allowlist Merkle Root**: The current Merkle root maintained on-chain.

### What an Observer of the Public Blockchain CANNOT See (Zero Leakage):
1. ❌ **Prover Identity / Wallet Address**: The proving wallet address is not stored in the contract state or linked to the membership leaf.
2. ❌ **Specific Allowlist Index**: Zero correlation between the on-chain nullifier and the Merkle tree leaf index.
3. ❌ **Private Secret Key**: The user's private key never leaves the client-side witness generator.
4. ❌ **Full Allowlist Roster**: Raw member lists are never published; only the 32-byte root is public.

---

## 3. Cryptographic Domain Separation

To prevent cross-protocol collisions and preimage attacks, all hashing operations utilize strict domain separation:

```compact
// Member Leaf Commitment:
persistentHash<Vector<2, Bytes<32>>>([pad(32, "crypticgate:leaf"), secret]);

// Single-Use Nullifier:
persistentHash<Vector<2, Bytes<32>>>([pad(32, "crypticgate:null"), secret]);
```
