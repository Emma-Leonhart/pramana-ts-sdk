import { PramanaObject } from './pramana-object.js';

/**
 * A minimal subclass of PramanaObject used for testing
 * the Pramana OGM class hierarchy.
 */
export class PramanaParticular extends PramanaObject {
  /** The well-known class ID for PramanaParticular in the ontology. */
  static readonly CLASS_ID = '13000000-0000-4000-8000-000000000004';

  /** The class-level URL in the Pramana graph. */
  static get classUrl(): string {
    return `https://pramana.dev/entity/${PramanaParticular.CLASS_ID}`;
  }

  constructor(id?: string) {
    super(id);
  }
}
