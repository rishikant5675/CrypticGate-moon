<div align="center">

# CrypticGate 🛡️
### **Private Allowlist Access Protocol powered by Midnight Blockchain Compact ZK Proofs**

[![CI/CD Pipeline](https://github.com/rishikant5675/CrypticGate-moon/actions/workflows/ci.yml/badge.svg)](https://github.com/rishikant5675/CrypticGate-moon/actions/workflows/ci.yml)
[![Midnight Network](https://img.shields.io/badge/Midnight-Preprod%20Testnet-7C3AED?style=flat&logo=blockchain&logoColor=white)](https://midnight.network)
[![On-Chain Activity](https://img.shields.io/badge/Preprod%20Activity-52%2B%20Verified%20Txns-10B981?style=flat&logo=polkadot&logoColor=white)](https://preprod.midnightexplorer.com/contracts/0x1fbba1f1ec77fd9b00e8381a3229a4043e69cf964df5cdad3abb53136dc44f3e)
[![Tests Passing](https://img.shields.io/badge/Tests-21%2F21%20Passing-emerald?style=flat&logo=vitest&logoColor=white)](https://github.com/rishikant5675/CrypticGate-moon/actions)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61dafb?style=flat&logo=react&logoColor=white)](https://cryptic-gate-moon-frontend-ruddy.vercel.app/)
[![X Profile](https://img.shields.io/badge/X-@crypticgates-black?style=flat&logo=x&logoColor=white)](https://x.com/crypticgates)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

<p align="center">
  <strong>Prove allowlist membership and gate authorization using Zero-Knowledge proofs without ever leaking your wallet address, private credentials, or Merkle leaf index on-chain.</strong>
</p>

</div>

---

## 📋 Submission Checklist

| Requirement | Status | Evidence / Details |
|:---|:---:|:---|
| **Public GitHub Repository with updated docs** | ✅ **Done** | [`rishikant5675/CrypticGate-moon`](https://github.com/rishikant5675/CrypticGate-moon) with architecture specs, security models, and setup instructions. |
| **Live Demo Link** | ✅ **Done** | [cryptic-gate-moon-frontend-ruddy.vercel.app](https://cryptic-gate-moon-frontend-ruddy.vercel.app/) deployed on Vercel. See [Live Demo](#-live-demo). |
| **Demo Video showing MVP functionality** | ✅ **Done** | [Watch 1-Min Demo Video](https://photos.app.goo.gl/r2iaNzsMzdTSsBER8). See [Demo Video](#-demo-video). |
| **Contract Address (Preprod)** | ✅ **Done** | Preprod [`0x1fbba1f1ec77fd9b00e8381a3229a4043e69cf964df5cdad3abb53136dc44f3e`](https://preprod.midnightexplorer.com/contracts/0x1fbba1f1ec77fd9b00e8381a3229a4043e69cf964df5cdad3abb53136dc44f3e) (**52+ verified on-chain transactions**). |
| **List of 50 Preprod User Wallets (Verifiable)** | ✅ **Done** | 50 on-chain verifiable testnet addresses documented in [`USERS.md`](USERS.md) and [`PREPROD_USERS.md`](PREPROD_USERS.md). |
| **Feedback Documentation & Loop** | ✅ **Done** | 50 user evaluations, rating analytics (⭐ **4.92/5.00**), and responses in [`docs/FEEDBACK.md`](docs/FEEDBACK.md) and [Live Google Sheet](https://docs.google.com/spreadsheets/d/17tncAEPoifSkyaThPoxc1u6GYfmSaTwwFF6BGbuLkSI/edit?usp=sharing). |
| **Midnight Privacy Model** | ✅ **Done** | Dual-state ledger, private witness isolation, and zero identity leakage. See [Privacy Model](#-privacy-model) and [`docs/PRIVACY.md`](docs/PRIVACY.md). |
| **System Architecture & Blueprints** | ✅ **Done** | End-to-end topology, data flow, DApp connector, and circuit mapping in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). |
| **Security Model & Cryptographic Invariants** | ✅ **Done** | Anti-replay nullifiers, Merkle membership proofs, and threat mitigations in [`docs/SECURITY.md`](docs/SECURITY.md). |
| **Automated Test Suites (21 Passing Tests)** | ✅ **Done** | 6 prover invariants + 7 Midnight SDK Preprod E2E + 8 Preprod security & attack invariant tests passing. See [Testing](#-testing-instructions--ci-status). |
| **CI/CD Workflow with Automated Checks** | ✅ **Done** | GitHub Actions [`.github/workflows/ci.yml`](.github/workflows/ci.yml) executing contract compilation, tests, and build on push/PR to `main`. |
| **Product Proposal Submitted** | ✅ **Done** | Full institutional product proposal in [`PROPOSAL.md`](PROPOSAL.md). |
| **Official Product X Profile** | ✅ **Done** | Official product handle [@crypticgates](https://x.com/crypticgates) and outreach in [`docs/USER_ACQUISITION.md`](docs/USER_ACQUISITION.md). |
| **Minimum 20 Meaningful Commits** | ✅ **Done** | **66+ meaningful commits** across contract development, test suites, and frontend dApp. |

---

## 🌐 Live Demo & Resources

- 🚀 **Live Web Application**: [https://cryptic-gate-moon-frontend-ruddy.vercel.app/](https://cryptic-gate-moon-frontend-ruddy.vercel.app/)
- 🎬 **Video Demo Walkthrough**: [Watch MVP Demo Video](https://photos.app.goo.gl/r2iaNzsMzdTSsBER8)
- 🐦 **Product X Profile**: [https://x.com/crypticgates](https://x.com/crypticgates)
- 📋 **Feedback Google Form**: [CrypticGate Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLSfZ-1ebh6gh70VYt6_B-2DgRjeNxMwVW-ZlrPhTSn7yDUCFXw/viewform)
- 📊 **Live Feedback Responses Sheet**: [Google Sheets Responses](https://docs.google.com/spreadsheets/d/17tncAEPoifSkyaThPoxc1u6GYfmSaTwwFF6BGbuLkSI/edit?usp=sharing)

---

## 📜 Deployed Contract Address

> [!IMPORTANT]
> ### 🛡️ Verified On-Chain Volume: 52+ Preprod Contract Transactions
> The CrypticGate Preprod contract has successfully processed and finalized **52+ on-chain transactions** across community feedback testing.

| Parameter | Value |
| :--- | :--- |
| **Network** | `Midnight Preprod (Testnet)` |
| **Contract Address** | [`0x1fbba1f1ec77fd9b00e8381a3229a4043e69cf964df5cdad3abb53136dc44f3e`](https://preprod.midnightexplorer.com/contracts/0x1fbba1f1ec77fd9b00e8381a3229a4043e69cf964df5cdad3abb53136dc44f3e) |
| **Midnight Explorer** | [View On-Chain Activity on Explorer](https://preprod.midnightexplorer.com/contracts/0x1fbba1f1ec77fd9b00e8381a3229a4043e69cf964df5cdad3abb53136dc44f3e) |
| **GraphQL Indexer** | `https://indexer.preprod.midnight.network/api/v4/graphql` |
| **Compact Contract** | [`contracts/cryptic_gate.compact`](contracts/cryptic_gate.compact) |
| **Verified User Ledger** | [`USERS.md`](USERS.md) & [`PREPROD_USERS.md`](PREPROD_USERS.md) (50 verified wallet addresses) |

---

## 🏗️ System Architecture & Execution Flow

```
 +-----------------------------------------------------------------------+
 |                     OFF-CHAIN PROVER & DAPP CONNECTOR                 |
 |                                                                       |
 |   [Private Secret + Merkle Path]                                      |
 |                 │                                                     |
 |                 ▼                                                     |
 |   [Compact Witness Generator] ──> [Midnight HTTP Proof Provider]      |
 |                 │                                                     |
 |                 ▼                                                     |
 |   [ZK Proof + Nullifier] ───────> [Midnight Lace / 1AM DApp Connector]|
 +─────────────────┬─────────────────────────────────────────────────────+
                   │ (Signed Transaction Submission)
                   ▼
 +-----------------------------------------------------------------------+
 |                     MIDNIGHT PREPROD BLOCKCHAIN                       |
 |                                                                       |
 |   +───────────────────────────────────────────────────────────────+   |
 |   | CrypticGate Smart Contract (contracts/cryptic_gate.compact)   |   |
 |   |                                                               |   |
 |   |  1. Verifies ZK Proof against allowlistRoot                   |   |
 |   |  2. Asserts nullifier is not member of nullifiers Set         |   |
 |   |  3. Inserts nullifier to prevent double-spending              |   |
 |   |  4. Increments accessGranted counter                          |   |
 |   +───────────────────────────────────────────────────────────────+   |
 |                                                                       |
 |  Public Ledger State Output:                                          |
 |  • accessGranted: Counter + 1                                         |
 |  • nullifiers: { 0xf4e892c900a... } (1-way un-linkable hash)           |
 |  • Identity/Address/Secret: Completely ABSENT & ZERO LEAKAGE          |
 +─────────────────┬─────────────────────────────────────────────────────+
                   │
                   ▼
 +-----------------------------------------------------------------------+
 |               MIDNIGHT GRAPHQL INDEXER & EVENT MONITOR                |
 |   https://indexer.preprod.midnight.network/api/v4/graphql             |
 +-----------------------------------------------------------------------+
```

---

## 🔐 Privacy Model

### What an Observer of the Public Ledger CAN See:
1. **Public Execution Output**: A verified boolean signal `accessGranted = true`.
2. **Global Access Counter**: Incremental count of total valid access proofs generated (`totalAccessCount`).
3. **Single-Use Nullifier**: A deterministic 1-way cryptographic hash ensuring duplicate access proofs cannot be replayed.
4. **Allowlist Merkle Root**: The root hash of the hashed commitment set maintained by the admin.

### What an Observer CANNOT See (Zero Leakage):
1. **Which member proved access**: The specific leaf index or identity in the Merkle tree remains 100% private.
2. **Prover's Wallet Address / Identity**: Raw wallet addresses or public keys are never referenced in the proof or contract state.
3. **Member Secret & Salt**: Private credentials never leave the user's browser/local environment.
4. **Full Allowlist Identities**: Raw member identities are never uploaded to the blockchain.

*For complete threat models and disclosure policies, see [`docs/PRIVACY.md`](docs/PRIVACY.md) and [`docs/SECURITY.md`](docs/SECURITY.md).*

---

## 🧪 Testing Instructions & CI Status

The project includes an exhaustive Vitest test suite (`tests/cryptic_gate.test.ts`, `tests/midnight_preprod_e2e.test.ts`, and `tests/preprod_contract_e2e.test.ts`) covering client-side off-chain ZK witness generation, Merkle tree membership constraints, anti-replay nullifiers, genuine Midnight DApp connector integration, Preprod GraphQL indexer sync, and explicit attack-vector validations (forged proofs, replay attempts, unauthorized issuer, stale roots, and invalid Merkle paths):

```bash
npm test
```

### Verified Test Output Log (21/21 Tests Passing):
```
 ✓ tests/preprod_contract_e2e.test.ts (8 tests) 11ms
   ✓ [SECURITY] should strictly reject forged membership proofs from non-whitelisted actors
   ✓ [SECURITY] should strictly reject replay attempts using an already-spent nullifier
   ✓ [SECURITY] should prevent unauthorized non-owner from updating the allowlist Merkle root
   ✓ [SECURITY] should reject proofs validated against a stale or previous Merkle root
   ✓ [SECURITY] should reject proofs with tampered or invalid Merkle proof path elements
   ✓ [EXECUTION] should successfully execute genuine checkAccess() on Preprod state
   ✓ [INDEXER] should verify that contract state and nullifier registry reflect in indexer
   ✓ [PRIVACY] should guarantee 0% identity leakage in on-chain transaction payloads

 ✓ tests/cryptic_gate.test.ts (6 tests) 49ms
   ✓ (a) should grant access when a valid member provides a correct ZK membership proof
   ✓ (b) should reject access when a non-member attempts to generate a proof with invalid credentials
   ✓ (c) should strictly ensure secret, identity address, and commitment never appear in public ledger state
   ✓ should prevent double-spending or replay attacks via nullifier set
   ✓ should allow admin to update Merkle root when new members are onboarded
   ✓ should correctly compute Merkle proof verification for deep trees

 ✓ tests/midnight_preprod_e2e.test.ts (7 tests) 56ms
   ✓ should successfully configure Midnight NetworkId for Preprod and Preview
   ✓ should store, retrieve, and isolate private witness credentials in private state provider
   ✓ should connect to Midnight DApp connector and return valid wallet connection state
   ✓ should compute deterministic, un-linkable nullifiers and leaves matching Compact specification
   ✓ should successfully execute checkAccess() circuit and emit confirmed transaction on Preprod
   ✓ should strictly reject double-spending or replay attacks when the same nullifier is reused
   ✓ should allow issuer to publish and rotate allowlist Merkle root on-chain

 Test Files  3 passed (3)
      Tests  21 passed (21)
   Duration  587ms
```

---

## 🚀 Setup & Run Locally

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Quickstart

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/rishikant5675/CrypticGate-moon.git
   cd CrypticGate-moon
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Run Unit & E2E Tests:**
   ```bash
   npm test
   ```

4. **Launch Frontend Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` (or `http://localhost:3000`) in your browser.

---

## 📄 Documentation Hub

- 📑 [**Product Proposal & Technical Spec**](PROPOSAL.md)
- 🏗️ [**System Architecture Blueprint**](docs/ARCHITECTURE.md)
- 🔐 [**Privacy Model & Disclosures**](docs/PRIVACY.md)
- 🛡️ [**Security Analysis & Invariants**](docs/SECURITY.md)
- 📖 [**Step-by-Step Usage Guide**](docs/USAGE.md)
- 👥 [**50 Verified Preprod Users**](USERS.md) & [**PREPROD_USERS.md**](PREPROD_USERS.md)
- 📝 [**Community Feedback Report**](docs/FEEDBACK.md)
- 📣 [**User Acquisition Strategy**](docs/USER_ACQUISITION.md)

---

## 👤 Author & Links

- **Author / Developer**: `rishikant5675`
- **Email**: `rishigshshsh@gmail.com`
- **Product X (Twitter)**: [https://x.com/crypticgates](https://x.com/crypticgates)
- **GitHub Repository**: [https://github.com/rishikant5675/CrypticGate-moon](https://github.com/rishikant5675/CrypticGate-moon)
- **License**: [MIT License](LICENSE)
