import { ItemHistory } from '@Services/history/item_history';

/** The amount of revisions which above, call for an optimization. */
const DEFAULT_ITEM_REVISIONS_THRESHOLD = 60;

/**
 * HistorySession is the only object in the session history domain that is
 * persistable. A history session contains one main content object: the
 * itemUUIDToItemHistoryMapping. This is a dictionary whose keys are item uuids,
 * and each value is an ItemHistory object.
 *
 * Each ItemHistory object contains an array called `entries` which contain
 * `ItemHistory` (or subclasses thereof) entries.
 */
export class HistorySession {

  constructor(raw) {
    Object.assign(this, raw);

    if(!this.content) {
      this.content = {};
    }

    if(!this.content.itemUUIDToItemHistoryMapping) {
      this.content.itemUUIDToItemHistoryMapping = {};
    }

    const uuids = Object.keys(this.content.itemUUIDToItemHistoryMapping);
    uuids.forEach((itemUUID) => {
      const itemHistory = this.content.itemUUIDToItemHistoryMapping[itemUUID];
      this.content.itemUUIDToItemHistoryMapping[itemUUID] =
        new ItemHistory(itemHistory);
    });

    this.setItemRevisionThreshold(DEFAULT_ITEM_REVISIONS_THRESHOLD);
  }

  addEntryForItem(item) {
    const itemHistory = this.historyForItem(item);
    return itemHistory.addHistoryEntryForItem(item);
  }

  historyForItem(item) {
    let history = this.content.itemUUIDToItemHistoryMapping[item.uuid];
    if(!history) {
      history = new ItemHistory();
      this.content.itemUUIDToItemHistoryMapping[item.uuid] = history;
    }
    return history;
  }

  clearItemHistory(item) {
    this.historyForItem(item).clear();
  }

  clearAllHistory() {
    this.content.itemUUIDToItemHistoryMapping = {};
  }

  setItemRevisionThreshold(threshold) {
    this.itemRevisionThreshold = threshold;
  }

  optimizeHistoryForItem(item) {
    /**
     * Clean up if there are too many revisions. Note itemRevisionThreshold
     * is the amount of revisions which above, call for an optimization. An
     * optimization may not remove entries above this threshold. It will
     * determine what it should keep and what it shouldn't. So, it is possible
     * to have a threshold of 60 but have 600 entries, if the item history deems
     * those worth keeping.
     */
    const itemHistory = this.historyForItem(item);
    if(itemHistory.entries.length > this.itemRevisionThreshold) {
      itemHistory.optimize();
    }
  }
}
