import { describe, it, expect } from 'vitest';
import { PramanaObject, EMPTY_GUID } from '../src/pramana-object.js';
import { PramanaException } from '../src/pramana-exception.js';

describe('PramanaObject', () => {
  it('default constructor has empty GUID', () => {
    const obj = new PramanaObject();
    expect(obj.pramanaGuid).toBe(EMPTY_GUID);
  });

  it('constructor with id sets GUID', () => {
    const id = '12345678-1234-4234-8234-123456789abc';
    const obj = new PramanaObject(id);
    expect(obj.pramanaGuid).toBe(id);
  });

  it('generateId assigns non-empty GUID', () => {
    const obj = new PramanaObject();
    obj.generateId();
    expect(obj.pramanaGuid).not.toBe(EMPTY_GUID);
  });

  it('generateId throws on second call', () => {
    const obj = new PramanaObject();
    obj.generateId();
    expect(() => obj.generateId()).toThrow(PramanaException);
  });

  it('generateId throws when constructed with id', () => {
    const obj = new PramanaObject('12345678-1234-4234-8234-123456789abc');
    expect(() => obj.generateId()).toThrow(PramanaException);
  });

  it('pramanaId is null for regular object', () => {
    const obj = new PramanaObject();
    expect(obj.pramanaId).toBeNull();
  });

  it('pramanaHashUrl contains GUID', () => {
    const id = '12345678-1234-4234-8234-123456789abc';
    const obj = new PramanaObject(id);
    expect(obj.pramanaHashUrl).toBe(`https://pramana.dev/entity/${id}`);
  });

  it('pramanaUrl equals pramanaHashUrl for regular object', () => {
    const obj = new PramanaObject('12345678-1234-4234-8234-123456789abc');
    expect(obj.pramanaUrl).toBe(obj.pramanaHashUrl);
  });

  it('CLASS_ID equals ROOT_ID', () => {
    expect(PramanaObject.CLASS_ID).toBe(PramanaObject.ROOT_ID);
  });

  it('ROOT_ID has expected value', () => {
    expect(PramanaObject.ROOT_ID).toBe('10000000-0000-4000-8000-000000000001');
  });

  it('classUrl uses CLASS_ID', () => {
    expect(PramanaObject.classUrl).toBe(`https://pramana.dev/entity/${PramanaObject.CLASS_ID}`);
  });

  it('getRoles returns empty by default', () => {
    const obj = new PramanaObject();
    expect(obj.getRoles()).toEqual([]);
  });
});
