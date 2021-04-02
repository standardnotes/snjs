import { ItemHistoryEntry } from '@Services/history/entries/item_history_entry';

export class NoteHistoryEntry extends ItemHistoryEntry {
  previewTitle() {
    return this.payload.updated_at!.toLocaleString();
  }

  previewSubTitle() {
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
}
