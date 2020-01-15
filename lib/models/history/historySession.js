/**
 * SFHistorySession is the only object in the session history domain that is
 * persistable. A history session contains one main content object: the
 * itemUUIDToItemHistoryMapping. This is a dictionary whose keys are item uuids,
 * and each value is an SFItemHistory object.

 * Each SFItemHistory object contains an array called `entires` which contain
 * `SFItemHistory` entries or subclasses, if the `SFItemHistory.HistoryEntryClassMapping`
 * class property value is set.
 */

import { SFItem } from '@Models/core/item'
import { SFItemHistory } from '@Models/history/itemHistory'

export class SFHistorySession extends SFItem {

  constructor(payload) {
    SFHistorySession.LargeItemEntryAmountThreshold = 60;
    super(payload);

    if(!this.content.itemUUIDToItemHistoryMapping) {
      this.content.itemUUIDToItemHistoryMapping = {};
    }

    const uuids = Object.keys(this.content.itemUUIDToItemHistoryMapping);
    uuids.forEach((itemUUID) => {
      const itemHistory = this.content.itemUUIDToItemHistoryMapping[itemUUID];
      this.content.itemUUIDToItemHistoryMapping[itemUUID] = new SFItemHistory(itemHistory);
    });
  }

  addEntryForItem(item) {
    const itemHistory = this.historyForItem(item);
    return itemHistory.addHistoryEntryForItem(item);
  }

  historyForItem(item) {
    let history = this.content.itemUUIDToItemHistoryMapping[item.uuid];
    if(!history) {
      history = new SFItemHistory();
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

  optimizeHistoryForItem(item) {
    /**
     * Clean up if there are too many revisions. Note LargeItemEntryAmountThreshold
     * is the amount of revisions which above, call for an optimization. An
     * optimization may not remove entries above this threshold. It will
     * determine what it should keep and what it shouldn't. So, it is possible
     * to have a threshold of 60 but have 600 entries, if the item history deems
     * those worth keeping.
     */
    const itemHistory = this.historyForItem(item);
    if(itemHistory.entries.length > SFHistorySession.LargeItemEntryAmountThreshold) {
      itemHistory.optimize();
    }
  }
}
