/**
 * Interface for objects that can be linked to entities in the Pramana knowledge graph.
 * Provides identity and URL properties for graph integration.
 */
export interface IPramanaLinkable {
  /** The UUID (v4 or v5) identifying this entity in the Pramana graph. */
  readonly pramanaGuid: string;

  /**
   * The Pramana identifier string (e.g. "pra:num:3,1,2,1").
   * May be null for objects that are not pseudo-class instances.
   */
  readonly pramanaId: string | null;

  /**
   * The Pramana entity URL using the hashed UUID,
   * e.g. "https://pramana.dev/entity/{pramanaGuid}".
   */
  readonly pramanaHashUrl: string;

  /**
   * The Pramana entity URL. For pseudo-class instances this uses the
   * pramanaId string; otherwise it falls back to pramanaHashUrl.
   */
  readonly pramanaUrl: string;
}
