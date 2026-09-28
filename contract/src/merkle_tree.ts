// ============================================================================
// Canonical Merkle Tree & Compact Hashing Module
// ----------------------------------------------------------------------------
// Implements canonical persistent hashing with strict domain separation
// matching Compact circuits:
//   - Leaf:      persistentHash([pad(32, "crypticgate:leaf"), secret])
//   - Nullifier: persistentHash([pad(32, "crypticgate:null"), secret])
//   - Node:      persistentHash([left, right])
// ============================================================================

export function pad32(str: string): Uint8Array {
  const enc = new TextEncoder().encode(str);
  const out = new Uint8Array(32);
  out.set(enc.slice(0, 32));
  return out;
}

export function toHex(buf: Uint8Array): string {
  return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function fromHex(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const match = cleanHex.match(/.{1,2}/g) || [];
  return new Uint8Array(match.map(byte => parseInt(byte, 16)));
}

// SHA-256 binary implementation
export function sha256(data: Uint8Array): Uint8Array {
  // Compute standard SHA-256 for byte buffers
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const len = data.length;
  const bitLen = len * 8;
  const padLen = (((len + 8) >> 6) + 1) << 6;
  const padded = new Uint8Array(padLen);
  padded.set(data);
  padded[len] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(padLen - 4, bitLen >>> 0, false);
  view.setUint32(padLen - 8, Math.floor(bitLen / 0x100000000), false);

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  const w = new Uint32Array(64);
  for (let i = 0; i < padLen; i += 64) {
    for (let t = 0; t < 16; t++) {
      w[t] = view.getUint32(i + t * 4, false);
    }
    for (let t = 16; t < 64; t++) {
      const s0 = ((w[t - 15] >>> 7) | (w[t - 15] << 25)) ^ ((w[t - 15] >>> 18) | (w[t - 15] << 14)) ^ (w[t - 15] >>> 3);
      const s1 = ((w[t - 2] >>> 17) | (w[t - 2] << 15)) ^ ((w[t - 2] >>> 19) | (w[t - 2] << 13)) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let t = 0; t < 64; t++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + k[t] + w[t]) >>> 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, h0, false);
  outView.setUint32(4, h1, false);
  outView.setUint32(8, h2, false);
  outView.setUint32(12, h3, false);
  outView.setUint32(16, h4, false);
  outView.setUint32(20, h5, false);
  outView.setUint32(24, h6, false);
  outView.setUint32(28, h7, false);
  return out;
}

// Compact persistentHash simulation with domain separation
export function persistentHash(elements: Uint8Array[]): Uint8Array {
  const totalLen = elements.reduce((acc, el) => acc + el.length, 0);
  const concatenated = new Uint8Array(totalLen);
  let offset = 0;
  for (const el of elements) {
    concatenated.set(el, offset);
    offset += el.length;
  }
  return sha256(concatenated);
}

export function leafOf(secret: string | Uint8Array): Uint8Array {
  const secBuf = typeof secret === 'string' ? fromHex(secret.startsWith('0x') ? secret : toHex(new TextEncoder().encode(secret))) : secret;
  return persistentHash([pad32("crypticgate:leaf"), secBuf]);
}

export function nullifierOf(secret: string | Uint8Array): Uint8Array {
  const secBuf = typeof secret === 'string' ? fromHex(secret.startsWith('0x') ? secret : toHex(new TextEncoder().encode(secret))) : secret;
  return persistentHash([pad32("crypticgate:null"), secBuf]);
}

export interface MerkleProof {
  leaf: Uint8Array;
  root: Uint8Array;
  path: [Uint8Array, Uint8Array, Uint8Array, Uint8Array, Uint8Array];
  directions: [boolean, boolean, boolean, boolean, boolean];
}

/**
 * 5-Depth Merkle Tree matching Compact Vector<5, Bytes<32>>
 */
export class CanonicalMerkleTree {
  public readonly depth: number = 5;
  public readonly numLeaves: number = 32; // 2^5
  private leaves: Uint8Array[];
  private tree: Uint8Array[][];

  constructor(leaves: Uint8Array[] = []) {
    this.leaves = new Array(this.numLeaves);
    const zeroLeaf = new Uint8Array(32);
    for (let i = 0; i < this.numLeaves; i++) {
      this.leaves[i] = leaves[i] || zeroLeaf;
    }
    this.tree = this.buildTree();
  }

  private buildTree(): Uint8Array[][] {
    const tree: Uint8Array[][] = [];
    tree.push([...this.leaves]);

    for (let d = 0; d < this.depth; d++) {
      const currentLevel = tree[d];
      const nextLevel: Uint8Array[] = [];
      for (let i = 0; i < currentLevel.length; i += 2) {
        const left = currentLevel[i];
        const right = currentLevel[i + 1];
        const parent = persistentHash([left, right]);
        nextLevel.push(parent);
      }
      tree.push(nextLevel);
    }
    return tree;
  }

  public getRoot(): Uint8Array {
    return this.tree[this.depth][0];
  }

  public getRootHex(): string {
    return `0x${toHex(this.getRoot())}`;
  }

  public getProof(leafIndex: number): MerkleProof {
    if (leafIndex < 0 || leafIndex >= this.numLeaves) {
      throw new Error(`Leaf index ${leafIndex} out of bounds (0-${this.numLeaves - 1})`);
    }

    const path: Uint8Array[] = [];
    const directions: boolean[] = [];
    let idx = leafIndex;

    for (let d = 0; d < this.depth; d++) {
      const isRight = idx % 2 === 1;
      const siblingIdx = isRight ? idx - 1 : idx + 1;
      path.push(this.tree[d][siblingIdx]);
      directions.push(isRight);
      idx = Math.floor(idx / 2);
    }

    return {
      leaf: this.leaves[leafIndex],
      root: this.getRoot(),
      path: path as [Uint8Array, Uint8Array, Uint8Array, Uint8Array, Uint8Array],
      directions: directions as [boolean, boolean, boolean, boolean, boolean],
    };
  }

  public static verifyProof(proof: MerkleProof, expectedRoot: Uint8Array): boolean {
    let current = proof.leaf;
    for (let i = 0; i < proof.path.length; i++) {
      const sibling = proof.path[i];
      const isRight = proof.directions[i];
      current = isRight
        ? persistentHash([sibling, current])
        : persistentHash([current, sibling]);
    }
    return toHex(current) === toHex(expectedRoot);
  }
}
