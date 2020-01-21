import { SFItem } from '@Models/core/item';
import { deepMerge, isString } from '@Lib/utils';
import { CreateMaxPayloadFromAnyObject } from '@Payloads/generator';

export class ItemHistoryEntry {
  constructor(item) {
    /**
     * Whatever values `item` has will be persisted,
     * so be sure that the values are picked beforehand.
     */
    this.item = deepMerge({}, item);

    /**
     * We'll assume a `text` content value to diff on.
     * If it doesn't exist, no problem.
     */
    this.defaultContentKeyToDiffOn = 'text';

    /** Default value */
    this.textCharDiffLength = 0;

    if(isString(this.item.updated_at)) {
      this.item.updated_at = new Date(this.item.updated_at);
    }
  }

  setPreviousEntry(previousEntry) {
    this.hasPreviousEntry = previousEntry != null;

    /** We'll try to compute the delta based on an assumed
     * content property of `text`, if it exists.
     */
    if(this.item.content[this.defaultContentKeyToDiffOn]) {
      if(previousEntry) {
        this.textCharDiffLength =
          this.item.content[this.defaultContentKeyToDiffOn].length
          - previousEntry.item.content[this.defaultContentKeyToDiffOn].length;
      } else {
        this.textCharDiffLength =
          this.item.content[this.defaultContentKeyToDiffOn].length;
      }
    }
  }

  operationVector() {
    /**
     * We'll try to use the value of `textCharDiffLength`
     * to help determine this, if it's set
     */
    if(this.textCharDiffLength != undefined) {
      if(!this.hasPreviousEntry || this.textCharDiffLength == 0) {
        return 0;
      } else if(this.textCharDiffLength < 0) {
        return -1;
      } else {
        return 1;
      }
    }

    /** Otherwise use a default value of 1 */
    return 1;
  }

  deltaSize() {
    /**
     * Up to the subclass to determine how large the delta was,
     * i.e number of characters changed.
     * But this general class won't be able to determine which property it
     * should diff on, or even its format.
     */
    /**
     * We can return the `textCharDiffLength` if it's set,
     * otherwise, just return 1;
     */
    if(this.textCharDiffLength != undefined) {
      return Math.abs(this.textCharDiffLength);
    }
    /**
     * Otherwise return 1 here to constitute a basic positive delta.
     * The value returned should always be positive. Override `operationVector`
     * to return the direction of the delta.
     */
    return 1;
  }

  isSameAsEntry(entry) {
    if(!entry) {
      return false;
    }

    const lhs = new SFItem(CreateMaxPayloadFromAnyObject({
      object: this.item
    }));
    const rhs = new SFItem(CreateMaxPayloadFromAnyObject({
      object: entry.item
    }));
    return lhs.isItemContentEqualWith(rhs);
  }

}
