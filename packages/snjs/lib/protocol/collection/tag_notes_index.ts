import { ItemCollection } from './item_collection';
import { SNNote } from '@Lib/models';
import { SNTag } from '@Lib/index';
import { UuidString } from '@Lib/types';
import { isNote } from '@Lib/models/app/note';
import { isTag } from '@Lib/models/app/tag';

export class TagNotesIndex {
  private tagToNotesMap: Record<UuidString, Set<UuidString>> = {};
  private allCountableNotes = new Set<UuidString>();

  constructor(private collection: ItemCollection) {}

  private isNoteCountable = (note: SNNote) => {
    return !note.archived && !note.trashed;
  };

  public allCountableNotesCount(): number {
    return this.allCountableNotes.size;
  }

  public countableNotesForTag(tag: SNTag): number {
    return this.tagToNotesMap[tag.uuid]?.size;
  }

  public receiveTagAndNoteChanges(items: (SNTag | SNNote)[]): void {
    const notes = items.filter(isNote);
    this.receiveNoteChanges(notes);

    const tags = items.filter(isTag);
    this.receiveTagChanges(tags);
  }

  private receiveTagChanges(tags: SNTag[]): void {
    for (const tag of tags) {
      const uuids = tag.noteReferences.map((ref) => ref.uuid);
      const countableUuids = uuids.filter((uuid) =>
        this.allCountableNotes.has(uuid)
      );
      this.tagToNotesMap[tag.uuid] = new Set(countableUuids);
    }
  }

  private receiveNoteChanges(notes: SNNote[]): void {
    for (const note of notes) {
      const isCountable = this.isNoteCountable(note);
      if (isCountable) {
        this.allCountableNotes.add(note.uuid);
      } else {
        this.allCountableNotes.delete(note.uuid);
      }

      const associatedTagUuids = this.collection.uuidsThatReferenceUuid(
        note.uuid
      );
      for (const tagUuid of associatedTagUuids) {
        const set = this.tagToNotesMap[tagUuid];
        if (isCountable) {
          set.add(note.uuid);
        } else {
          set.delete(note.uuid);
        }
      }
    }
  }
}
