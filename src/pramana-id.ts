import { createHash } from 'crypto';

/** The Pramana namespace UUID used for deterministic UUID v5 generation. */
export const PRAMANA_NAMESPACE = 'a6613321-e9f6-4348-8f8b-29d2a3c86349';

/** Base URL for Pramana entity lookups. */
export const PRAMANA_BASE_URL = 'https://pramana.dev/entity/';

/**
 * Generates a UUID v5 (SHA-1 name-based) from a namespace UUID and a name string.
 * Follows RFC 4122 section 4.3.
 */
export function uuidV5(namespace: string, name: string): string {
  // Convert namespace UUID to 16 bytes
  const nsHex = namespace.replace(/-/g, '');
  const nsBytes = Buffer.from(nsHex, 'hex');

  // Concatenate with name bytes (UTF-8)
  const nameBytes = Buffer.from(name, 'utf-8');
  const data = Buffer.concat([nsBytes, nameBytes]);

  // SHA-1 hash
  const hash = createHash('sha1').update(data).digest();

  // Set version (5) and variant (RFC 4122)
  hash[6] = (hash[6] & 0x0f) | 0x50;
  hash[8] = (hash[8] & 0x3f) | 0x80;

  // Format as UUID string
  const hex = hash.subarray(0, 16).toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}

/**
 * Generates a Pramana ID (UUID v5) for a numeric value given its canonical key.
 */
export function pramanaNumId(key: string): string {
  return uuidV5(PRAMANA_NAMESPACE, key);
}
