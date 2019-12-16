// See default class values at bottom of this file, including `SFItemHistory.LargeEntryDeltaThreshold`.

import { SFItemHistoryEntry } from '@Models/session_history/itemHistoryEntry'

export class SFItemHistory {

  constructor(params = {}) {
    if(!this.entries) {
      this.entries = [];
    }

    // Deserialize the entries into entry objects.
    if(params.entries) {
      for(var entryParams of params.entries) {
        var entry = this.createEntryForItem(entryParams.item);
        entry.setPreviousEntry(this.getLastEntry());
        this.entries.push(entry);
      }
    }
  }

  createEntryForItem(item) {
    var historyItemClass = SFItemHistory.HistoryEntryClassMapping && SFItemHistory.HistoryEntryClassMapping[item.content_type];
    if(!historyItemClass) {
      historyItemClass = SFItemHistoryEntry;
    }
    var entry = new historyItemClass(item);
    return entry;
  }

  getLastEntry() {
    return this.entries[this.entries.length - 1]
  }

  addHistoryEntryForItem(item) {
    var prospectiveEntry = this.createEntryForItem(item);

    var previousEntry = this.getLastEntry();
    prospectiveEntry.setPreviousEntry(previousEntry);

    // Don't add first revision if text length is 0, as this means it's a new note.
    // Actually, nevermind. If we do this, the first character added to a new note
    // will be displayed as "1 characters loaded".
    // if(!previousRevision && prospectiveRevision.textCharDiffLength == 0) {
    //   return;
    // }

    // Don't add if text is the same
    if(prospectiveEntry.isSameAsEntry(previousEntry)) {
      return;
    }

    this.entries.push(prospectiveEntry);
    return prospectiveEntry;
  }

  clear() {
    this.entries.length = 0;
  }

  optimize() {
    var keepEntries = [];

    let isEntrySignificant = (entry) => {
      return entry.deltaSize() > SFItemHistory.LargeEntryDeltaThreshold;
    }

    let processEntry = (entry, index, keep) => {
      // Entries may be processed retrospectively, meaning it can be decided to be deleted, then an upcoming processing can change that.
      if(keep) {
        keepEntries.push(entry);
      } else {
        // Remove if in keep
        var index = keepEntries.indexOf(entry);
        if(index !== -1) {
          keepEntries.splice(index, 1);
        }
      }

      if(keep && isEntrySignificant(entry) && entry.operationVector() == -1) {
        // This is a large negative change. Hang on to the previous entry.
        var previousEntry = this.entries[index - 1];
        if(previousEntry) {
          keepEntries.push(previousEntry);
        }
      }
    }

    this.entries.forEach((entry, index) => {
      if(index == 0 || index == this.entries.length - 1) {
        // Keep the first and last
        processEntry(entry, index, true);
      } else {
        var significant = isEntrySignificant(entry);
        processEntry(entry, index, significant);
      }
    })

    this.entries = this.entries.filter((entry, index) => {
      return keepEntries.indexOf(entry) !== -1;
    })
  }
}

// The amount of characters added or removed that constitute a keepable entry after optimization.
SFItemHistory.LargeEntryDeltaThreshold = 15;
