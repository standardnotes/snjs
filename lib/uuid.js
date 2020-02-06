import { isNullOrUndefined } from '@Lib/utils';

export class Uuid {
  /**
   * Dynamically feed both a syncronous and asyncronous implementation of a UUID generator function.
   * Feeding it this way allows platforms to implement their own uuid generation schemes, without
   * this class having to import any global functions.
   * @param syncImpl  A syncronous function that returns a UUID.
   * @param asyncImpl  An asyncronous function that returns a UUID.
   */
  static SetGenerators({ syncImpl, asyncImpl }) {
    this.syncUuidFunc = syncImpl;
    this.asyncUuidFunc = asyncImpl;
  }

  static canGenSync() {
    return !isNullOrUndefined(this.syncUuidFunc);
  }

  /**
   * A default async implementation of uuid generation.
   */
  static async GenerateUuid() {
    if (this.syncUuidFunc) {
      return this.syncUuidFunc();
    } else {
      return this.asyncUuidFunc();
    }
  }

  /**
   * A default sync implementation of uuid generation.
   */
  static GenerateUuidSynchronously() {
    return this.syncUuidFunc();
  }
}