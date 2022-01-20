import { removeFromArray } from '@Lib/utils';
import { ItemCollection } from './item_collection';
import { SNNote } from '@Lib/models';
import { SNTag } from '@Lib/index';
import { UuidString } from '@Lib/types';
import { isNote } from '@Lib/models/app/note';
import { isTag } from '@Lib/models/app/tag';
import { ItemDelta, SNIndex } from './indexes';

/** tagUuid undefined signifies all notes count change */
export type TagNoteCountChangeObserver = (
  tagUuid: UuidString | undefined
) => void;

export class TagNotesIndex implements SNIndex {
  private tagToNotesMap: Partial<Record<UuidString, Set<UuidString>>> = {};
  private allCountableNotes = new Set<UuidString>();
  private observers: TagNoteCountChangeObserver[] = [];

  constructor(private collection: ItemCollection) {}

  private isNoteCountable = (note: SNNote) => {
    return !note.archived && !note.trashed;
  };

  public addCountChangeObserver(
    observer: TagNoteCountChangeObserver
  ): () => void {
    this.observers.push(observer);

    return () => {
      removeFromArray(this.observers, observer);
    };
  }

  private notifyObservers(tagUuid: UuidString | undefined) {
    for (const observer of this.observers) {
      observer(tagUuid);
    }
  }

  public allCountableNotesCount(): number {
    return this.allCountableNotes.size;
  }

  public countableNotesForTag(tag: SNTag): number {
    return this.tagToNotesMap[tag.uuid]?.size || 0;
  }

  public onChange(delta: ItemDelta): void {
    const changedOrInserted = delta.changed.concat(delta.inserted);
    const notes = changedOrInserted.filter(isNote);
    const tags = changedOrInserted.filter(isTag);

    this.receiveNoteChanges(notes);
    this.receiveTagChanges(tags);
  }

  private receiveTagChanges(tags: SNTag[]): void {
    for (const tag of tags) {
      const uuids = tag.noteReferences.map((ref) => ref.uuid);
      const countableUuids = uuids.filter((uuid) =>
        this.allCountableNotes.has(uuid)
      );
      const previousSet = this.tagToNotesMap[tag.uuid];
      this.tagToNotesMap[tag.uuid] = new Set(countableUuids);

      if (previousSet?.size !== countableUuids.length) {
        this.notifyObservers(tag.uuid);
      }
    }
  }

  private receiveNoteChanges(notes: SNNote[]): void {
    for (const note of notes) {
      const isCountable = this.isNoteCountable(note);
      const previousAllCount = this.allCountableNotes.size;
      if (isCountable) {
        this.allCountableNotes.add(note.uuid);
      } else {
        this.allCountableNotes.delete(note.uuid);
      }
      if (previousAllCount !== this.allCountableNotes.size) {
        this.notifyObservers(undefined);
      }

      const associatedTagUuids = this.collection.uuidsThatReferenceUuid(
        note.uuid
      );
      for (const tagUuid of associatedTagUuids) {
        const set = this.setForTag(tagUuid);
        const previousCount = set.size;
        if (isCountable) {
          set.add(note.uuid);
        } else {
          set.delete(note.uuid);
        }
        if (previousCount !== set.size) {
          this.notifyObservers(tagUuid);
        }
      }
    }
  }

  private setForTag(uuid: UuidString): Set<UuidString> {
    let set = this.tagToNotesMap[uuid];
    if (!set) {
      set = new Set();
      this.tagToNotesMap[uuid] = set;
    }
    return set;
  }
}
