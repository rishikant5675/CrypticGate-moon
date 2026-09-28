# 📖 CrypticGate Usage & Testing Guide

Step-by-step instructions for interacting with the **CrypticGate** dApp on the **Midnight Preprod Testnet**.

---

## 1. Prerequisites

1. **Web Browser**: Google Chrome or Brave Browser.
2. **Midnight Wallet**:
   - Install the **Midnight Lace Wallet** or **1AM Wallet** extension.
   - Switch network to **Midnight Preprod**.
   - Fund your wallet with testnet **tNIGHT** and **tDUST** via the official Midnight faucet.

---

## 2. Live Application Walkthrough

### Step 1: Connect Your Wallet
1. Navigate to the live dApp: [https://cryptic-gate-moon-frontend-ruddy.vercel.app/](https://cryptic-gate-moon-frontend-ruddy.vercel.app/)
2. Click **Connect Midnight Wallet** in the top navigation bar.
3. Select **Lace Wallet** or **1AM Wallet** and authorize the connection in the extension popup.

### Step 2: Select a Test Persona or Enter Your Secret
- For quick demonstration, select one of the preset authorized personas:
  - **Alice (Member 1)**: `MEMBER_SECRET_ALICE_9921`
  - **Bob (Member 2)**: `MEMBER_SECRET_BOB_4410`
  - **Charlie (Member 3)**: `MEMBER_SECRET_CHARLIE_8829`
  - **Attacker (Non-Member)**: `ATTACKER_SECRET_MALORY_666` *(to test circuit rejection)*

### Step 3: Execute Zero-Knowledge Proof
1. Click **Prove Membership & Unlock Gate (`checkAccess`)**.
2. Watch the 4-step real-time proving pipeline:
   - `1. Private Witness Generation`
   - `2. Compact ZK Execution`
   - `3. DApp Connector Balancing`
   - `4. Preprod Block Finalization`
3. Upon success, inspect the green **ACCESS GRANTED** panel containing the verified Preprod transaction hash and spent nullifier.

### Step 4: Verify on Midnight Explorer
1. Click the transaction link to view the transaction on the **Midnight Preprod Explorer**:
   - [https://preprod.midnightexplorer.com/contracts/0x1fbba1f1ec77fd9b00e8381a3229a4043e69cf964df5cdad3abb53136dc44f3e](https://preprod.midnightexplorer.com/contracts/0x1fbba1f1ec77fd9b00e8381a3229a4043e69cf964df5cdad3abb53136dc44f3e)
2. Verify that `accessGranted` has incremented on-chain while your wallet address remains 100% unlinked from the membership leaf.
