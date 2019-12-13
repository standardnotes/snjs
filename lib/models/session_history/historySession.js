/*
  Important: This is the only object in the session history domain that is persistable.

  A history session contains one main content object:
  the itemUUIDToItemHistoryMapping. This is a dictionary whose keys are item uuids,
  and each value is an SFItemHistory object.

  Each SFItemHistory object contains an array called `entires` which contain `SFItemHistory` entries (or subclasses, if the
  `SFItemHistory.HistoryEntryClassMapping` class property value is set.)
 */

// See default class values at bottom of this file, including `SFHistorySession.LargeItemEntryAmountThreshold`.

export class SFHistorySession extends SFItem {
  constructor(json_obj) {

    super(json_obj);

    /*
      Our .content params:
      {
        itemUUIDToItemHistoryMapping
      }
     */

    if(!this.content.itemUUIDToItemHistoryMapping) {
      this.content.itemUUIDToItemHistoryMapping = {};
    }

    // When initializing from a json_obj, we want to deserialize the item history JSON into SFItemHistory objects.
    var uuids = Object.keys(this.content.itemUUIDToItemHistoryMapping);
    uuids.forEach((itemUUID) => {
      var itemHistory = this.content.itemUUIDToItemHistoryMapping[itemUUID];
      this.content.itemUUIDToItemHistoryMapping[itemUUID] = new SFItemHistory(itemHistory);
    });
  }

  addEntryForItem(item) {
    var itemHistory = this.historyForItem(item);
    var entry = itemHistory.addHistoryEntryForItem(item);
    return entry;
  }

  historyForItem(item) {
    var history = this.content.itemUUIDToItemHistoryMapping[item.uuid];
    if(!history) {
      history = this.content.itemUUIDToItemHistoryMapping[item.uuid] = new SFItemHistory();
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
    // Clean up if there are too many revisions. Note SFHistorySession.LargeItemEntryAmountThreshold is the amount of revisions which above, call
    // for an optimization. An optimization may not remove entries above this threshold. It will determine what it should keep and what it shouldn't.
    // So, it is possible to have a threshold of 60 but have 600 entries, if the item history deems those worth keeping.
    var itemHistory = this.historyForItem(item);
    if(itemHistory.entries.length > SFHistorySession.LargeItemEntryAmountThreshold) {
      itemHistory.optimize();
    }
  }
}

// See comment in `this.optimizeHistoryForItem`
SFHistorySession.LargeItemEntryAmountThreshold = 60;
