# pramana-ts-sdk

TypeScript SDK for the [Pramana](https://pramana-data.ca) knowledge graph. Provides exact-arithmetic value types, item model mapping, and data source connectors for working with Pramana data in TypeScript.

## Status

**Pre-implementation** - Project structure and implementation plan documented. See [IMPLEMENTATION.md](IMPLEMENTATION.md) for the full design.

## Key Features (Planned)

- **GaussianRational** (standard short name: **Gauss**; Gaussian integers: **Gint**) - Exact complex rational arithmetic (`a/b + (c/d)i`) with native `bigint`
- **Deterministic Pramana IDs** - UUID v5 generation matching the canonical Pramana web app
- **Full type safety** - Strict TypeScript with complete `.d.ts` declarations
- **ORM-style entity mapping** - TC39 decorators with proposition-backed fields
- **Multiple data sources** - `.pra` files, SPARQL, REST API

## Installation (Future)

```bash
npm install @pramana/sdk
```

## Quick Example (Planned API)

```typescript
import { GaussianRational } from '@pramana/sdk';

const half = new GaussianRational(1n, 2n, 0n, 1n);   // 1/2
const third = new GaussianRational(1n, 3n, 0n, 1n);  // 1/3
const result = half.add(third);                        // 5/6

console.log(result.pramanaId);  // deterministic UUID v5
```

## Documentation

- [General SDK Specification](08_SDK_LIBRARY_SPECIFICATION.md) - Cross-language design spec
- [TypeScript Implementation Guide](IMPLEMENTATION.md) - TypeScript-specific implementation details

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
