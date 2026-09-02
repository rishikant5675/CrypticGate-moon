export type Bytes32 = string; // Hex string (64 chars)

// Universal pure JavaScript SHA-256 implementation (browser & Node compliant)
function sha256Pure(str: string): string {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  const H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const l = bytes.length;
  const bitLen = l * 8;

  // Pre-processing (Padding)
  const paddedLen = Math.ceil((l + 9) / 64) * 64;
  const M = new Uint8Array(paddedLen);
  M.set(bytes);
  M[l] = 0x80;

  const view = new DataView(M.buffer);
  view.setUint32(paddedLen - 4, bitLen & 0xffffffff, false);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);

  const W = new Int32Array(64);

  for (let i = 0; i < paddedLen; i += 64) {
    for (let t = 0; t < 16; t++) {
      W[t] = view.getInt32(i + t * 4, false);
    }
    for (let t = 16; t < 64; t++) {
      const s0 = ((W[t - 15] >>> 7) | (W[t - 15] << 25)) ^ ((W[t - 15] >>> 18) | (W[t - 15] << 14)) ^ (W[t - 15] >>> 3);
      const s1 = ((W[t - 2] >>> 17) | (W[t - 2] << 15)) ^ ((W[t - 2] >>> 19) | (W[t - 2] << 13)) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
    }

    let [a, b, c, d, e, f, g, h] = H;

    for (let t = 0; t < 64; t++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[t] + W[t]) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    H[0] = (H[0] + a) | 0;
    H[1] = (H[1] + b) | 0;
    H[2] = (H[2] + c) | 0;
    H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0;
    H[5] = (H[5] + f) | 0;
    H[6] = (H[6] + g) | 0;
    H[7] = (H[7] + h) | 0;
  }

  return H.map(h => (h >>> 0).toString(16).padStart(8, '0')).join('');
}

export function sha256(data: string): Bytes32 {
  return sha256Pure(data);
}

export function hashTuple(left: Bytes32, right: Bytes32): Bytes32 {
  return sha256Pure(left + right);
}

export function computeCommitment(secret: string, salt: string): Bytes32 {
  return sha256Pure(`COMMITMENT:${secret}:${salt}`);
}

export function computeNullifier(secret: string): Bytes32 {
  return sha256Pure(`NULLIFIER:${secret}:CRYPTIC_GATE_NULLIFIER`);
}

export interface MerkleProof {
  path: Bytes32[];
  indices: boolean[];
}

export class MerkleTree {
  private leaves: Bytes32[];
  private layers: Bytes32[][];
  public depth: number;

  constructor(leaves: Bytes32[], depth: number = 8) {
    this.depth = depth;
    const numLeaves = Math.pow(2, depth);
    this.leaves = [...leaves];
    
    // Fill remaining with dummy zeros
    while (this.leaves.length < numLeaves) {
      this.leaves.push(sha256Pure(`EMPTY_LEAF_${this.leaves.length}`));
    }
    
    this.layers = [this.leaves];
    this.buildTree();
  }

  private buildTree() {
    let currentLayer = this.leaves;
    while (currentLayer.length > 1) {
      const nextLayer: Bytes32[] = [];
      for (let i = 0; i < currentLayer.length; i += 2) {
        const left = currentLayer[i];
        const right = currentLayer[i + 1] || left;
        nextLayer.push(hashTuple(left, right));
      }
      this.layers.push(nextLayer);
      currentLayer = nextLayer;
    }
  }

  public getRoot(): Bytes32 {
    return this.layers[this.layers.length - 1][0];
  }

  public getProof(leafIndex: number): MerkleProof {
    const path: Bytes32[] = [];
    const indices: boolean[] = [];
    let index = leafIndex;

    for (let i = 0; i < this.layers.length - 1; i++) {
      const layer = this.layers[i];
      const isRight = index % 2 === 1;
      const siblingIndex = isRight ? index - 1 : index + 1;
      
      path.push(layer[siblingIndex] || layer[index]);
      indices.push(isRight);

      index = Math.floor(index / 2);
    }

    return { path, indices };
  }

  public static verifyProof(leaf: Bytes32, root: Bytes32, proof: MerkleProof): boolean {
    let current = leaf;
    for (let i = 0; i < proof.path.length; i++) {
      const sibling = proof.path[i];
      const isRight = proof.indices[i];
      if (isRight) {
        current = hashTuple(sibling, current);
      } else {
        current = hashTuple(current, sibling);
      }
    }
    return current === root;
  }
}

export interface LedgerState {
  allowlistRoot: Bytes32;
  adminPk: Bytes32;
  latestAccessGranted: boolean;
  totalAccessCount: number;
  nullifierSet: Set<Bytes32>;
}

export class CrypticGateSimulator {
  private state: LedgerState;

  constructor(initialRoot: Bytes32, adminPk: Bytes32 = sha256Pure('ADMIN_PK')) {
    this.state = {
      allowlistRoot: initialRoot,
      adminPk,
      latestAccessGranted: false,
      totalAccessCount: 0,
      nullifierSet: new Set<Bytes32>()
    };
  }

  public getState(): Readonly<LedgerState> {
    return {
      ...this.state,
      nullifierSet: new Set(this.state.nullifierSet)
    };
  }

  public updateAllowlistRoot(newRoot: Bytes32): void {
    this.state.allowlistRoot = newRoot;
  }

  public proveAccess(
    secret: string,
    salt: string,
    proof: MerkleProof
  ): { success: boolean; nullifier: Bytes32; error?: string } {
    // 1. Recompute commitment from private secret + salt
    const commitment = computeCommitment(secret, salt);

    // 2. Verify leaf membership against public allowlist root
    const isMember = MerkleTree.verifyProof(commitment, this.state.allowlistRoot, proof);
    if (!isMember) {
      return {
        success: false,
        nullifier: '',
        error: 'Invalid allowlist proof: secret commitment does not exist in Merkle tree'
      };
    }

    // 3. Compute nullifier
    const nullifier = computeNullifier(secret);
    if (this.state.nullifierSet.has(nullifier)) {
      return {
        success: false,
        nullifier,
        error: 'Nullifier already used: duplicate proof attempt detected'
      };
    }

    // 4. Mutate ledger state (Identity/address/secret is NEVER stored)
    this.state.nullifierSet.add(nullifier);
    this.state.latestAccessGranted = true;
    this.state.totalAccessCount += 1;

    return {
      success: true,
      nullifier
    };
  }
}
