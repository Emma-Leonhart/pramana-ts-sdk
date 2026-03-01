import { randomUUID } from 'crypto';
import type { IPramanaLinkable } from './pramana-linkable.js';
import type { PramanaInterface } from './pramana-interface.js';
import type { PramanaRole } from './pramana-role.js';
import { PramanaException } from './pramana-exception.js';

const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

/**
 * Base class for all objects mapped into the Pramana knowledge graph.
 * Implements IPramanaLinkable for graph identity and
 * PramanaInterface for ontology role participation.
 *
 * **Friction by design:** IDs are never auto-generated. A new
 * PramanaObject starts with an empty GUID and only receives
 * a real UUID v4 when generateId() is explicitly called. This
 * prevents disposable or transient objects from polluting the graph with
 * throw-away identifiers. Once assigned, the ID is immutable — calling
 * generateId() a second time throws PramanaException.
 */
export class PramanaObject implements IPramanaLinkable, PramanaInterface {
  private _pramanaGuid: string;

  /** The well-known root ID for the PramanaObject class itself in the ontology. */
  static readonly ROOT_ID = '10000000-0000-4000-8000-000000000001';

  /** The class-level ID, which for PramanaObject is ROOT_ID. */
  static readonly CLASS_ID: string = PramanaObject.ROOT_ID;

  /** The class-level URL in the Pramana graph. */
  static get classUrl(): string {
    return `https://pramana.dev/entity/${PramanaObject.CLASS_ID}`;
  }

  /**
   * Creates a new PramanaObject.
   * @param id Optional initial UUID string. If omitted, the object starts
   * with an empty GUID and must be explicitly activated via generateId().
   */
  constructor(id?: string) {
    this._pramanaGuid = id ?? EMPTY_GUID;
  }

  get pramanaGuid(): string {
    return this._pramanaGuid;
  }

  /**
   * The Pramana identifier string. Regular objects do not belong to a
   * pseudo-class, so this returns null.
   */
  get pramanaId(): string | null {
    return null;
  }

  get pramanaHashUrl(): string {
    return `https://pramana.dev/entity/${this._pramanaGuid}`;
  }

  get pramanaUrl(): string {
    return this.pramanaHashUrl;
  }

  /**
   * Assigns a new UUID v4 to this object. Throws PramanaException
   * if the object already has a non-empty ID — IDs are write-once by design.
   */
  generateId(): void {
    if (this._pramanaGuid === EMPTY_GUID) {
      this._pramanaGuid = randomUUID();
    } else {
      throw new PramanaException('Cannot reassign a PramanaObject ID once it has been set.');
    }
  }

  getRoles(): PramanaRole[] {
    return [];
  }
}

export { EMPTY_GUID };
