import { removeFromArray } from '@standardnotes/utils'
import { ItemCollection, ItemDelta, SNIndex } from '@standardnotes/payloads'
import { Uuid } from '@standardnotes/common'
import { isNote, SNNote } from '../Note'
import { isTag, SNTag } from '.'

/** tagUuid undefined signifies all notes count change */
export type TagNoteCountChangeObserver = (tagUuid: Uuid | undefined) => void

export class TagNotesIndex implements SNIndex {
  private tagToNotesMap: Partial<Record<Uuid, Set<Uuid>>> = {}
  private allCountableNotes = new Set<Uuid>()

  constructor(
    private collection: ItemCollection,
    public observers: TagNoteCountChangeObserver[] = [],
  ) {}

  private isNoteCountable = (note: SNNote) => {
    return !note.archived && !note.trashed && !note.deleted
  }

  public addCountChangeObserver(observer: TagNoteCountChangeObserver): () => void {
    this.observers.push(observer)

    return () => {
      removeFromArray(this.observers, observer)
    }
  }

  private notifyObservers(tagUuid: Uuid | undefined) {
    for (const observer of this.observers) {
      observer(tagUuid)
    }
  }

  public allCountableNotesCount(): number {
    return this.allCountableNotes.size
  }

  public countableNotesForTag(tag: SNTag): number {
    return this.tagToNotesMap[tag.uuid]?.size || 0
  }

  public onChange(delta: ItemDelta): void {
    const changedOrInserted = delta.changed.concat(delta.inserted)
    const notes = changedOrInserted.filter(isNote)
    const tags = changedOrInserted.filter(isTag)

    this.receiveNoteChanges(notes)
    this.receiveTagChanges(tags)
  }

  private receiveTagChanges(tags: SNTag[]): void {
    for (const tag of tags) {
      const uuids = tag.noteReferences.map((ref) => ref.uuid)
      const countableUuids = uuids.filter((uuid) => this.allCountableNotes.has(uuid))
      const previousSet = this.tagToNotesMap[tag.uuid]
      this.tagToNotesMap[tag.uuid] = new Set(countableUuids)

      if (previousSet?.size !== countableUuids.length) {
        this.notifyObservers(tag.uuid)
      }
    }
  }

  private receiveNoteChanges(notes: SNNote[]): void {
    const previousAllCount = this.allCountableNotes.size
    for (const note of notes) {
      const isCountable = this.isNoteCountable(note)
      if (isCountable) {
        this.allCountableNotes.add(note.uuid)
      } else {
        this.allCountableNotes.delete(note.uuid)
      }

      const associatedTagUuids = this.collection.uuidsThatReferenceUuid(note.uuid)
      for (const tagUuid of associatedTagUuids) {
        const set = this.setForTag(tagUuid)
        const previousCount = set.size
        if (isCountable) {
          set.add(note.uuid)
        } else {
          set.delete(note.uuid)
        }
        if (previousCount !== set.size) {
          this.notifyObservers(tagUuid)
        }
      }
    }
    if (previousAllCount !== this.allCountableNotes.size) {
      this.notifyObservers(undefined)
    }
  }

  private setForTag(uuid: Uuid): Set<Uuid> {
    let set = this.tagToNotesMap[uuid]
    if (!set) {
      set = new Set()
      this.tagToNotesMap[uuid] = set
    }
    return set
  }
}