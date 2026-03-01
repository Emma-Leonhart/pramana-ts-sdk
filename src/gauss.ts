import { gcd, bigAbs, normalize } from './number-theory.js';
import { pramanaNumId, PRAMANA_BASE_URL } from './pramana-id.js';
import { Gint } from './gint.js';

/**
 * Gaussian rational (Q[i]) — a complex number with rational real and imaginary parts.
 * Stored as a/b + (c/d)i where b,d > 0 and fractions are in lowest terms.
 * Immutable value type using bigint for arbitrary precision.
 */
export class Gauss {
  /** Numerator of real part. */
  readonly a: bigint;
  /** Denominator of real part (always > 0). */
  readonly b: bigint;
  /** Numerator of imaginary part. */
  readonly c: bigint;
  /** Denominator of imaginary part (always > 0). */
  readonly d: bigint;

  constructor(a: bigint | number, b: bigint | number, c: bigint | number, d: bigint | number) {
    const ba = BigInt(a), bb = BigInt(b), bc = BigInt(c), bd = BigInt(d);
    if (bb === 0n || bd === 0n) throw new Error('Denominators cannot be zero');
    const [na, nb] = normalize(ba, bb);
    const [nc, nd] = normalize(bc, bd);
    this.a = na;
    this.b = nb;
    this.c = nc;
    this.d = nd;
    Object.freeze(this);
  }

  // ── Static Constants ──────────────────────────────────────────────

  static readonly ZERO = new Gauss(0, 1, 0, 1);
  static readonly ONE = new Gauss(1, 1, 0, 1);
  static readonly MINUS_ONE = new Gauss(-1, 1, 0, 1);
  static readonly I = new Gauss(0, 1, 1, 1);

  // ── Static Factory Methods ────────────────────────────────────────

  /** Creates a Gauss from a single integer value. */
  static fromInt(value: bigint | number): Gauss {
    return new Gauss(value, 1, 0, 1);
  }

  /** Creates a Gauss from integer real and imaginary parts. */
  static fromComplex(real: bigint | number, imag: bigint | number): Gauss {
    return new Gauss(real, 1, imag, 1);
  }

  /** Creates a Gauss from a Gint. */
  static fromGint(g: Gint): Gauss {
    return new Gauss(g.real, 1, g.imag, 1);
  }

  /** Returns the imaginary unit i. */
  static eye(): Gauss {
    return Gauss.I;
  }

  /** Returns the four Gaussian units: [1, -1, i, -i]. */
  static units(): Gauss[] {
    return [Gauss.ONE, Gauss.MINUS_ONE, Gauss.I, new Gauss(0, 1, -1, 1)];
  }

  /** Creates a random Gauss with components in the given ranges. */
  static random(re1 = -100, re2 = 100, im1 = -100, im2 = 100): Gauss {
    const a = Math.floor(Math.random() * (re2 - re1 + 1)) + re1;
    const b = Math.floor(Math.random() * 99) + 1; // 1..99
    const c = Math.floor(Math.random() * (im2 - im1 + 1)) + im1;
    const d = Math.floor(Math.random() * 99) + 1;
    return new Gauss(a, b, c, d);
  }

  /**
   * Parses a Gauss from "A,B,C,D" format.
   * Optionally strips a "num:" or "pra:num:" prefix.
   */
  static parse(s: string): Gauss {
    let normalized = s;
    if (normalized.startsWith('pra:num:')) normalized = normalized.slice(8);
    else if (normalized.startsWith('num:')) normalized = normalized.slice(4);
    const parts = normalized.split(',');
    if (parts.length !== 4) throw new Error(`Expected 4 comma-separated values: ${s}`);
    return new Gauss(
      BigInt(parts[0].trim()),
      BigInt(parts[1].trim()),
      BigInt(parts[2].trim()),
      BigInt(parts[3].trim()),
    );
  }

  /**
   * Converts a floating-point number to a rational approximation
   * using continued fraction expansion.
   */
  static fromDouble(real: number, imag = 0): Gauss {
    const [rn, rd] = doubleToFraction(real);
    const [in_, id] = doubleToFraction(imag);
    return new Gauss(rn, rd, in_, id);
  }

  /**
   * Creates a Gauss from polar coordinates (approximate — uses doubles internally).
   */
  static fromPolar(magnitude: number, phase: number): Gauss {
    return Gauss.fromDouble(
      magnitude * Math.cos(phase),
      magnitude * Math.sin(phase),
    );
  }

  // ── Classification Properties ─────────────────────────────────────

  get isReal(): boolean {
    return this.c === 0n;
  }

  get isPurelyImaginary(): boolean {
    return this.a === 0n && this.c !== 0n;
  }

  get isInteger(): boolean {
    return this.isReal && this.b === 1n;
  }

  get isGaussianInteger(): boolean {
    return this.b === 1n && this.d === 1n;
  }

  get isZero(): boolean {
    return this.a === 0n && this.c === 0n;
  }

  get isOne(): boolean {
    return this.a === 1n && this.b === 1n && this.c === 0n;
  }

  get isPositive(): boolean {
    return this.isReal && this.a > 0n;
  }

  get isNegative(): boolean {
    return this.isReal && this.a < 0n;
  }

  // ── Derived Properties ────────────────────────────────────────────

  /** Complex conjugate: a/b - (c/d)i. */
  get conjugate(): Gauss {
    return new Gauss(this.a, this.b, -this.c, this.d);
  }

  /** |z|² = (a/b)² + (c/d)² as an exact Gauss. */
  get magnitudeSquared(): Gauss {
    // (a/b)² + (c/d)² = a²d² + c²b² / b²d²
    const num = this.a * this.a * this.d * this.d + this.c * this.c * this.b * this.b;
    const den = this.b * this.b * this.d * this.d;
    return new Gauss(num, den, 0, 1);
  }

  /** Alias for magnitudeSquared. */
  get norm(): Gauss {
    return this.magnitudeSquared;
  }

  /** |z| as a double approximation. */
  get magnitude(): number {
    const re = Number(this.a) / Number(this.b);
    const im = Number(this.c) / Number(this.d);
    return Math.sqrt(re * re + im * im);
  }

  /** Argument (phase angle) in radians as a double approximation. */
  get phase(): number {
    const re = Number(this.a) / Number(this.b);
    const im = Number(this.c) / Number(this.d);
    return Math.atan2(im, re);
  }

  /** Real part as a Gauss (imaginary set to 0). */
  get realPart(): Gauss {
    return new Gauss(this.a, this.b, 0, 1);
  }

  /** Imaginary coefficient as a Gauss (the c/d part, as a real Gauss). */
  get imaginaryPart(): Gauss {
    return new Gauss(this.c, this.d, 0, 1);
  }

  /** Multiplicative inverse: 1/z = conjugate / |z|². */
  get reciprocal(): Gauss {
    if (this.isZero) throw new Error('Cannot compute reciprocal of zero');
    return this.conjugate.div(this.magnitudeSquared);
  }

  /** Alias for reciprocal. */
  get inverse(): Gauss {
    return this.reciprocal;
  }

  // ── Pramana Identity ─────────────────────────────────────────────

  /** Canonical key: "a,b,c,d". */
  get pramanaKey(): string {
    return `${this.a},${this.b},${this.c},${this.d}`;
  }

  /** Pramana label: "pra:num:a,b,c,d". */
  get pramanaLabel(): string {
    return `pra:num:${this.pramanaKey}`;
  }

  /** Deterministic UUID v5 identifier. */
  get pramanaId(): string {
    return pramanaNumId(this.pramanaKey);
  }

  /** Pramana entity URL using UUID. */
  get pramanaHashUrl(): string {
    return `${PRAMANA_BASE_URL}${this.pramanaId}`;
  }

  /** Pramana entity URL using pramana string. */
  get pramanaUrl(): string {
    return `${PRAMANA_BASE_URL}${this.pramanaLabel}`;
  }

  // ── Arithmetic ────────────────────────────────────────────────────

  add(other: Gauss): Gauss {
    // (a1/b1 + a2/b2) + (c1/d1 + c2/d2)i
    const realNum = this.a * other.b + other.a * this.b;
    const realDen = this.b * other.b;
    const imagNum = this.c * other.d + other.c * this.d;
    const imagDen = this.d * other.d;
    return new Gauss(realNum, realDen, imagNum, imagDen);
  }

  sub(other: Gauss): Gauss {
    const realNum = this.a * other.b - other.a * this.b;
    const realDen = this.b * other.b;
    const imagNum = this.c * other.d - other.c * this.d;
    const imagDen = this.d * other.d;
    return new Gauss(realNum, realDen, imagNum, imagDen);
  }

  mul(other: Gauss): Gauss {
    // (a/b + c/d i) * (e/f + g/h i)
    // real = ae/bf - cg/dh = (aehd - cgbf) / (bfdh)
    // imag = ag/bh + ce/df = (aghd... wait, let me do this properly
    // real = (a/b)(e/f) - (c/d)(g/h) = (a*e*d*h - c*g*b*f) / (b*f*d*h)
    // imag = (a/b)(g/h) + (c/d)(e/f) = (a*g*d*f + c*e*b*h) / (b*h*d*f)
    // Hmm, let me simplify. Using fraction arithmetic:
    // real_part = a*e/(b*f) - c*g/(d*h)
    // = (a*e*d*h - c*g*b*f) / (b*f*d*h)
    // imag_part = a*g/(b*h) + c*e/(d*f)
    // = (a*g*d*f + c*e*b*h) / (b*h*d*f)
    const e = other.a, f = other.b, g = other.c, h = other.d;

    const realNum = this.a * e * this.d * h - this.c * g * this.b * f;
    const realDen = this.b * f * this.d * h;
    const imagNum = this.a * g * this.d * f + this.c * e * this.b * h;
    const imagDen = this.b * h * this.d * f;

    return new Gauss(realNum, realDen, imagNum, imagDen);
  }

  div(other: Gauss): Gauss {
    if (other.isZero) throw new Error('Division by zero');
    // z1/z2 = z1 * conj(z2) / |z2|²
    const conjOther = other.conjugate;
    const numerator = this.mul(conjOther);
    const denominator = other.magnitudeSquared;
    // denominator is real: a/b + 0i
    // Divide numerator's real and imag by denominator's real
    // (nr/nd) / (dr/dd) = (nr*dd) / (nd*dr)
    return new Gauss(
      numerator.a * denominator.b,
      numerator.b * denominator.a,
      numerator.c * denominator.b,
      numerator.d * denominator.a,
    );
  }

  neg(): Gauss {
    return new Gauss(-this.a, this.b, -this.c, this.d);
  }

  /** Integer exponentiation (supports negative exponents via reciprocal). */
  pow(exp: number): Gauss {
    if (exp === 0) return Gauss.ONE;
    if (exp < 0) {
      return this.reciprocal.pow(-exp);
    }
    let result: Gauss = Gauss.ONE;
    let base: Gauss = this;
    let e = exp;
    while (e > 0) {
      if (e & 1) result = result.mul(base);
      base = base.mul(base);
      e >>= 1;
    }
    return result;
  }

  /** Modulo (real values only). */
  mod(other: Gauss): Gauss {
    if (!this.isReal || !other.isReal) {
      throw new Error('Modulo only defined for real values');
    }
    // a/b mod e/f = (a*f mod e*b) / (b*f)
    const num = (this.a * other.b) % (other.a * this.b);
    const den = this.b * other.b;
    return new Gauss(num, den, 0, 1);
  }

  // ── Math Static Methods ───────────────────────────────────────────

  /** Absolute value for real values; throws for complex. */
  static abs(value: Gauss): Gauss {
    if (!value.isReal) throw new Error('abs() is only defined for real values');
    return new Gauss(bigAbs(value.a), value.b, 0, 1);
  }

  /** Sign of real part: -1, 0, or 1. */
  static sign(value: Gauss): number {
    if (!value.isReal) throw new Error('sign() is only defined for real values');
    if (value.a === 0n) return 0;
    return value.a > 0n ? 1 : -1;
  }

  /** Floor of real part (real values only). Returns Gauss with integer value. */
  static floor(value: Gauss): Gauss {
    if (!value.isReal) throw new Error('floor() is only defined for real values');
    // floor(a/b)
    let result: bigint;
    if (value.a >= 0n) {
      result = value.a / value.b;
    } else {
      result = (value.a - value.b + 1n) / value.b;
    }
    return Gauss.fromInt(result);
  }

  /** Ceiling of real part (real values only). */
  static ceiling(value: Gauss): Gauss {
    if (!value.isReal) throw new Error('ceiling() is only defined for real values');
    let result: bigint;
    if (value.a >= 0n) {
      result = (value.a + value.b - 1n) / value.b;
    } else {
      result = value.a / value.b;
    }
    return Gauss.fromInt(result);
  }

  /** Truncate toward zero (real values only). */
  static truncate(value: Gauss): Gauss {
    if (!value.isReal) throw new Error('truncate() is only defined for real values');
    return Gauss.fromInt(value.a / value.b);
  }

  /** Minimum of two Gauss values (compared by real part). */
  static min(a: Gauss, b: Gauss): Gauss {
    return a.compareTo(b) <= 0 ? a : b;
  }

  /** Maximum of two Gauss values (compared by real part). */
  static max(a: Gauss, b: Gauss): Gauss {
    return a.compareTo(b) >= 0 ? a : b;
  }

  /** Clamp a value between min and max bounds. */
  static clamp(value: Gauss, min: Gauss, max: Gauss): Gauss {
    if (value.compareTo(min) < 0) return min;
    if (value.compareTo(max) > 0) return max;
    return value;
  }

  /** Returns polar form as [magnitude, phase] double approximations. */
  toPolar(): [number, number] {
    return [this.magnitude, this.phase];
  }

  // ── Associates ────────────────────────────────────────────────────

  /** Returns the three non-trivial associates. */
  associates(): Gauss[] {
    return [
      this.neg(),
      this.mul(Gauss.I),
      this.mul(new Gauss(0, 1, -1, 1)),
    ];
  }

  /** Tests if other is an associate. */
  isAssociate(other: Gauss): boolean {
    return this.magnitudeSquared.eq(other.magnitudeSquared) && (
      this.eq(other) || this.associates().some(a => a.eq(other))
    );
  }

  // ── Conversion ────────────────────────────────────────────────────

  /** Converts to a Gint. Throws if not a Gaussian integer. */
  toGint(): Gint {
    if (!this.isGaussianInteger) {
      throw new Error('Cannot convert to Gint: not a Gaussian integer');
    }
    return new Gint(this.a, this.c);
  }

  /** Returns as a double array [real, imaginary]. */
  toDoubleArray(): [number, number] {
    return [Number(this.a) / Number(this.b), Number(this.c) / Number(this.d)];
  }

  // ── Comparison ────────────────────────────────────────────────────

  /** Equality: all four normalized components match. */
  eq(other: Gauss): boolean {
    return this.a === other.a && this.b === other.b
      && this.c === other.c && this.d === other.d;
  }

  ne(other: Gauss): boolean {
    return !this.eq(other);
  }

  /**
   * Lexicographic comparison: real part first (by cross-multiplication),
   * then imaginary part.
   */
  compareTo(other: Gauss): -1 | 0 | 1 {
    // Compare real parts: a1/b1 vs a2/b2 → a1*b2 vs a2*b1
    const realCmp = this.a * other.b - other.a * this.b;
    if (realCmp < 0n) return -1;
    if (realCmp > 0n) return 1;
    // Compare imaginary parts: c1/d1 vs c2/d2 → c1*d2 vs c2*d1
    const imagCmp = this.c * other.d - other.c * this.d;
    if (imagCmp < 0n) return -1;
    if (imagCmp > 0n) return 1;
    return 0;
  }

  lt(other: Gauss): boolean { return this.compareTo(other) < 0; }
  gt(other: Gauss): boolean { return this.compareTo(other) > 0; }
  lte(other: Gauss): boolean { return this.compareTo(other) <= 0; }
  gte(other: Gauss): boolean { return this.compareTo(other) >= 0; }

  // ── String Representations ────────────────────────────────────────

  /** Human-readable mixed-fraction format: "1 & 1/2 + 3/4i". */
  toString(): string {
    if (this.isZero) return '0';

    const parts: string[] = [];

    // Format real part
    if (this.a !== 0n) {
      parts.push(formatFraction(this.a, this.b));
    }

    // Format imaginary part
    if (this.c !== 0n) {
      const imagStr = formatFractionCoeff(this.c, this.d);
      if (parts.length > 0) {
        if (this.c > 0n) {
          parts.push(`+ ${imagStr}i`);
        } else {
          parts.push(`- ${formatFractionCoeff(bigAbs(this.c), this.d)}i`);
        }
      } else {
        parts.push(`${imagStr}i`);
      }
    }

    return parts.join(' ');
  }

  /** Raw vector format: "<a,b,c,d>". */
  toRawString(): string {
    return `<${this.a},${this.b},${this.c},${this.d}>`;
  }

  /** Decimal approximation format. */
  toDecimalString(precision = 15): string {
    const re = Number(this.a) / Number(this.b);
    const im = Number(this.c) / Number(this.d);
    if (im === 0) return re.toPrecision(precision);
    const sign = im >= 0 ? '+' : '-';
    return `${re.toPrecision(precision)} ${sign} ${Math.abs(im).toPrecision(precision)}i`;
  }

  /** Improper fraction format: "7/2 + 3/4i". */
  toImproperString(): string {
    if (this.isZero) return '0';
    const parts: string[] = [];

    if (this.a !== 0n) {
      parts.push(this.b === 1n ? `${this.a}` : `${this.a}/${this.b}`);
    }

    if (this.c !== 0n) {
      const coeff = this.d === 1n
        ? (bigAbs(this.c) === 1n ? '' : `${bigAbs(this.c)}`)
        : `${bigAbs(this.c)}/${this.d}`;

      if (parts.length > 0) {
        parts.push(this.c > 0n ? `+ ${coeff}i` : `- ${coeff}i`);
      } else {
        const sign = this.c < 0n ? '-' : '';
        parts.push(`${sign}${coeff}i`);
      }
    }

    return parts.join(' ');
  }

  /** For JSON serialization. */
  toJSON(): { a: string; b: string; c: string; d: string } {
    return {
      a: this.a.toString(),
      b: this.b.toString(),
      c: this.c.toString(),
      d: this.d.toString(),
    };
  }
}

/** Alias for backward compatibility / mathematical notation. */
export const Qi = Gauss;

// ── Internal Helpers ──────────────────────────────────────────────────

/** Formats a fraction a/b as mixed fraction: "1 & 1/2" or "3" or "1/3". */
function formatFraction(a: bigint, b: bigint): string {
  if (b === 1n) return a.toString();
  const absA = bigAbs(a);
  const sign = a < 0n ? '-' : '';
  const whole = absA / b;
  const rem = absA % b;
  if (rem === 0n) return `${sign}${whole}`;
  if (whole === 0n) return `${sign}${rem}/${b}`;
  return `${sign}${whole} & ${rem}/${b}`;
}

/** Formats a fraction for use as a coefficient of i. */
function formatFractionCoeff(a: bigint, b: bigint): string {
  const absA = bigAbs(a);
  const sign = a < 0n ? '-' : '';
  if (b === 1n) {
    if (absA === 1n) return sign;
    return `${sign}${absA}`;
  }
  return `${sign}${absA}/${b}`;
}

/**
 * Converts a floating-point number to a rational approximation
 * using continued fraction expansion.
 */
function doubleToFraction(value: number, tolerance = 1e-15, maxIterations = 64): [bigint, bigint] {
  if (!isFinite(value)) throw new Error('Cannot convert non-finite value to fraction');
  if (value === 0) return [0n, 1n];

  const sign = value < 0 ? -1n : 1n;
  let x = Math.abs(value);

  let h1 = 1n, h2 = 0n;
  let k1 = 0n, k2 = 1n;

  for (let i = 0; i < maxIterations; i++) {
    const a = BigInt(Math.floor(x));
    const h = a * h1 + h2;
    const k = a * k1 + k2;

    h2 = h1; h1 = h;
    k2 = k1; k1 = k;

    const approx = Number(h) / Number(k);
    if (Math.abs(approx - Math.abs(value)) < tolerance) break;

    const frac = x - Number(a);
    if (frac < tolerance) break;
    x = 1 / frac;
  }

  return [sign * h1, k1];
}
