import { describe, it, expect } from 'vitest';
import { uuidV5, PRAMANA_NAMESPACE } from '../src/pramana-id.js';

describe('uuidV5', () => {
  it('generates a valid UUID v5 format', () => {
    const result = uuidV5(PRAMANA_NAMESPACE, 'test');
    expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('is deterministic', () => {
    const a = uuidV5(PRAMANA_NAMESPACE, 'hello');
    const b = uuidV5(PRAMANA_NAMESPACE, 'hello');
    expect(a).toBe(b);
  });

  it('different names produce different UUIDs', () => {
    const a = uuidV5(PRAMANA_NAMESPACE, 'hello');
    const b = uuidV5(PRAMANA_NAMESPACE, 'world');
    expect(a).not.toBe(b);
  });

  it('version byte is set to 5', () => {
    const result = uuidV5(PRAMANA_NAMESPACE, 'test');
    expect(result[14]).toBe('5');
  });
});
