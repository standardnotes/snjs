import { AnyRecord } from '@Lib/types';
import { SNItem } from '@Models/core/item';
import { PurePayload } from '@Payloads/pure_payload';
import { ItemHistory } from '@Services/history/item_history';
import { ItemHistorySource } from '../item_history_entry';

/** The amount of revisions which above, call for an optimization. */
const DEFAULT_ITEM_REVISIONS_THRESHOLD = 60;

/**
 * SessionHistory is the only object in the session history domain that is
 * persistable. A history session contains one main content object: the
 * itemUUIDToItemHistoryMapping. This is a dictionary whose keys are item uuids,
 * and each value is an ItemHistory object.
 *
 * Each ItemHistory object contains an array called `entries` which contain
 * `ItemHistory` (or subclasses thereof) entries.
 */

type SessionHistoryContent = {
  itemUUIDToItemHistoryMapping: Record<string, ItemHistory>
}

export class SessionHistory {

  private content?: SessionHistoryContent
  private itemRevisionThreshold = DEFAULT_ITEM_REVISIONS_THRESHOLD

  constructor(content?: SessionHistoryContent) {
    this.content = content;
    if(!this.content) {
      this.content = {
        itemUUIDToItemHistoryMapping: {}
      };
    }
  }

  static FromJson(sessionHistoryJson?: AnyRecord) {
    if(sessionHistoryJson) {
      const content = sessionHistoryJson.content;
      const uuids = Object.keys(content.itemUUIDToItemHistoryMapping);
      uuids.forEach((itemUUID) => {
        const rawItemHistory = content.itemUUIDToItemHistoryMapping[itemUUID];
        content.itemUUIDToItemHistoryMapping[itemUUID] =
          ItemHistory.FromJson(rawItemHistory, ItemHistorySource.Session);
      });
      return new SessionHistory(content);
    } else {
      return new SessionHistory();
    }
  }

  addEntryForPayload(payload: PurePayload) {
    const itemHistory = this.historyForItem(payload.uuid!);
    return itemHistory.addHistoryEntryForItem(payload, ItemHistorySource.Session);
  }

  historyForItem(uuid: string) {
    let history = this.content!.itemUUIDToItemHistoryMapping[uuid];
    if(!history) {
      history = new ItemHistory();
      this.content!.itemUUIDToItemHistoryMapping[uuid] = history;
    }
    return history;
  }

  clearItemHistory(item: SNItem) {
    this.historyForItem(item.uuid).clear();
  }

  clearAllHistory() {
    this.content!.itemUUIDToItemHistoryMapping = {};
  }

  setItemRevisionThreshold(threshold: number) {
    this.itemRevisionThreshold = threshold;
  }

  optimizeHistoryForItem(uuid: string) {
    /**
     * Clean up if there are too many revisions. Note itemRevisionThreshold
     * is the amount of revisions which above, call for an optimization. An
     * optimization may not remove entries above this threshold. It will
     * determine what it should keep and what it shouldn't. So, it is possible
     * to have a threshold of 60 but have 600 entries, if the item history deems
     * those worth keeping.
     */
    const itemHistory = this.historyForItem(uuid);
    if(itemHistory.entries.length > this.itemRevisionThreshold) {
      itemHistory.optimize();
    }
  }
}
