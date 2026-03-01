# pramana-ts-sdk

TypeScript SDK for the [Pramana](https://pramana.dev) knowledge graph. Provides exact-arithmetic value types for working with Pramana data in TypeScript.

> **Note:** This SDK is being developed as a learning project — TypeScript is a language I'm still picking up for the first time through vibecoding. If you have experience with TypeScript and want to help improve the code quality, contributions and feedback are very welcome! The C# and Python SDKs are more mature by comparison.

## Status

**Phase 1 implemented** — Core Gaussian arithmetic and Pramana identity generation are working. ORM mapping and data sources are planned for future phases.

### What's implemented

- **Gint** — Gaussian integers (Z[i]) with full arithmetic, number theory (GCD, xGCD, primality), and associates
- **Gauss** — Gaussian rationals (Q[i]) with exact rational arithmetic, formatting, and math utilities
- **UUID v5** — Deterministic Pramana ID generation matching the canonical Pramana web app
- **Number theory** — `isPrime`, `gcd`, fraction normalization
- **137 passing tests** across all modules

## Installation

```bash
npm install @pramana/sdk
```

Requires Node 18+ (uses native `bigint` and `crypto`).

## Quick Example

```typescript
import { Gint, Gauss, isPrime } from '@pramana/sdk';

// Gaussian integers
const a = new Gint(3, 4);          // 3 + 4i
const b = new Gint(1, -2);         // 1 - 2i
const product = a.mul(b);          // 11 - 2i
console.log(product.toString());   // "11 - 2i"

// Gaussian rationals (exact arithmetic)
const half = new Gauss(1, 2, 0, 1);   // 1/2
const third = new Gauss(1, 3, 0, 1);  // 1/3
const sum = half.add(third);           // 5/6
console.log(sum.toString());          // "5/6"

// Pramana identity
console.log(a.pramanaId);      // deterministic UUID v5
console.log(a.pramanaLabel);   // "pra:num:3,1,4,1"
console.log(a.pramanaUrl);     // "https://pramana.dev/entity/..."

// Number theory
console.log(Gint.isGaussianPrime(new Gint(3, 0)));  // true (3 ≡ 3 mod 4)
console.log(Gint.isGaussianPrime(new Gint(2, 1)));  // true (norm 5 is prime)

const [gcd, x, y] = Gint.xgcd(new Gint(11, 3), new Gint(1, 8));
// gcd = alpha*x + beta*y (Bezout's identity)
```

## API Overview

### Gint (Gaussian Integer)

| Feature | Examples |
|---------|----------|
| Construction | `new Gint(3, 4)`, `Gint.ZERO`, `Gint.I`, `Gint.fromArray([3, 4])` |
| Arithmetic | `.add()`, `.sub()`, `.mul()`, `.div()` (returns Gauss), `.pow()`, `.mod()`, `.neg()` |
| Properties | `.real`, `.imag`, `.norm`, `.conjugate`, `.isUnit`, `.isZero`, `.isReal` |
| Number theory | `Gint.gcd()`, `Gint.xgcd()`, `Gint.isGaussianPrime()`, `Gint.modifiedDivmod()` |
| Identity | `.pramanaId`, `.pramanaKey`, `.pramanaLabel`, `.pramanaUrl` |
| Formatting | `.toString()`, `.toRawString()`, `.toJSON()` |

### Gauss (Gaussian Rational)

| Feature | Examples |
|---------|----------|
| Construction | `new Gauss(a, b, c, d)`, `Gauss.fromInt(5)`, `Gauss.fromComplex(3, 4)`, `Gauss.parse("3,2,5,7")` |
| Arithmetic | `.add()`, `.sub()`, `.mul()`, `.div()`, `.pow()`, `.mod()`, `.neg()` |
| Properties | `.a`, `.b`, `.c`, `.d`, `.conjugate`, `.magnitudeSquared`, `.reciprocal`, `.phase` |
| Classification | `.isReal`, `.isInteger`, `.isGaussianInteger`, `.isZero`, `.isOne` |
| Math utilities | `Gauss.floor()`, `Gauss.ceiling()`, `Gauss.truncate()`, `Gauss.abs()`, `Gauss.sign()`, `Gauss.clamp()` |
| Formatting | `.toString()` (mixed), `.toImproperString()`, `.toRawString()`, `.toDecimalString()` |

### Aliases

- `Zi` = `Gint` (mathematical notation for Z[i])
- `Qi` = `Gauss` (mathematical notation for Q[i])

## Documentation

- [General SDK Specification](08_SDK_LIBRARY_SPECIFICATION.md) — Cross-language design spec
- [TypeScript Implementation Guide](IMPLEMENTATION.md) — TypeScript-specific details

## Acknowledgments

The Gauss and Gint implementations across all Pramana SDKs were heavily inspired by [gaussian_integers](https://github.com/alreich/gaussian_integers) by **Alfred J. Reich, Ph.D.**, which provides exact arithmetic for Gaussian integers and Gaussian rationals in Python.

## Pramana SDK Family

| Language | Repository | Package |
|----------|-----------|---------|
| C# / .NET | [pramana-dotnet-sdk](https://github.com/Emma-Leonhart/pramana-dotnet-sdk) | `Pramana.SDK` (NuGet) |
| Python | [pramana-python-sdk](https://github.com/Emma-Leonhart/pramana-python-sdk) | `pramana-sdk` (PyPI) |
| TypeScript | **pramana-ts-sdk** (this repo) | `@pramana/sdk` (npm) |
| JavaScript | [pramana-js-sdk](https://github.com/Emma-Leonhart/pramana-js-sdk) | `@pramana/sdk` (npm) |
| Java | [pramana-java-sdk](https://github.com/Emma-Leonhart/pramana-java-sdk) | `org.pramana:pramana-sdk` (Maven) |
| Rust | [pramana-rust-sdk](https://github.com/Emma-Leonhart/pramana-rust-sdk) | `pramana-sdk` (crates.io) |
| Go | [pramana-go-sdk](https://github.com/Emma-Leonhart/pramana-go-sdk) | `github.com/Emma-Leonhart/pramana-go-sdk` |

All SDKs implement the same core specification and must produce identical results for UUID v5 generation, canonical string normalization, and arithmetic operations.
