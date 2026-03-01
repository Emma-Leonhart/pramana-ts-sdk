/**
 * Exception thrown when a Pramana OGM constraint is violated,
 * such as attempting to assign an ID to an object that already has one.
 */
export class PramanaException extends Error {
  constructor(message?: string) {
    super(message);
    this.name = 'PramanaException';
  }
}
