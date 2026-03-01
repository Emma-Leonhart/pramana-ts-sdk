/**
 * Utility functions for number theory operations with bigint.
 */

/** Greatest common divisor for bigint values. */
export function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
}

/** Absolute value for bigint. */
export function bigAbs(n: bigint): bigint {
  return n < 0n ? -n : n;
}

/** Tests whether a positive integer is prime using trial division up to sqrt(n). */
export function isPrime(n: bigint | number): boolean {
  const bn = BigInt(n);
  if (bn < 2n) return false;
  if (bn < 4n) return true;
  if (bn % 2n === 0n) return false;
  if (bn % 3n === 0n) return false;
  let i = 5n;
  while (i * i <= bn) {
    if (bn % i === 0n || bn % (i + 2n) === 0n) return false;
    i += 6n;
  }
  return true;
}

/**
 * Normalizes a fraction to lowest terms with a positive denominator.
 * Returns [numerator, denominator].
 */
export function normalize(num: bigint, den: bigint): [bigint, bigint] {
  if (den === 0n) throw new Error('Denominator cannot be zero');
  if (num === 0n) return [0n, 1n];
  // Ensure positive denominator
  if (den < 0n) {
    num = -num;
    den = -den;
  }
  const g = gcd(bigAbs(num), den);
  return [num / g, den / g];
}
