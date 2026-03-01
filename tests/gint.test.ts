import { describe, it, expect } from 'vitest';
import { Gint } from '../src/gint.js';

describe('Gint', () => {
  // ── Construction ──────────────────────────────────────────────────

  describe('construction', () => {
    it('creates zero by default', () => {
      const z = new Gint();
      expect(z.real).toBe(0n);
      expect(z.imag).toBe(0n);
    });

    it('creates from integers', () => {
      const g = new Gint(3, 4);
      expect(g.real).toBe(3n);
      expect(g.imag).toBe(4n);
    });

    it('creates from bigints', () => {
      const g = new Gint(3n, 4n);
      expect(g.real).toBe(3n);
      expect(g.imag).toBe(4n);
    });

    it('creates with real only', () => {
      const g = new Gint(5);
      expect(g.real).toBe(5n);
      expect(g.imag).toBe(0n);
    });

    it('is frozen (immutable)', () => {
      const g = new Gint(1, 2);
      expect(Object.isFrozen(g)).toBe(true);
    });
  });

  // ── Static Constants ──────────────────────────────────────────────

  describe('static constants', () => {
    it('ZERO', () => {
      expect(Gint.ZERO.real).toBe(0n);
      expect(Gint.ZERO.imag).toBe(0n);
    });

    it('ONE', () => {
      expect(Gint.ONE.real).toBe(1n);
      expect(Gint.ONE.imag).toBe(0n);
    });

    it('MINUS_ONE', () => {
      expect(Gint.MINUS_ONE.real).toBe(-1n);
      expect(Gint.MINUS_ONE.imag).toBe(0n);
    });

    it('I', () => {
      expect(Gint.I.real).toBe(0n);
      expect(Gint.I.imag).toBe(1n);
    });
  });

  // ── Static Factory Methods ────────────────────────────────────────

  describe('static factory methods', () => {
    it('eye() returns i', () => {
      expect(Gint.eye().eq(Gint.I)).toBe(true);
    });

    it('units() returns four units', () => {
      const units = Gint.units();
      expect(units).toHaveLength(4);
      expect(units.every(u => u.isUnit)).toBe(true);
    });

    it('two() returns 1+i', () => {
      const t = Gint.two();
      expect(t.real).toBe(1n);
      expect(t.imag).toBe(1n);
    });

    it('fromArray creates from array', () => {
      const g = Gint.fromArray([3, 4]);
      expect(g.real).toBe(3n);
      expect(g.imag).toBe(4n);
    });
  });

  // ── Classification Properties ─────────────────────────────────────

  describe('classification', () => {
    it('isZero', () => {
      expect(new Gint(0, 0).isZero).toBe(true);
      expect(new Gint(1, 0).isZero).toBe(false);
    });

    it('isOne', () => {
      expect(new Gint(1, 0).isOne).toBe(true);
      expect(new Gint(1, 1).isOne).toBe(false);
    });

    it('isReal', () => {
      expect(new Gint(5, 0).isReal).toBe(true);
      expect(new Gint(5, 1).isReal).toBe(false);
    });

    it('isPurelyImaginary', () => {
      expect(new Gint(0, 3).isPurelyImaginary).toBe(true);
      expect(new Gint(1, 3).isPurelyImaginary).toBe(false);
      expect(new Gint(0, 0).isPurelyImaginary).toBe(false);
    });

    it('isUnit', () => {
      expect(new Gint(1, 0).isUnit).toBe(true);
      expect(new Gint(-1, 0).isUnit).toBe(true);
      expect(new Gint(0, 1).isUnit).toBe(true);
      expect(new Gint(0, -1).isUnit).toBe(true);
      expect(new Gint(2, 0).isUnit).toBe(false);
    });

    it('isGaussianInteger is always true', () => {
      expect(new Gint(3, 4).isGaussianInteger).toBe(true);
    });
  });

  // ── Derived Properties ────────────────────────────────────────────

  describe('derived properties', () => {
    it('conjugate', () => {
      const g = new Gint(3, 4);
      expect(g.conjugate.real).toBe(3n);
      expect(g.conjugate.imag).toBe(-4n);
    });

    it('norm', () => {
      expect(new Gint(3, 4).norm).toBe(25n);
      expect(new Gint(0, 0).norm).toBe(0n);
      expect(new Gint(1, 1).norm).toBe(2n);
    });
  });

  // ── Arithmetic ────────────────────────────────────────────────────

  describe('arithmetic', () => {
    it('add', () => {
      const a = new Gint(1, 2);
      const b = new Gint(3, 4);
      const r = a.add(b);
      expect(r.real).toBe(4n);
      expect(r.imag).toBe(6n);
    });

    it('sub', () => {
      const a = new Gint(5, 3);
      const b = new Gint(2, 1);
      const r = a.sub(b);
      expect(r.real).toBe(3n);
      expect(r.imag).toBe(2n);
    });

    it('mul', () => {
      // (1+2i)(3+4i) = 3+4i+6i+8i² = 3+10i-8 = -5+10i
      const a = new Gint(1, 2);
      const b = new Gint(3, 4);
      const r = a.mul(b);
      expect(r.real).toBe(-5n);
      expect(r.imag).toBe(10n);
    });

    it('neg', () => {
      const g = new Gint(3, -4);
      const n = g.neg();
      expect(n.real).toBe(-3n);
      expect(n.imag).toBe(4n);
    });

    it('pow', () => {
      // i^2 = -1
      const r = Gint.I.pow(2);
      expect(r.real).toBe(-1n);
      expect(r.imag).toBe(0n);

      // i^4 = 1
      const r2 = Gint.I.pow(4);
      expect(r2.real).toBe(1n);
      expect(r2.imag).toBe(0n);

      // x^0 = 1
      expect(new Gint(5, 3).pow(0).eq(Gint.ONE)).toBe(true);
    });

    it('pow throws for negative exponents', () => {
      expect(() => new Gint(2, 0).pow(-1)).toThrow();
    });
  });

  // ── Floor Division & Modulo ───────────────────────────────────────

  describe('floor division and modulo', () => {
    it('modifiedDivmod basic', () => {
      const a = new Gint(11, 3);
      const b = new Gint(1, 8);
      const [q, r] = Gint.modifiedDivmod(a, b);
      // Verify a = b*q + r
      expect(b.mul(q).add(r).eq(a)).toBe(true);
      // Verify remainder norm < divisor norm
      expect(r.norm < b.norm).toBe(true);
    });

    it('modifiedDivmod throws for zero divisor', () => {
      expect(() => Gint.modifiedDivmod(new Gint(1), Gint.ZERO)).toThrow();
    });

    it('floorDiv and mod', () => {
      const a = new Gint(7, 2);
      const b = new Gint(3, 1);
      const q = a.floorDiv(b);
      const r = a.mod(b);
      expect(b.mul(q).add(r).eq(a)).toBe(true);
    });
  });

  // ── Number Theory ─────────────────────────────────────────────────

  describe('number theory', () => {
    it('gcd', () => {
      const a = new Gint(11, 3);
      const b = new Gint(1, 8);
      const g = Gint.gcd(a, b);
      // GCD should divide both
      const [, r1] = Gint.modifiedDivmod(a, g);
      const [, r2] = Gint.modifiedDivmod(b, g);
      expect(r1.isZero).toBe(true);
      expect(r2.isZero).toBe(true);
    });

    it('xgcd satisfies Bezout identity', () => {
      const a = new Gint(11, 3);
      const b = new Gint(1, 8);
      const [g, x, y] = Gint.xgcd(a, b);
      // g = a*x + b*y
      expect(a.mul(x).add(b.mul(y)).eq(g)).toBe(true);
    });

    it('isRelativelyPrime', () => {
      expect(Gint.isRelativelyPrime(new Gint(3, 0), new Gint(0, 7))).toBe(true);
    });

    it('isGaussianPrime', () => {
      // 3 is a Gaussian prime (3 ≡ 3 mod 4)
      expect(Gint.isGaussianPrime(new Gint(3, 0))).toBe(true);
      // 5 is not a Gaussian prime (5 ≡ 1 mod 4, splits as (2+i)(2-i))
      expect(Gint.isGaussianPrime(new Gint(5, 0))).toBe(false);
      // 2+i has norm 5 (prime), so it is a Gaussian prime
      expect(Gint.isGaussianPrime(new Gint(2, 1))).toBe(true);
      // 0 is not prime
      expect(Gint.isGaussianPrime(Gint.ZERO)).toBe(false);
    });

    it('congruentModulo', () => {
      const a = new Gint(5, 0);
      const b = new Gint(2, 0);
      const c = new Gint(3, 0);
      const [isCong] = Gint.congruentModulo(a, b, c);
      expect(isCong).toBe(true);
    });

    it('normsDivide', () => {
      const a = new Gint(2, 1); // norm = 5
      const b = new Gint(3, 4); // norm = 25
      expect(Gint.normsDivide(a, b)).toBe(5n);
    });
  });

  // ── Associates ────────────────────────────────────────────────────

  describe('associates', () => {
    it('returns three associates', () => {
      const g = new Gint(3, 4);
      const assoc = g.associates();
      expect(assoc).toHaveLength(3);
    });

    it('isAssociate', () => {
      const g = new Gint(3, 4);
      const neg = g.neg();
      expect(g.isAssociate(neg)).toBe(true);
      expect(g.isAssociate(new Gint(1, 1))).toBe(false);
    });
  });

  // ── Comparison ────────────────────────────────────────────────────

  describe('comparison', () => {
    it('eq and ne', () => {
      const a = new Gint(3, 4);
      const b = new Gint(3, 4);
      const c = new Gint(3, 5);
      expect(a.eq(b)).toBe(true);
      expect(a.ne(c)).toBe(true);
    });

    it('compareTo lexicographic', () => {
      expect(new Gint(1, 0).compareTo(new Gint(2, 0))).toBe(-1);
      expect(new Gint(2, 0).compareTo(new Gint(1, 0))).toBe(1);
      expect(new Gint(1, 1).compareTo(new Gint(1, 2))).toBe(-1);
      expect(new Gint(1, 1).compareTo(new Gint(1, 1))).toBe(0);
    });

    it('lt, gt, lte, gte', () => {
      const a = new Gint(1, 0);
      const b = new Gint(2, 0);
      expect(a.lt(b)).toBe(true);
      expect(b.gt(a)).toBe(true);
      expect(a.lte(a)).toBe(true);
      expect(b.gte(b)).toBe(true);
    });
  });

  // ── String Representations ────────────────────────────────────────

  describe('string representations', () => {
    it('toString for various values', () => {
      expect(new Gint(0, 0).toString()).toBe('0');
      expect(new Gint(5, 0).toString()).toBe('5');
      expect(new Gint(0, 1).toString()).toBe('i');
      expect(new Gint(0, -1).toString()).toBe('-i');
      expect(new Gint(3, 4).toString()).toBe('3 + 4i');
      expect(new Gint(3, -4).toString()).toBe('3 - 4i');
      expect(new Gint(-3, 0).toString()).toBe('-3');
      expect(new Gint(0, 5).toString()).toBe('5i');
    });

    it('toRawString', () => {
      expect(new Gint(3, 4).toRawString()).toBe('(3, 4)');
    });
  });

  // ── Pramana Identity ─────────────────────────────────────────────

  describe('pramana identity', () => {
    it('pramanaKey', () => {
      expect(new Gint(3, 4).pramanaKey).toBe('3,1,4,1');
    });

    it('pramanaLabel', () => {
      expect(new Gint(3, 4).pramanaLabel).toBe('pra:num:3,1,4,1');
    });

    it('pramanaId is a valid UUID', () => {
      const id = new Gint(3, 4).pramanaId;
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('deterministic: same value produces same ID', () => {
      expect(new Gint(3, 4).pramanaId).toBe(new Gint(3, 4).pramanaId);
    });

    it('different values produce different IDs', () => {
      expect(new Gint(3, 4).pramanaId).not.toBe(new Gint(4, 3).pramanaId);
    });
  });

  // ── Conversion ────────────────────────────────────────────────────

  describe('conversion', () => {
    it('toArray', () => {
      expect(new Gint(3, 4).toArray()).toEqual([3n, 4n]);
    });

    it('toJSON', () => {
      expect(new Gint(3, 4).toJSON()).toEqual({ real: '3', imag: '4' });
    });
  });
});
