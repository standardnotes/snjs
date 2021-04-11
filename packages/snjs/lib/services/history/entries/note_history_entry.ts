import { isEmpty } from '@Lib/utils';
import { HistoryEntry } from '@Services/history/entries/history_entry';

export class NoteHistoryEntry extends HistoryEntry {
  previewTitle(): string {
    return this.payload.updated_at!.toLocaleString();
  }

  previewSubTitle(): string {
    if (!this.hasPreviousEntry) {
      return `${this.textCharDiffLength} characters loaded`;
    } else if (this.textCharDiffLength < 0) {
      return `${this.textCharDiffLength * -1} characters removed`;
    } else if (this.textCharDiffLength > 0) {
      return `${this.textCharDiffLength} characters added`;
    } else {
      return 'Title or metadata changed';
    }
  }

  public isDiscardable(): boolean {
    return isEmpty(this.payload.safeContent.text);
  }

}
