/**
 * Seeded pseudo-random number generator (mulberry32).
 *
 * Every random draw in the game goes through this module so that a saved game
 * reloads into exactly the same random stream it left. The cursor is part of
 * the save payload -- see systems/save.js.
 */
export class Rng {
  /** @param {number} seed @param {number} cursor how many draws already made */
  constructor(seed = Date.now() >>> 0, cursor = 0) {
    this.seed = seed >>> 0;
    this.cursor = cursor >>> 0;
  }

  /** Raw float in [0,1). */
  next() {
    this.cursor = (this.cursor + 1) >>> 0;
    let t = (this.seed + this.cursor * 0x6d2b79f5) >>> 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Integer in [min,max] inclusive. */
  int(min, max) { return Math.floor(this.next() * (max - min + 1)) + min; }

  /** Float in [min,max). */
  float(min, max) { return this.next() * (max - min) + min; }

  /** True with probability p (0..1). */
  chance(p) { return this.next() < p; }

  /** Uniformly pick one element. */
  pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }

  /**
   * Weighted pick. `weightOf` defaults to reading `.weight` (missing = 1).
   * Returns null for an empty list.
   */
  weighted(arr, weightOf = (x) => x.weight ?? 1) {
    let total = 0;
    for (const item of arr) total += Math.max(0, weightOf(item));
    if (total <= 0) return null;
    let roll = this.next() * total;
    for (const item of arr) {
      roll -= Math.max(0, weightOf(item));
      if (roll <= 0) return item;
    }
    return arr[arr.length - 1] ?? null;
  }

  /** Non-mutating shuffle. */
  shuffle(arr) {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  /** Roughly normal draw clamped to [min,max]; good for starting stats. */
  bell(min, max, samples = 3) {
    let sum = 0;
    for (let i = 0; i < samples; i++) sum += this.next();
    return Math.round(min + (sum / samples) * (max - min));
  }

  toJSON() { return { seed: this.seed, cursor: this.cursor }; }
  static fromJSON(o) { return new Rng(o?.seed ?? Date.now(), o?.cursor ?? 0); }
}
