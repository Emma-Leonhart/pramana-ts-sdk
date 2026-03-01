# Pramana TypeScript SDK - Implementation Guide

**Package name:** `@pramana/sdk` (npm)
**Minimum runtime:** Node 18+ / ES2020+
**Reference implementation:** [PramanaLib (C#)](https://github.com/Emma-Leonhart/PramanaLib)

---

## 1. Project Structure

```
pramana-ts-sdk/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── vitest.config.ts
├── src/
│   ├── index.ts                    # Public API barrel export
│   ├── gaussian-rational.ts        # GaussianRational implementation
│   ├── pramana-id.ts               # UUID v5 generation utilities
│   ├── item.ts                     # PramanaItem base class
│   ├── entity.ts                   # PramanaEntity
│   ├── property.ts                 # PramanaProperty
│   ├── proposition.ts              # PramanaProposition
│   ├── sense.ts                    # PramanaSense
│   ├── types.ts                    # Shared type definitions and enums
│   ├── orm/
│   │   ├── index.ts
│   │   ├── decorators.ts           # @PramanaEntity, @PramanaProperty decorators
│   │   ├── config.ts               # PramanaConfig interface
│   │   ├── query-builder.ts        # Fluent query builder
│   │   └── field-mapping.ts        # Field-to-proposition mapping
│   ├── datasources/
│   │   ├── index.ts
│   │   ├── pra-file.ts             # .pra JSON file reader
│   │   ├── sparql.ts               # GraphDB SPARQL connector
│   │   ├── rest-api.ts             # Pramana REST API connector
│   │   └── sqlite.ts               # SQLite export reader
│   └── structs/
│       ├── index.ts
│       ├── pramana-date.ts         # date: pseudo-class
│       ├── pramana-time.ts         # time: pseudo-class
│       ├── pramana-interval.ts     # interval: pseudo-class
│       ├── coordinate.ts           # coord: pseudo-class
│       └── chemical.ts             # chem: / element: pseudo-classes
├── tests/
│   ├── gaussian-rational.test.ts
│   ├── pramana-id.test.ts
│   ├── item-model.test.ts
│   ├── orm.test.ts
│   ├── serialization.test.ts
│   └── test-vectors.json           # Cross-language test vectors
└── docs/
    └── api.md
```

## 2. Build & Packaging

### package.json

```json
{
  "name": "@pramana/sdk",
  "version": "0.1.0",
  "description": "TypeScript SDK for the Pramana knowledge graph",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": ["dist"],
  "engines": {
    "node": ">=18"
  },
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.4",
    "vitest": "^1.0",
    "eslint": "^9.0",
    "@types/node": "^20"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "bigint": true
  },
  "include": ["src/**/*"]
}
```

### Key decisions:
- **ESM-only** — no CommonJS dual-build
- **Zero runtime dependencies** for core
- **Native `bigint`** — no polyfill needed (ES2020+)
- **Vitest** for testing (fast, ESM-native)
- **TC39 decorators** for ORM mapping (Stage 3+)

## 3. GaussianRational (Gauss) Implementation

> **Naming convention:** The standard short name for a Gaussian rational is **`Gauss`**. When referring specifically to a Gaussian integer (both denominators are 1), the standard short name is **`Gint`**.

### 3.1 Class Design

TypeScript has native `bigint` with arbitrary precision. No operator overloading is available, so named methods are used.

```typescript
export class GaussianRational {
  readonly a: bigint; // real numerator
  readonly b: bigint; // real denominator (positive, nonzero)
  readonly c: bigint; // imaginary numerator
  readonly d: bigint; // imaginary denominator (positive, nonzero)

  constructor(a: bigint | number, b: bigint | number, c: bigint | number, d: bigint | number) {
    const ba = BigInt(a), bb = BigInt(b), bc = BigInt(c), bd = BigInt(d);
    if (bb <= 0n || bd <= 0n) {
      throw new Error("Denominators must be positive integers");
    }
    // Normalize to canonical form
    const gReal = gcd(abs(ba), bb);
    const gImag = gcd(abs(bc), bd);
    this.a = ba / gReal;
    this.b = bb / gReal;
    this.c = bc / gImag;
    this.d = bd / gImag;
    Object.freeze(this);
  }
}
```

### 3.2 Static Constructors

```typescript
  static fromInt(value: bigint | number): GaussianRational {
    return new GaussianRational(value, 1, 0, 1);
  }

  static fromComplex(real: bigint | number, imag: bigint | number): GaussianRational {
    return new GaussianRational(real, 1, imag, 1);
  }

  static parse(s: string): GaussianRational {
    const normalized = s.startsWith("num:") ? s.slice(4) : s;
    const parts = normalized.split(",");
    if (parts.length !== 4) throw new Error(`Expected 4 comma-separated values: ${s}`);
    return new GaussianRational(
      BigInt(parts[0]), BigInt(parts[1]),
      BigInt(parts[2]), BigInt(parts[3])
    );
  }
```

### 3.3 Arithmetic Methods (No Operator Overloading)

TypeScript/JavaScript do not support operator overloading. All arithmetic uses named methods:

```typescript
  add(other: GaussianRational): GaussianRational {
    const realNum = this.a * other.b + other.a * this.b;
    const realDen = this.b * other.b;
    const imagNum = this.c * other.d + other.c * this.d;
    const imagDen = this.d * other.d;
    return new GaussianRational(realNum, realDen, imagNum, imagDen);
  }

  sub(other: GaussianRational): GaussianRational { ... }
  neg(): GaussianRational { ... }

  mul(other: GaussianRational): GaussianRational {
    // (a+bi)(c+di) = (ac-bd) + (ad+bc)i
    // Using rational components:
    // real = (a1/b1)*(a2/b2) - (c1/d1)*(c2/d2)
    // imag = (a1/b1)*(c2/d2) + (c1/d1)*(a2/b2)
    ...
  }

  div(other: GaussianRational): GaussianRational {
    // Multiply by conjugate, then divide
    ...
  }

  mod(other: GaussianRational): GaussianRational {
    // Real-only; throw for complex
    if (!this.isReal || !other.isReal) throw new Error("Modulo only defined for real values");
    ...
  }

  pow(exp: number): GaussianRational {
    // Integer exponents only
    ...
  }
```

### 3.4 Comparison Methods

```typescript
  eq(other: GaussianRational): boolean {
    return this.a === other.a && this.b === other.b
        && this.c === other.c && this.d === other.d;
  }

  lt(other: GaussianRational): boolean {
    if (!this.isReal || !other.isReal) throw new Error("Ordering only for real values");
    // Compare a1/b1 < a2/b2 via cross-multiplication
    return this.a * other.b < other.a * this.b;
  }

  gt(other: GaussianRational): boolean { ... }
  lte(other: GaussianRational): boolean { ... }
  gte(other: GaussianRational): boolean { ... }
  compareTo(other: GaussianRational): -1 | 0 | 1 { ... }
```

### 3.5 Properties

```typescript
  get isReal(): boolean { return this.c === 0n; }
  get isInteger(): boolean { return this.isReal && this.b === 1n; }
  get isGaussianInteger(): boolean { return this.b === 1n && this.d === 1n; }
  get isZero(): boolean { return this.a === 0n && this.c === 0n; }
  get isPositive(): boolean { return this.isReal && this.a > 0n; }
  get isNegative(): boolean { return this.isReal && this.a < 0n; }

  get conjugate(): GaussianRational {
    return new GaussianRational(this.a, this.b, -this.c, this.d);
  }

  get magnitudeSquared(): GaussianRational { ... }
  get realPart(): GaussianRational { return new GaussianRational(this.a, this.b, 0n, 1n); }
  get imaginaryPart(): GaussianRational { return new GaussianRational(this.c, this.d, 0n, 1n); }
  get reciprocal(): GaussianRational { ... }

  classify(): NumberType { ... }
```

### 3.6 Pramana ID (UUID v5)

```typescript
import { createHash } from 'crypto';

const NUM_NAMESPACE = "a6613321-e9f6-4348-8f8b-29d2a3c86349";

function uuidV5(namespace: string, name: string): string {
  // 1. Convert namespace UUID to 16 bytes
  const nsBytes = Buffer.from(namespace.replace(/-/g, ''), 'hex');
  // 2. Concatenate with name bytes (UTF-8)
  const nameBytes = Buffer.from(name, 'utf-8');
  const data = Buffer.concat([nsBytes, nameBytes]);
  // 3. SHA-1 hash
  const hash = createHash('sha1').update(data).digest();
  // 4. Set version (5) and variant (RFC 4122)
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;
  // 5. Format as UUID string
  const hex = hash.subarray(0, 16).toString('hex');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20,32)}`;
}

// On GaussianRational:
get canonical(): string {
  return `num:${this.a},${this.b},${this.c},${this.d}`;
}

get pramanaId(): string {
  return uuidV5(NUM_NAMESPACE, this.canonical);
}

get pramanaUri(): string {
  return `pra:${this.pramanaId}`;
}
```

Node.js `crypto` module provides SHA-1 natively. For browser environments, the Web Crypto API (`crypto.subtle.digest`) can be used as a fallback with an async variant.

### 3.7 Formatting

```typescript
  toMixed(): string { ... }      // "3 & 1/2 + 3/4 i"
  toImproper(): string { ... }   // "7/2 + 3/4 i"
  toRaw(): string { ... }        // "<7,2,3,4>"
  toString(): string { return this.canonical; }

  toJSON(): string { return this.canonical; }
```

### 3.8 Intentionally Unsupported

```typescript
  magnitude(): never {
    throw new Error("Complex magnitude produces irrationals. Use magnitudeSquared for exact result.");
  }
  // phase, toPolar, sqrt — same treatment
```

## 4. Item Model

### 4.1 Type Definitions

```typescript
export enum ItemType {
  Entity = "Entity",
  Property = "Property",
  Proposition = "Proposition",
  Sense = "Sense",
  Evidence = "Evidence",
  StanceLink = "StanceLink",
}

export interface PramanaItem {
  readonly uuid: string;
  readonly type: ItemType;
  readonly properties: Record<string, unknown>;
  readonly edges: Record<string, string>;  // UUID strings
}
```

### 4.2 Typed Interfaces and Classes

```typescript
export interface PramanaEntity extends PramanaItem {
  readonly type: ItemType.Entity;
  readonly label: string;
  instanceOf(): PramanaEntity | null;    // lazy resolution
  subclassOf(): PramanaEntity | null;
  propositions(): PramanaProposition[];
  senses(): PramanaSense[];
}

export interface PramanaProperty extends PramanaItem {
  readonly type: ItemType.Property;
  readonly label: string;
  readonly datatype: string;
  readonly formatterUrl?: string;
  readonly description?: string;
}
```

### 4.3 JSON Serialization

```typescript
export class PramanaGraph {
  static fromFile(path: string): PramanaGraph {
    const data = JSON.parse(readFileSync(path, 'utf-8'));
    ...
  }

  static fromJSON(json: unknown): PramanaGraph { ... }
  toJSON(): object { ... }
  toFile(path: string): void { ... }
}
```

## 5. ORM-Style Mapping

### 5.1 TypeScript Decorators

Using TC39 Stage 3 decorators (TypeScript 5.0+):

```typescript
@PramanaEntity({ instanceOf: "uuid-of-shinto-shrine-class" })
class ShintoShrine {
  @PramanaProperty("coordinates")
  coordinates?: Coordinate;

  @PramanaProperty("Wikidata ID")
  wikidataId?: string;

  @PramanaProperty("part of")
  partOf?: ShintoShrine;

  @ComputedProperty("age")
  get age(): number {
    return Math.floor((Date.now() - this.dateOfBirth.getTime()) / (365.25 * 86400000));
  }
}
```

### 5.2 Decorator Implementation

```typescript
const entityRegistry = new Map<string, EntityMetadata>();

function PramanaEntity(options: { instanceOf: string }) {
  return function <T extends new (...args: any[]) => any>(target: T) {
    entityRegistry.set(options.instanceOf, {
      constructor: target,
      fields: getFieldMetadata(target),
    });
    return target;
  };
}

function PramanaProperty(propertyName: string) {
  return function (target: any, propertyKey: string) {
    const fields = Reflect.getMetadata("pramana:fields", target.constructor) ?? [];
    fields.push({ fieldName: propertyKey, propertyName });
    Reflect.defineMetadata("pramana:fields", fields, target.constructor);
  };
}
```

### 5.3 Query Builder (Fluent API)

```typescript
const shrines = await pramana.query(ShintoShrine)
  .where(s => s.coordinates !== null)
  .limit(100)
  .all();

const water = await pramana.getById<ChemicalCompound>(
  "00000007-0000-4000-8000-000000000007"
);
```

### 5.4 Configuration

```typescript
interface PramanaConfig {
  flattenDepth: number;       // default: 3
  lazyResolve: boolean;       // default: true
  includeProvenance: boolean;  // default: false
}

const config: PramanaConfig = {
  flattenDepth: 3,
  lazyResolve: true,
  includeProvenance: false,
};
```

## 6. Data Sources

| Source | Module | Extra dependency |
|--------|--------|-----------------|
| `.pra` JSON file | `datasources/pra-file` | None |
| GraphDB SPARQL | `datasources/sparql` | None (fetch API) |
| Pramana REST API | `datasources/rest-api` | None (fetch API) |
| SQLite export | `datasources/sqlite` | `better-sqlite3` |

Node 18+ has native `fetch`, so SPARQL and REST API connectors need no external HTTP library.

## 7. Struct Pseudo-Classes

| Pseudo-class | TypeScript type | Mapping strategy |
|-------------|-----------------|-----------------|
| `num:` | `GaussianRational` | Custom class (see above) |
| `date:` | `PramanaDate` | Wrapper around `Date` with `pramanaId` |
| `time:` | `PramanaTime` | Custom class (hours, minutes, seconds) |
| `interval:` | `PramanaInterval` | `{ start: Date, end: Date }` with `pramanaId` |
| `coord:` | `Coordinate` | `{ lat: number, lon: number }` with `pramanaId` |
| `chem:` | `ChemicalIdentifier` | InChI string wrapper with `pramanaId` |
| `element:` | `ChemicalElement` | Atomic number wrapper with `pramanaId` |

## 8. TypeScript-Specific Considerations

### 8.1 bigint Serialization
`bigint` values cannot be directly serialized to JSON. Custom `toJSON()` methods and `JSON.parse` revivers are needed:

```typescript
// GaussianRational implements custom toJSON
toJSON(): { a: string; b: string; c: string; d: string } {
  return {
    a: this.a.toString(),
    b: this.b.toString(),
    c: this.c.toString(),
    d: this.d.toString(),
  };
}
```

### 8.2 Immutability
All value types use `Object.freeze()` in constructors and `readonly` modifiers on all properties. This matches the spec's requirement for normalized canonical forms.

### 8.3 Browser vs Node
- **Core** (GaussianRational, item model): Works in both browser and Node
- **UUID v5**: Use `crypto` module in Node, `crypto.subtle` in browser (async)
- **File I/O**: Node-only (`.pra` file reading)
- **SPARQL/REST**: Works in both (native `fetch`)

### 8.4 No Operator Overloading
This is the biggest ergonomic difference from C#/Python/Rust. Method chaining helps:

```typescript
// Instead of: result = a + b * c
const result = a.add(b.mul(c));
```

## 9. Testing Strategy

- **Vitest** as test runner (ESM-native, fast)
- **Cross-language test vectors** from `tests/test-vectors.json`
- Test categories match the spec phases

```bash
npm test          # Run all tests
npm run typecheck # Type checking only
npm run lint      # Linting
```

## 10. Implementation Priority

### Phase 1 - GaussianRational (core)
1. Implement `GaussianRational` class with bigint components and `Object.freeze()`
2. Implement all arithmetic methods (`add`, `sub`, `mul`, `div`, `mod`, `pow`)
3. Implement comparison methods (`eq`, `lt`, `gt`, `lte`, `gte`, `compareTo`)
4. Implement UUID v5 generation using Node `crypto`
5. Implement `parse()`, formatting methods, and `classify()`
6. Write test suite against cross-language test vectors

### Phase 2 - Base Item Model
1. Define TypeScript interfaces for all item types
2. Implement `PramanaGraph` with JSON serialization
3. Implement `.pra` file reader

### Phase 3 - ORM Mapping
1. Implement decorators (`@PramanaEntity`, `@PramanaProperty`, `@ComputedProperty`)
2. Implement fluent query builder
3. Implement `PramanaConfig`

### Phase 4 - Data Sources & Provenance
1. SPARQL connector (native fetch)
2. REST API connector (native fetch)
3. Provenance metadata on fields

### Phase 5 - Pseudo-Classes
1. `PramanaDate`, `PramanaTime`, `PramanaInterval` wrappers
2. `Coordinate` struct
3. `ChemicalIdentifier` / `ChemicalElement` wrappers

## 11. Helper Utilities

### GCD for bigint

```typescript
function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
}

function abs(n: bigint): bigint {
  return n < 0n ? -n : n;
}
```

These are needed because `Math.abs()` and other `Math` functions don't work with `bigint`.
