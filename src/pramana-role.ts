import { PramanaObject } from './pramana-object.js';

/**
 * Represents a role (interface) in the Pramana ontology.
 * Roles form a hierarchy via subclassOf and instanceOf,
 * and track their position in the role graph through
 * parentRoles and childRoles.
 */
export class PramanaRole extends PramanaObject {
  /** Human-readable name for this role. */
  label: string;

  /** The role that this role is an instance of. */
  instanceOf: PramanaRole | null = null;

  /** The role that this role is a subclass of. */
  subclassOf: PramanaRole | null = null;

  /** The parent roles of this role in the hierarchy. */
  readonly parentRoles: PramanaRole[] = [];

  /** The child roles of this role in the hierarchy. */
  readonly childRoles: PramanaRole[] = [];

  /**
   * Creates a new PramanaRole with the given label.
   * @param label Human-readable name for this role.
   * @param id Optional initial UUID string.
   */
  constructor(label: string, id?: string) {
    super(id);
    this.label = label;
  }

  override getRoles(): PramanaRole[] {
    return [this];
  }
}
