import { describe, it, expect } from 'vitest';
import { PramanaRole } from '../src/pramana-role.js';
import { PramanaObject, EMPTY_GUID } from '../src/pramana-object.js';
import { PramanaException } from '../src/pramana-exception.js';

describe('PramanaRole', () => {
  it('constructor sets label', () => {
    const role = new PramanaRole('Entity');
    expect(role.label).toBe('Entity');
  });

  it('constructor with id sets GUID', () => {
    const id = '12345678-1234-4234-8234-123456789abc';
    const role = new PramanaRole('Entity', id);
    expect(role.pramanaGuid).toBe(id);
  });

  it('constructor without id has empty GUID', () => {
    const role = new PramanaRole('Entity');
    expect(role.pramanaGuid).toBe(EMPTY_GUID);
  });

  it('is a PramanaObject', () => {
    const role = new PramanaRole('Entity');
    expect(role).toBeInstanceOf(PramanaObject);
  });

  it('getRoles returns self', () => {
    const role = new PramanaRole('Entity');
    const roles = role.getRoles();
    expect(roles).toHaveLength(1);
    expect(roles[0]).toBe(role);
  });

  it('parentRoles initially empty', () => {
    const role = new PramanaRole('Entity');
    expect(role.parentRoles).toEqual([]);
  });

  it('childRoles initially empty', () => {
    const role = new PramanaRole('Entity');
    expect(role.childRoles).toEqual([]);
  });

  it('instanceOf defaults to null', () => {
    const role = new PramanaRole('Entity');
    expect(role.instanceOf).toBeNull();
  });

  it('subclassOf defaults to null', () => {
    const role = new PramanaRole('Entity');
    expect(role.subclassOf).toBeNull();
  });

  it('can build role hierarchy', () => {
    const parent = new PramanaRole('Thing');
    const child = new PramanaRole('Person');
    child.subclassOf = parent;
    parent.childRoles.push(child);
    child.parentRoles.push(parent);

    expect(child.subclassOf).toBe(parent);
    expect(parent.childRoles).toContain(child);
    expect(child.parentRoles).toContain(parent);
  });

  it('instanceOf can be set', () => {
    const classRole = new PramanaRole('Class');
    const instance = new PramanaRole('MyClass');
    instance.instanceOf = classRole;

    expect(instance.instanceOf).toBe(classRole);
  });

  it('generateId works on role', () => {
    const role = new PramanaRole('Entity');
    role.generateId();
    expect(role.pramanaGuid).not.toBe(EMPTY_GUID);
  });
});
