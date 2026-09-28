# 🛡️ CrypticGate Security Model & Threat Invariants

---

## 1. Security Invariants

CrypticGate's Compact circuit enforces four core cryptographic invariants:

1. **Membership Soundness**:
   $$\text{candidateRoot} = \text{allowlistRoot}$$
   An unauthorized attacker without a valid private witness cannot produce a Merkle path that reconstructs the on-chain `allowlistRoot`.

2. **Anti-Replay Invariant (Single-Use Nullifier)**:
   $$\text{nullifier} \notin \text{nullifiers}$$
   $$\text{nullifiers}' = \text{nullifiers} \cup \{\text{nullifier}\}$$
   Once a secret is used to pass the gate, its derived nullifier is permanently added to the on-chain set. Any subsequent invocation with the same secret fails automatically.

3. **Zero Identity Leakage (Witness Privacy)**:
   $$\text{disclose}(\text{secretKey}) = \emptyset$$
   Neither the secret key nor its leaf index is disclosed during circuit execution.

4. **Authorized Admin Transition**:
   $$\text{ownPublicKey}() == \text{issuer}$$
   Only the deploying admin address can invoke `publishAllowlist()` to rotate the committed Merkle root.

---

## 2. Threat Analysis & Mitigations

| Threat Vector | Attack Mechanism | CrypticGate Mitigation |
| :--- | :--- | :--- |
| **Forged Membership** | Attacker submits fake proof with arbitrary secret. | Circuit asserts reconstructed Merkle root strictly equals on-chain `allowlistRoot`. Proof verification fails off-chain and on-chain. |
| **Double-Claim / Replay** | Member attempts to reuse the same access credential multiple times. | On-chain `nullifiers: Set<Bytes<32>>` tracks spent nullifiers. Second attempt reverts with `"already spent"`. |
| **Identity Correlation** | Observer tries to link two different access proofs to the same user. | Nullifiers are derived using a 1-way cryptographic hash with domain separation; no address or persistent identifier is recorded on the ledger. |
| **Front-Running / MEV** | Searcher intercepts proof and attempts to submit it from their own wallet. | The transaction is balanced and signed via the prover's connected Midnight wallet; the circuit nullifier is bound to the secret. |
| **Malicious Root Injection** | Attacker attempts to overwrite `allowlistRoot` with arbitrary leaves. | `publishAllowlist` verifies caller matches `issuer` public key stored at contract construction. |
