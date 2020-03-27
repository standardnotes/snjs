import { CreateHistoryEntryForItem } from './functions';
/**
 * The amount of characters added or removed that
 * constitute a keepable entry after optimization.
 */
const LARGE_ENTRY_DELTA_THRESHOLD = 15;

export class ItemHistory {
  constructor(params = {}) {
    if (!this.entries) {
      this.entries = [];
    }
    /** Deserialize the entries into entry objects. */
    if (params.entries) {
      for (const entryParams of params.entries) {
        const entry = this.createEntryForItem(entryParams.item);
        entry.setPreviousEntry(this.getLastEntry());
        this.entries.push(entry);
      }
    }
  }

  createEntryForItem(item) {
    return CreateHistoryEntryForItem(item);
  }

  getLastEntry() {
    return this.entries[this.entries.length - 1];
  }

  addHistoryEntryForItem(item) {
    const prospectiveEntry = this.createEntryForItem(item);
    const previousEntry = this.getLastEntry();
    prospectiveEntry.setPreviousEntry(previousEntry);
    if (prospectiveEntry.isSameAsEntry(previousEntry)) {
      return;
    }
    this.entries.push(prospectiveEntry);
    return prospectiveEntry;
  }

  clear() {
    this.entries.length = 0;
  }

  optimize() {
    const keepEntries = [];
    const isEntrySignificant = (entry) => {
      return entry.deltaSize() > LARGE_ENTRY_DELTA_THRESHOLD;
    };
    const processEntry = (entry, index, keep) => {
      /**
       * Entries may be processed retrospectively, meaning it can be
       * decided to be deleted, then an upcoming processing can change that.
       */
      if (keep) {
        keepEntries.push(entry);
      } else {
        /** Remove if in keep */
        const index = keepEntries.indexOf(entry);
        if (index !== -1) {
          keepEntries.splice(index, 1);
        }
      }
      if (keep && isEntrySignificant(entry) && entry.operationVector() === -1) {
        /** This is a large negative change. Hang on to the previous entry. */
        const previousEntry = this.entries[index - 1];
        if (previousEntry) {
          keepEntries.push(previousEntry);
        }
      }
    };
    this.entries.forEach((entry, index) => {
      if (index === 0 || index === this.entries.length - 1) {
        /** Keep the first and last */
        processEntry(entry, index, true);
      } else {
        const significant = isEntrySignificant(entry);
        processEntry(entry, index, significant);
      }
    });
    this.entries = this.entries.filter((entry, index) => {
      return keepEntries.indexOf(entry) !== -1;
    });
  }
}
