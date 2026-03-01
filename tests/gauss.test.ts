import { describe, it, expect } from 'vitest';
import { Gauss } from '../src/gauss.js';
import { Gint } from '../src/gint.js';

describe('Gauss', () => {
  // ── Construction ──────────────────────────────────────────────────

  describe('construction', () => {
    it('creates from four components', () => {
      const g = new Gauss(3, 2, 5, 7);
      expect(g.a).toBe(3n);
      expect(g.b).toBe(2n);
      expect(g.c).toBe(5n);
      expect(g.d).toBe(7n);
    });

    it('normalizes fractions', () => {
      const g = new Gauss(6, 4, 10, 15);
      expect(g.a).toBe(3n);
      expect(g.b).toBe(2n);
      expect(g.c).toBe(2n);
      expect(g.d).toBe(3n);
    });

    it('normalizes negative denominators', () => {
      const g = new Gauss(-3, -2, 5, -7);
      expect(g.a).toBe(3n);
      expect(g.b).toBe(2n);
      expect(g.c).toBe(-5n);
      expect(g.d).toBe(7n);
    });

    it('throws for zero denominator', () => {
      expect(() => new Gauss(1, 0, 0, 1)).toThrow();
      expect(() => new Gauss(0, 1, 1, 0)).toThrow();
    });

    it('is frozen (immutable)', () => {
      const g = new Gauss(1, 2, 3, 4);
      expect(Object.isFrozen(g)).toBe(true);
    });

    it('normalizes zero numerator', () => {
      const g = new Gauss(0, 5, 0, 3);
      expect(g.a).toBe(0n);
      expect(g.b).toBe(1n);
      expect(g.c).toBe(0n);
      expect(g.d).toBe(1n);
    });
  });

  // ── Static Constants ──────────────────────────────────────────────

  describe('static constants', () => {
    it('ZERO', () => {
      expect(Gauss.ZERO.isZero).toBe(true);
    });

    it('ONE', () => {
      expect(Gauss.ONE.isOne).toBe(true);
    });

    it('I', () => {
      expect(Gauss.I.a).toBe(0n);
      expect(Gauss.I.c).toBe(1n);
    });
  });

  // ── Static Factory Methods ────────────────────────────────────────

  describe('static factory methods', () => {
    it('fromInt', () => {
      const g = Gauss.fromInt(5);
      expect(g.a).toBe(5n);
      expect(g.b).toBe(1n);
      expect(g.c).toBe(0n);
      expect(g.d).toBe(1n);
    });

    it('fromComplex', () => {
      const g = Gauss.fromComplex(3, 4);
      expect(g.a).toBe(3n);
      expect(g.b).toBe(1n);
      expect(g.c).toBe(4n);
      expect(g.d).toBe(1n);
    });

    it('fromGint', () => {
      const gi = new Gint(3, 4);
      const g = Gauss.fromGint(gi);
      expect(g.a).toBe(3n);
      expect(g.b).toBe(1n);
      expect(g.c).toBe(4n);
      expect(g.d).toBe(1n);
    });

    it('parse from A,B,C,D format', () => {
      const g = Gauss.parse('3,2,5,7');
      expect(g.a).toBe(3n);
      expect(g.b).toBe(2n);
      expect(g.c).toBe(5n);
      expect(g.d).toBe(7n);
    });

    it('parse strips pra:num: prefix', () => {
      const g = Gauss.parse('pra:num:3,2,5,7');
      expect(g.a).toBe(3n);
      expect(g.b).toBe(2n);
    });

    it('parse strips num: prefix', () => {
      const g = Gauss.parse('num:1,1,0,1');
      expect(g.a).toBe(1n);
    });

    it('fromDouble', () => {
      const g = Gauss.fromDouble(0.5, 0.25);
      expect(g.a).toBe(1n);
      expect(g.b).toBe(2n);
      expect(g.c).toBe(1n);
      expect(g.d).toBe(4n);
    });

    it('units returns four units', () => {
      expect(Gauss.units()).toHaveLength(4);
    });
  });

  // ── Classification Properties ─────────────────────────────────────

  describe('classification', () => {
    it('isReal', () => {
      expect(new Gauss(3, 2, 0, 1).isReal).toBe(true);
      expect(new Gauss(3, 2, 1, 1).isReal).toBe(false);
    });

    it('isPurelyImaginary', () => {
      expect(new Gauss(0, 1, 3, 2).isPurelyImaginary).toBe(true);
      expect(new Gauss(1, 1, 3, 2).isPurelyImaginary).toBe(false);
    });

    it('isInteger', () => {
      expect(new Gauss(5, 1, 0, 1).isInteger).toBe(true);
      expect(new Gauss(5, 2, 0, 1).isInteger).toBe(false);
    });

    it('isGaussianInteger', () => {
      expect(new Gauss(3, 1, 4, 1).isGaussianInteger).toBe(true);
      expect(new Gauss(3, 2, 4, 1).isGaussianInteger).toBe(false);
    });

    it('isZero', () => {
      expect(new Gauss(0, 1, 0, 1).isZero).toBe(true);
      expect(new Gauss(1, 1, 0, 1).isZero).toBe(false);
    });

    it('isOne', () => {
      expect(new Gauss(1, 1, 0, 1).isOne).toBe(true);
    });

    it('isPositive and isNegative', () => {
      expect(new Gauss(3, 2, 0, 1).isPositive).toBe(true);
      expect(new Gauss(-3, 2, 0, 1).isNegative).toBe(true);
    });
  });

  // ── Derived Properties ────────────────────────────────────────────

  describe('derived properties', () => {
    it('conjugate', () => {
      const g = new Gauss(3, 2, 5, 7);
      const c = g.conjugate;
      expect(c.a).toBe(3n);
      expect(c.b).toBe(2n);
      expect(c.c).toBe(-5n);
      expect(c.d).toBe(7n);
    });

    it('magnitudeSquared', () => {
      // |1/2 + 1/2 i|² = 1/4 + 1/4 = 1/2
      const g = new Gauss(1, 2, 1, 2);
      const ms = g.magnitudeSquared;
      expect(ms.a).toBe(1n);
      expect(ms.b).toBe(2n);
      expect(ms.c).toBe(0n);
    });

    it('reciprocal of ONE is ONE', () => {
      expect(Gauss.ONE.reciprocal.eq(Gauss.ONE)).toBe(true);
    });

    it('reciprocal of i is -i', () => {
      const r = Gauss.I.reciprocal;
      expect(r.a).toBe(0n);
      expect(r.c).toBe(-1n);
    });

    it('reciprocal throws for zero', () => {
      expect(() => Gauss.ZERO.reciprocal).toThrow();
    });

    it('realPart and imaginaryPart', () => {
      const g = new Gauss(3, 2, 5, 7);
      expect(g.realPart.a).toBe(3n);
      expect(g.realPart.b).toBe(2n);
      expect(g.realPart.c).toBe(0n);
      expect(g.imaginaryPart.a).toBe(5n);
      expect(g.imaginaryPart.b).toBe(7n);
    });
  });

  // ── Arithmetic ────────────────────────────────────────────────────

  describe('arithmetic', () => {
    it('add', () => {
      // 1/2 + 1/3 = 5/6
      const a = new Gauss(1, 2, 0, 1);
      const b = new Gauss(1, 3, 0, 1);
      const r = a.add(b);
      expect(r.a).toBe(5n);
      expect(r.b).toBe(6n);
    });

    it('sub', () => {
      const a = new Gauss(1, 2, 0, 1);
      const b = new Gauss(1, 3, 0, 1);
      const r = a.sub(b);
      expect(r.a).toBe(1n);
      expect(r.b).toBe(6n);
    });

    it('mul real', () => {
      // (1/2)(1/3) = 1/6
      const a = new Gauss(1, 2, 0, 1);
      const b = new Gauss(1, 3, 0, 1);
      const r = a.mul(b);
      expect(r.a).toBe(1n);
      expect(r.b).toBe(6n);
    });

    it('mul complex', () => {
      // (1+i)(1-i) = 1 - i² = 2
      const a = Gauss.fromComplex(1, 1);
      const b = Gauss.fromComplex(1, -1);
      const r = a.mul(b);
      expect(r.a).toBe(2n);
      expect(r.b).toBe(1n);
      expect(r.c).toBe(0n);
    });

    it('div', () => {
      // 1 / 2 = 1/2
      const r = Gauss.ONE.div(Gauss.fromInt(2));
      expect(r.a).toBe(1n);
      expect(r.b).toBe(2n);
    });

    it('div complex', () => {
      // (1+i)/(1-i) = (1+i)²/2 = 2i/2 = i
      const a = Gauss.fromComplex(1, 1);
      const b = Gauss.fromComplex(1, -1);
      const r = a.div(b);
      expect(r.a).toBe(0n);
      expect(r.c).toBe(1n);
      expect(r.d).toBe(1n);
    });

    it('div throws for zero', () => {
      expect(() => Gauss.ONE.div(Gauss.ZERO)).toThrow();
    });

    it('neg', () => {
      const g = new Gauss(3, 2, 5, 7);
      const n = g.neg();
      expect(n.a).toBe(-3n);
      expect(n.c).toBe(-5n);
    });

    it('pow positive', () => {
      // (1+i)^2 = 2i
      const g = Gauss.fromComplex(1, 1);
      const r = g.pow(2);
      expect(r.a).toBe(0n);
      expect(r.c).toBe(2n);
    });

    it('pow zero', () => {
      expect(new Gauss(3, 2, 5, 7).pow(0).eq(Gauss.ONE)).toBe(true);
    });

    it('pow negative', () => {
      // 2^-1 = 1/2
      const r = Gauss.fromInt(2).pow(-1);
      expect(r.a).toBe(1n);
      expect(r.b).toBe(2n);
    });
  });

  // ── Math Static Methods ───────────────────────────────────────────

  describe('math methods', () => {
    it('abs', () => {
      const r = Gauss.abs(new Gauss(-3, 2, 0, 1));
      expect(r.a).toBe(3n);
      expect(r.b).toBe(2n);
    });

    it('abs throws for complex', () => {
      expect(() => Gauss.abs(Gauss.I)).toThrow();
    });

    it('sign', () => {
      expect(Gauss.sign(new Gauss(3, 2, 0, 1))).toBe(1);
      expect(Gauss.sign(new Gauss(-3, 2, 0, 1))).toBe(-1);
      expect(Gauss.sign(Gauss.ZERO)).toBe(0);
    });

    it('floor', () => {
      // floor(7/3) = 2
      const r = Gauss.floor(new Gauss(7, 3, 0, 1));
      expect(r.a).toBe(2n);
      expect(r.b).toBe(1n);
    });

    it('floor negative', () => {
      // floor(-7/3) = -3
      const r = Gauss.floor(new Gauss(-7, 3, 0, 1));
      expect(r.a).toBe(-3n);
      expect(r.b).toBe(1n);
    });

    it('ceiling', () => {
      // ceil(7/3) = 3
      const r = Gauss.ceiling(new Gauss(7, 3, 0, 1));
      expect(r.a).toBe(3n);
      expect(r.b).toBe(1n);
    });

    it('truncate', () => {
      // truncate(-7/3) = -2 (toward zero)
      const r = Gauss.truncate(new Gauss(-7, 3, 0, 1));
      expect(r.a).toBe(-2n);
    });

    it('min and max', () => {
      const a = new Gauss(1, 3, 0, 1);
      const b = new Gauss(1, 2, 0, 1);
      expect(Gauss.min(a, b).eq(a)).toBe(true);
      expect(Gauss.max(a, b).eq(b)).toBe(true);
    });

    it('clamp', () => {
      const val = Gauss.fromInt(5);
      const lo = Gauss.fromInt(1);
      const hi = Gauss.fromInt(3);
      expect(Gauss.clamp(val, lo, hi).eq(hi)).toBe(true);
    });
  });

  // ── Associates ────────────────────────────────────────────────────

  describe('associates', () => {
    it('returns three associates', () => {
      const g = new Gauss(3, 2, 5, 7);
      expect(g.associates()).toHaveLength(3);
    });

    it('isAssociate detects associates', () => {
      const g = Gauss.fromComplex(3, 4);
      expect(g.isAssociate(g.neg())).toBe(true);
    });
  });

  // ── Conversion ────────────────────────────────────────────────────

  describe('conversion', () => {
    it('toGint for Gaussian integer', () => {
      const g = Gauss.fromComplex(3, 4);
      const gi = g.toGint();
      expect(gi.real).toBe(3n);
      expect(gi.imag).toBe(4n);
    });

    it('toGint throws for non-integer', () => {
      expect(() => new Gauss(1, 2, 0, 1).toGint()).toThrow();
    });

    it('toDoubleArray', () => {
      const arr = new Gauss(1, 2, 3, 4).toDoubleArray();
      expect(arr[0]).toBeCloseTo(0.5);
      expect(arr[1]).toBeCloseTo(0.75);
    });
  });

  // ── Comparison ────────────────────────────────────────────────────

  describe('comparison', () => {
    it('eq', () => {
      const a = new Gauss(3, 2, 5, 7);
      const b = new Gauss(3, 2, 5, 7);
      expect(a.eq(b)).toBe(true);
    });

    it('eq with different representations that normalize the same', () => {
      const a = new Gauss(6, 4, 10, 14);
      const b = new Gauss(3, 2, 5, 7);
      expect(a.eq(b)).toBe(true);
    });

    it('compareTo', () => {
      const a = new Gauss(1, 3, 0, 1);
      const b = new Gauss(1, 2, 0, 1);
      expect(a.compareTo(b)).toBe(-1);
      expect(b.compareTo(a)).toBe(1);
      expect(a.compareTo(a)).toBe(0);
    });
  });

  // ── String Representations ────────────────────────────────────────

  describe('string representations', () => {
    it('toString for zero', () => {
      expect(Gauss.ZERO.toString()).toBe('0');
    });

    it('toString for integer', () => {
      expect(Gauss.fromInt(5).toString()).toBe('5');
    });

    it('toString for fraction', () => {
      expect(new Gauss(1, 2, 0, 1).toString()).toBe('1/2');
    });

    it('toString for mixed fraction', () => {
      expect(new Gauss(7, 2, 0, 1).toString()).toBe('3 & 1/2');
    });

    it('toString for complex', () => {
      const s = Gauss.fromComplex(3, 4).toString();
      expect(s).toBe('3 + 4i');
    });

    it('toRawString', () => {
      expect(new Gauss(3, 2, 5, 7).toRawString()).toBe('<3,2,5,7>');
    });

    it('toImproperString', () => {
      expect(new Gauss(7, 2, 3, 4).toImproperString()).toBe('7/2 + 3/4i');
    });
  });

  // ── Pramana Identity ─────────────────────────────────────────────

  describe('pramana identity', () => {
    it('pramanaKey', () => {
      expect(new Gauss(3, 2, 5, 7).pramanaKey).toBe('3,2,5,7');
    });

    it('pramanaLabel', () => {
      expect(new Gauss(3, 2, 5, 7).pramanaLabel).toBe('pra:num:3,2,5,7');
    });

    it('pramanaId is a valid UUID v5', () => {
      const id = new Gauss(3, 2, 5, 7).pramanaId;
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });

    it('deterministic: same value produces same ID', () => {
      expect(new Gauss(3, 2, 5, 7).pramanaId).toBe(new Gauss(6, 4, 10, 14).pramanaId);
    });

    it('pramanaUrl contains label', () => {
      const url = new Gauss(3, 2, 5, 7).pramanaUrl;
      expect(url).toContain('pra:num:3,2,5,7');
    });

    it('pramanaHashUrl contains UUID', () => {
      const url = new Gauss(3, 2, 5, 7).pramanaHashUrl;
      expect(url).toContain(new Gauss(3, 2, 5, 7).pramanaId);
    });
  });

  // ── JSON ──────────────────────────────────────────────────────────

  describe('JSON', () => {
    it('toJSON', () => {
      expect(new Gauss(3, 2, 5, 7).toJSON()).toEqual({
        a: '3', b: '2', c: '5', d: '7',
      });
    });
  });
});
