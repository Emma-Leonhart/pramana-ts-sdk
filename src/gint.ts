import { gcd, bigAbs, isPrime } from './number-theory.js';
import { pramanaNumId, PRAMANA_BASE_URL } from './pramana-id.js';
import { Gauss } from './gauss.js';

/**
 * Gaussian integer (Z[i]) — a complex number with integer real and imaginary parts.
 * Immutable value type using bigint for arbitrary precision.
 */
export class Gint {
  readonly real: bigint;
  readonly imag: bigint;

  constructor(real?: bigint | number, imag?: bigint | number) {
    this.real = real != null ? BigInt(real) : 0n;
    this.imag = imag != null ? BigInt(imag) : 0n;
    Object.freeze(this);
  }

  // ── Static Constants ──────────────────────────────────────────────

  static readonly ZERO = new Gint(0, 0);
  static readonly ONE = new Gint(1, 0);
  static readonly MINUS_ONE = new Gint(-1, 0);
  static readonly I = new Gint(0, 1);

  // ── Static Factory Methods ────────────────────────────────────────

  /** Returns the imaginary unit i. */
  static eye(): Gint {
    return Gint.I;
  }

  /** Returns the four Gaussian units: [1, -1, i, -i]. */
  static units(): Gint[] {
    return [new Gint(1), new Gint(-1), new Gint(0, 1), new Gint(0, -1)];
  }

  /** Returns 1 + i. */
  static two(): Gint {
    return new Gint(1, 1);
  }

  /** Creates a random Gint with parts in the given ranges. */
  static random(re1 = -100, re2 = 100, im1 = -100, im2 = 100): Gint {
    const re = Math.floor(Math.random() * (re2 - re1 + 1)) + re1;
    const im = Math.floor(Math.random() * (im2 - im1 + 1)) + im1;
    return new Gint(re, im);
  }

  /** Creates a Gint from a 2-element array [real, imag]. */
  static fromArray(arr: [bigint | number, bigint | number]): Gint {
    return new Gint(arr[0], arr[1]);
  }

  // ── Classification Properties ─────────────────────────────────────

  get isZero(): boolean {
    return this.real === 0n && this.imag === 0n;
  }

  get isOne(): boolean {
    return this.real === 1n && this.imag === 0n;
  }

  get isReal(): boolean {
    return this.imag === 0n;
  }

  get isPurelyImaginary(): boolean {
    return this.real === 0n && this.imag !== 0n;
  }

  get isUnit(): boolean {
    return this.norm === 1n;
  }

  get isPositive(): boolean {
    return this.isReal && this.real > 0n;
  }

  get isNegative(): boolean {
    return this.isReal && this.real < 0n;
  }

  get isInteger(): boolean {
    return this.imag === 0n;
  }

  get isGaussianInteger(): boolean {
    return true;
  }

  // ── Derived Properties ────────────────────────────────────────────

  /** Complex conjugate: real - imag*i. */
  get conjugate(): Gint {
    return new Gint(this.real, -this.imag);
  }

  /** Norm (squared absolute value): real² + imag². */
  get norm(): bigint {
    return this.real * this.real + this.imag * this.imag;
  }

  // ── Pramana Identity ─────────────────────────────────────────────

  /** Canonical key: "real,1,imag,1". */
  get pramanaKey(): string {
    return `${this.real},1,${this.imag},1`;
  }

  /** Pramana label: "pra:num:real,1,imag,1". */
  get pramanaLabel(): string {
    return `pra:num:${this.pramanaKey}`;
  }

  /** Deterministic UUID v5 identifier. */
  get pramanaId(): string {
    return pramanaNumId(this.pramanaKey);
  }

  /** Pramana entity URL using UUID. */
  get pramanaUrl(): string {
    return `${PRAMANA_BASE_URL}${this.pramanaId}`;
  }

  // ── Arithmetic ────────────────────────────────────────────────────

  add(other: Gint): Gint {
    return new Gint(this.real + other.real, this.imag + other.imag);
  }

  sub(other: Gint): Gint {
    return new Gint(this.real - other.real, this.imag - other.imag);
  }

  mul(other: Gint): Gint {
    return new Gint(
      this.real * other.real - this.imag * other.imag,
      this.real * other.imag + this.imag * other.real,
    );
  }

  neg(): Gint {
    return new Gint(-this.real, -this.imag);
  }

  /** Division of Gaussian integers returns a Gauss (Gaussian rational). */
  div(other: Gint): Gauss {
    return Gauss.fromGint(this).div(Gauss.fromGint(other));
  }

  /** Exponentiation with non-negative integer exponent. */
  pow(exp: number): Gint {
    if (exp < 0) {
      throw new Error('Negative exponents produce Gaussian rationals; use Gauss.fromGint(x).pow(n)');
    }
    if (exp === 0) return Gint.ONE;
    let result = Gint.ONE;
    let base: Gint = this;
    let e = exp;
    while (e > 0) {
      if (e & 1) result = result.mul(base);
      base = base.mul(base);
      e >>= 1;
    }
    return result;
  }

  /** Modulo (remainder from modified divmod). */
  mod(other: Gint): Gint {
    return Gint.modifiedDivmod(this, other)[1];
  }

  // ── Floor Division & Modified Divmod ──────────────────────────────

  /**
   * Floor division using rounding (matches C# and Python implementations).
   * Returns the nearest Gaussian integer quotient.
   */
  floorDiv(other: Gint): Gint {
    return Gint.modifiedDivmod(this, other)[0];
  }

  // ── Number-Theoretic Static Methods ───────────────────────────────

  /**
   * Modified divmod: returns [quotient, remainder] where
   * remainder.norm < other.norm (uses rounding, not floor).
   */
  static modifiedDivmod(a: Gint, b: Gint): [Gint, Gint] {
    if (b.isZero) throw new Error('Division by zero');
    // Compute a * conj(b) / norm(b) and round
    const conjB = b.conjugate;
    const product = new Gint(
      a.real * conjB.real - a.imag * conjB.imag,
      a.real * conjB.imag + a.imag * conjB.real,
    );
    const n = b.norm;

    const qReal = roundDiv(product.real, n);
    const qImag = roundDiv(product.imag, n);
    const q = new Gint(qReal, qImag);
    const r = a.sub(b.mul(q));
    return [q, r];
  }

  /** Greatest common divisor using the Euclidean algorithm. */
  static gcd(a: Gint, b: Gint): Gint {
    while (!b.isZero) {
      const [, r] = Gint.modifiedDivmod(a, b);
      a = b;
      b = r;
    }
    return a;
  }

  /**
   * Extended Euclidean algorithm.
   * Returns [gcd, x, y] such that gcd = a*x + b*y.
   */
  static xgcd(alpha: Gint, beta: Gint): [Gint, Gint, Gint] {
    let [oldR, r] = [alpha, beta];
    let [oldS, s] = [Gint.ONE, Gint.ZERO];
    let [oldT, t] = [Gint.ZERO, Gint.ONE];

    while (!r.isZero) {
      const [q] = Gint.modifiedDivmod(oldR, r);
      [oldR, r] = [r, oldR.sub(q.mul(r))];
      [oldS, s] = [s, oldS.sub(q.mul(s))];
      [oldT, t] = [t, oldT.sub(q.mul(t))];
    }

    return [oldR, oldS, oldT];
  }

  /** Tests if a ≡ b (mod c). Returns [isCongruent, (a-b)/c or remainder]. */
  static congruentModulo(a: Gint, b: Gint, c: Gint): [boolean, Gint] {
    const diff = a.sub(b);
    const [, remainder] = Gint.modifiedDivmod(diff, c);
    return [remainder.isZero, remainder];
  }

  /** Tests if two Gaussian integers are relatively prime (GCD is a unit). */
  static isRelativelyPrime(a: Gint, b: Gint): boolean {
    return Gint.gcd(a, b).isUnit;
  }

  /**
   * Tests whether a Gaussian integer is a Gaussian prime.
   * - Both parts nonzero: prime iff norm is prime.
   * - One part zero: the nonzero part must be prime AND ≡ 3 (mod 4).
   */
  static isGaussianPrime(x: Gint): boolean {
    if (x.isZero) return false;
    if (x.real !== 0n && x.imag !== 0n) {
      return isPrime(x.norm);
    }
    const p = bigAbs(x.real !== 0n ? x.real : x.imag);
    if (!isPrime(p)) return false;
    // Must be ≡ 3 (mod 4)
    const mod4 = ((p % 4n) + 4n) % 4n;
    return mod4 === 3n;
  }

  /**
   * If norm(a) divides norm(b) or vice versa, returns the quotient.
   * Otherwise returns null.
   */
  static normsDivide(a: Gint, b: Gint): bigint | null {
    const na = a.norm;
    const nb = b.norm;
    if (na === 0n || nb === 0n) return null;
    if (na >= nb) {
      return na % nb === 0n ? na / nb : null;
    }
    return nb % na === 0n ? nb / na : null;
  }

  // ── Associates ────────────────────────────────────────────────────

  /** Returns the three non-trivial associates: [-this, this*i, this*(-i)]. */
  associates(): Gint[] {
    return [
      this.neg(),
      new Gint(-this.imag, this.real),   // this * i
      new Gint(this.imag, -this.real),   // this * (-i)
    ];
  }

  /** Tests if other is an associate (differs by multiplication by a unit). */
  isAssociate(other: Gint): boolean {
    return this.norm === other.norm && (
      this.eq(other) || this.associates().some(a => a.eq(other))
    );
  }

  // ── Conversion ────────────────────────────────────────────────────

  /** Converts to a Gauss (Gaussian rational) with denominators of 1. */
  toGauss(): Gauss {
    return Gauss.fromGint(this);
  }

  /** Returns as a 2-element bigint array [real, imag]. */
  toArray(): [bigint, bigint] {
    return [this.real, this.imag];
  }

  // ── Comparison ────────────────────────────────────────────────────

  /** Equality: both components match. */
  eq(other: Gint): boolean {
    return this.real === other.real && this.imag === other.imag;
  }

  ne(other: Gint): boolean {
    return !this.eq(other);
  }

  /** Lexicographic comparison: real first, then imaginary. */
  compareTo(other: Gint): -1 | 0 | 1 {
    if (this.real < other.real) return -1;
    if (this.real > other.real) return 1;
    if (this.imag < other.imag) return -1;
    if (this.imag > other.imag) return 1;
    return 0;
  }

  lt(other: Gint): boolean { return this.compareTo(other) < 0; }
  gt(other: Gint): boolean { return this.compareTo(other) > 0; }
  lte(other: Gint): boolean { return this.compareTo(other) <= 0; }
  gte(other: Gint): boolean { return this.compareTo(other) >= 0; }

  // ── String Representations ────────────────────────────────────────

  /** Human-readable format: "3 + 2i", "5", "i", "-i", "0". */
  toString(): string {
    if (this.isZero) return '0';
    const parts: string[] = [];

    if (this.real !== 0n) {
      parts.push(this.real.toString());
    }

    if (this.imag !== 0n) {
      if (this.imag === 1n) {
        parts.push(parts.length > 0 ? '+ i' : 'i');
      } else if (this.imag === -1n) {
        parts.push(parts.length > 0 ? '- i' : '-i');
      } else if (this.imag > 0n) {
        parts.push(parts.length > 0 ? `+ ${this.imag}i` : `${this.imag}i`);
      } else {
        parts.push(parts.length > 0 ? `- ${bigAbs(this.imag)}i` : `${this.imag}i`);
      }
    }

    return parts.join(' ');
  }

  /** Raw format: "(real, imag)". */
  toRawString(): string {
    return `(${this.real}, ${this.imag})`;
  }

  /** For JSON serialization. */
  toJSON(): { real: string; imag: string } {
    return { real: this.real.toString(), imag: this.imag.toString() };
  }
}

/** Alias for backward compatibility / mathematical notation. */
export const Zi = Gint;

// ── Internal Helpers ──────────────────────────────────────────────────

/** Rounds a/b to nearest integer (half away from zero). */
function roundDiv(a: bigint, b: bigint): bigint {
  if (b < 0n) { a = -a; b = -b; }
  const q = a / b;
  const r = a % b;
  // If remainder magnitude is more than half divisor, adjust
  if (2n * bigAbs(r) > b) {
    return r > 0n ? q + 1n : q - 1n;
  }
  return q;
}
