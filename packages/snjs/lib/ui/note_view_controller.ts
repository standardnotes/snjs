import { removeFromArray } from '@standardnotes/utils'
import { SNItem } from '@Models/core/item'
import { ContentType } from '@standardnotes/common'
import { SNTag } from '@Lib/index'
import { PayloadSource } from '@standardnotes/payloads'
import { NoteMutator, SNNote } from '@Lib/models'
import { UuidString } from '@Lib/types'
import { SNApplication } from './../application'

export const STRING_SAVING_WHILE_DOCUMENT_HIDDEN =
  'Attempting to save an item while the application is hidden. To protect data integrity, please refresh the application window and try again.'
export const STRING_DELETED_NOTE =
  'The note you are attempting to edit has been deleted, and is awaiting sync. Changes you make will be disregarded.'
export const STRING_INVALID_NOTE =
  'The note you are attempting to save can not be found or has been deleted. Changes you make will not be synced. Please copy this note\'s text and start a new note.'

export const STRING_ELLIPSES = '...'

const NOTE_PREVIEW_CHAR_LIMIT = 80
const SAVE_TIMEOUT_DEBOUNCE = 350
const SAVE_TIMEOUT_NO_DEBOUNCE = 100

export type EditorValues = {
  title: string;
  text: string;
};

export class NoteViewController {
  public note!: SNNote
  private application: SNApplication
  private innerValueChangeObservers: ((
    note: SNNote,
    source: PayloadSource
  ) => void)[] = []
  private removeStreamObserver?: () => void
  public isTemplateNote = false
  private saveTimeout?: Promise<void>

  constructor(
    application: SNApplication,
    noteUuid: string | undefined,
    private defaultTitle: string | undefined,
    private defaultTag: UuidString | undefined
  ) {
    this.application = application
    if (noteUuid) {
      this.note = application.findItem(noteUuid) as SNNote
    }
  }

  async initialize(): Promise<void> {
    if (!this.note) {
      const note = (await this.application.createTemplateItem(
        ContentType.Note,
        {
          text: '',
          title: this.defaultTitle,
          references: [],
        }
      )) as SNNote
      if (this.defaultTag) {
        const tag = this.application.findItem(this.defaultTag) as SNTag
        await this.application.addTagHierarchyToNote(note, tag)
      }
      this.isTemplateNote = true
      this.note = note
      this.notifyObservers(this.note, this.note.payload.source)
    }
    this.streamItems()
  }

  private notifyObservers(note: SNNote, source: PayloadSource): void {
    for (const observer of this.innerValueChangeObservers) {
      observer(note, source)
    }
  }

  private streamItems() {
    this.removeStreamObserver = this.application.streamItems(
      ContentType.Note,
      (items, source) => {
        this.handleNoteStream(items as SNNote[], source)
      }
    )
  }

  deinit(): void {
    this.removeStreamObserver?.();
    (this.removeStreamObserver as unknown) = undefined;
    (this.application as unknown) = undefined
    this.innerValueChangeObservers.length = 0
    this.saveTimeout = undefined
  }

  private handleNoteStream(notes: SNNote[], source: PayloadSource) {
    /** Update our note object reference whenever it changes */
    const matchingNote = notes.find((item) => {
      return item.uuid === this.note.uuid
    }) as SNNote
    if (matchingNote) {
      this.isTemplateNote = false
      this.note = matchingNote
      this.notifyObservers(matchingNote, source)
    }
  }

  insertTemplatedNote(): Promise<SNItem> {
    this.isTemplateNote = false
    return this.application.insertItem(this.note)
  }

  /**
   * Register to be notified when the controller's note's inner values change
   * (and thus a new object reference is created)
   */
  public addNoteInnerValueChangeObserver(
    callback: (note: SNNote, source: PayloadSource) => void
  ): () => void {
    this.innerValueChangeObservers.push(callback)
    if (this.note) {
      callback(this.note, this.note.payload.source)
    }

    return () => {
      removeFromArray(this.innerValueChangeObservers, callback)
    }
  }

  /**
   * @param bypassDebouncer Calling save will debounce by default. You can pass true to save
   * immediately.
   * @param isUserModified This field determines if the item will be saved as a user
   * modification, thus updating the user modified date displayed in the UI
   * @param dontUpdatePreviews Whether this change should update the note's plain and HTML
   * preview.
   * @param customMutate A custom mutator function.
   */
  public async save(dto: {
    editorValues: EditorValues;
    bypassDebouncer?: boolean;
    isUserModified?: boolean;
    dontUpdatePreviews?: boolean;
    customMutate?: (mutator: NoteMutator) => void;
  }): Promise<void> {
    const title = dto.editorValues.title
    const text = dto.editorValues.text
    const isTemplate = this.isTemplateNote

    if (typeof document !== 'undefined' && document.hidden) {
      this.application.alertService.alert(STRING_SAVING_WHILE_DOCUMENT_HIDDEN)
      return
    }

    if (this.note.deleted) {
      this.application.alertService.alert(STRING_DELETED_NOTE)
      return
    }

    if (isTemplate) {
      await this.insertTemplatedNote()
    }

    if (!this.application.findItem(this.note.uuid)) {
      this.application.alertService.alert(STRING_INVALID_NOTE)
      return
    }

    await this.application.changeItem(
      this.note.uuid,
      (mutator) => {
        const noteMutator = mutator as NoteMutator
        if (dto.customMutate) {
          dto.customMutate(noteMutator)
        }
        noteMutator.title = title
        noteMutator.text = text

        if (!dto.dontUpdatePreviews) {
          const noteText = text || ''
          const truncate = noteText.length > NOTE_PREVIEW_CHAR_LIMIT
          const substring = noteText.substring(0, NOTE_PREVIEW_CHAR_LIMIT)
          const previewPlain = substring + (truncate ? STRING_ELLIPSES : '')
          // eslint-disable-next-line camelcase
          noteMutator.preview_plain = previewPlain
          // eslint-disable-next-line camelcase
          noteMutator.preview_html = undefined
        }
      },
      dto.isUserModified
    )

    if (this.saveTimeout) {
      this.application.deviceInterface.cancelTimeout(this.saveTimeout)
    }

    const noDebounce = dto.bypassDebouncer || this.application.noAccount()
    const syncDebouceMs = noDebounce
      ? SAVE_TIMEOUT_NO_DEBOUNCE
      : SAVE_TIMEOUT_DEBOUNCE
    this.saveTimeout = this.application.deviceInterface.timeout(() => {
      this.application.sync()
    }, syncDebouceMs)
  }
}
