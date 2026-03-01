import { describe, it, expect } from 'vitest';
import { isPrime, gcd, normalize } from '../src/number-theory.js';

describe('isPrime', () => {
  it('returns false for numbers less than 2', () => {
    expect(isPrime(0)).toBe(false);
    expect(isPrime(1)).toBe(false);
    expect(isPrime(-5)).toBe(false);
  });

  it('returns true for small primes', () => {
    expect(isPrime(2)).toBe(true);
    expect(isPrime(3)).toBe(true);
    expect(isPrime(5)).toBe(true);
    expect(isPrime(7)).toBe(true);
    expect(isPrime(11)).toBe(true);
    expect(isPrime(13)).toBe(true);
  });

  it('returns false for composites', () => {
    expect(isPrime(4)).toBe(false);
    expect(isPrime(6)).toBe(false);
    expect(isPrime(9)).toBe(false);
    expect(isPrime(15)).toBe(false);
    expect(isPrime(100)).toBe(false);
  });

  it('works with bigint', () => {
    expect(isPrime(97n)).toBe(true);
    expect(isPrime(100n)).toBe(false);
  });
});

describe('gcd', () => {
  it('computes gcd for positive numbers', () => {
    expect(gcd(12n, 8n)).toBe(4n);
    expect(gcd(7n, 13n)).toBe(1n);
  });

  it('handles negative numbers', () => {
    expect(gcd(-12n, 8n)).toBe(4n);
    expect(gcd(12n, -8n)).toBe(4n);
  });

  it('handles zero', () => {
    expect(gcd(5n, 0n)).toBe(5n);
    expect(gcd(0n, 5n)).toBe(5n);
  });
});

describe('normalize', () => {
  it('reduces fractions', () => {
    expect(normalize(6n, 4n)).toEqual([3n, 2n]);
  });

  it('makes denominator positive', () => {
    expect(normalize(3n, -2n)).toEqual([-3n, 2n]);
  });

  it('normalizes zero', () => {
    expect(normalize(0n, 5n)).toEqual([0n, 1n]);
  });

  it('throws for zero denominator', () => {
    expect(() => normalize(1n, 0n)).toThrow();
  });
});
