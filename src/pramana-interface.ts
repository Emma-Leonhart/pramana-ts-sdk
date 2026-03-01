import type { PramanaRole } from './pramana-role.js';

/**
 * Interface that all Pramana-mapped objects implement, providing
 * access to the ontology roles (interfaces) the object participates in.
 */
export interface PramanaInterface {
  /** Returns the PramanaRole instances that this object fulfils within the Pramana ontology. */
  getRoles(): PramanaRole[];
}
