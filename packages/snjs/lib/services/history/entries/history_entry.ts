import { SNItem } from '@Models/core/item';
import { isNullOrUndefined } from '@Lib/utils';
import { CopyPayload } from '@Payloads/generator';
import { CreateItemFromPayload } from '@Lib/models';
import { SurePayload } from '@Lib/protocol/payloads/sure_payload';

export class HistoryEntry {
  public readonly payload: SurePayload;
  public readonly previousEntry?: HistoryEntry;
  protected readonly defaultContentKeyToDiffOn = 'text';
  protected readonly textCharDiffLength: number;
  protected readonly hasPreviousEntry: boolean;

  constructor(payload: SurePayload, previousEntry?: HistoryEntry) {
    const updated_at = payload.serverUpdatedAt ?? new Date();
    this.payload = CopyPayload(payload, {
      updated_at: updated_at,
    }) as SurePayload;
    this.previousEntry = previousEntry;
    this.hasPreviousEntry = !isNullOrUndefined(previousEntry);
    /** We'll try to compute the delta based on an assumed
     * content property of `text`, if it exists. */
    const propertyValue = this.payload.content[this.defaultContentKeyToDiffOn];
    if (propertyValue) {
      if (previousEntry) {
        this.textCharDiffLength =
          propertyValue.length -
          previousEntry.payload.content[this.defaultContentKeyToDiffOn].length;
      } else {
        this.textCharDiffLength = this.payload.content[
          this.defaultContentKeyToDiffOn
        ].length;
      }
    } else {
      this.textCharDiffLength = 0;
    }
  }

  public itemFromPayload(): SNItem {
    return CreateItemFromPayload(this.payload);
  }

  public isSameAsEntry(entry: HistoryEntry): boolean {
    if (!entry) {
      return false;
    }
    const lhs = this.itemFromPayload();
    const rhs = entry.itemFromPayload();
    const datesEqual =
      lhs.userModifiedDate.getTime() === rhs.userModifiedDate.getTime();
    if (!datesEqual) {
      return false;
    }
    /** Dates are the same, but because JS is only accurate to milliseconds,
     * items can have different content but same dates */
    return lhs.isItemContentEqualWith(rhs);
  }

  public operationVector(): number {
    /**
     * We'll try to use the value of `textCharDiffLength`
     * to help determine this, if it's set
     */
    if (this.textCharDiffLength !== undefined) {
      if (!this.hasPreviousEntry || this.textCharDiffLength === 0) {
        return 0;
      } else if (this.textCharDiffLength < 0) {
        return -1;
      } else {
        return 1;
      }
    }

    /** Otherwise use a default value of 1 */
    return 1;
  }

  public deltaSize(): number {
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
    if (this.textCharDiffLength !== undefined) {
      return Math.abs(this.textCharDiffLength);
    }
    /**
     * Otherwise return 1 here to constitute a basic positive delta.
     * The value returned should always be positive. Override `operationVector`
     * to return the direction of the delta.
     */
    return 1;
  }
}
