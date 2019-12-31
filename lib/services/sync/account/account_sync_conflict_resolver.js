export const SYNC_CONFLICT_TYPE_CONFLICTING_DATA = 'sync_conflict';
export const SYNC_CONFLICT_TYPE_UUID_CONFLICT = 'uuid_conflict';

export class AccountSyncConflictResolver {
  constructor({
    conflict,
    itemsOfInterest
  }) {
    this.conflict = conflict;
    this.itemsOfInterest = itemsOfInterest;
  }

  async run() {
    if(this.conflict.type === SYNC_CONFLICT_TYPE_CONFLICTING_DATA) {
      return this.handleConflictingData();
    } else if(this.conflict.type === SYNC_CONFLICT_TYPE_UUID_CONFLICT) {
      return this.handleConflictingUuid();
    } else  {
      throw `Unhandled sync conflict type ${this.conflict.type}`;
    }
  }

  async handleConflictingData() {

  }

  async handleConflictingUuid() {

  }
}
