import {
  NoteMutator,
  SNNote,
  SNTag,
  NoteContent,
  DecryptedItemInterface,
  PayloadEmitSource,
} from '@standardnotes/models'
import { removeFromArray } from '@standardnotes/utils'
import { ContentType } from '@standardnotes/common'
import { UuidString } from '@Lib/Types/UuidString'
import { SNApplication } from '../Application/Application'
import {
  STRING_SAVING_WHILE_DOCUMENT_HIDDEN,
  STRING_INVALID_NOTE,
  NOTE_PREVIEW_CHAR_LIMIT,
  STRING_ELLIPSES,
  SAVE_TIMEOUT_NO_DEBOUNCE,
  SAVE_TIMEOUT_DEBOUNCE,
} from './Types'

export type EditorValues = {
  title: string
  text: string
}

export class NoteViewController {
  public note!: SNNote
  private application: SNApplication
  private innerValueChangeObservers: ((note: SNNote, source: PayloadEmitSource) => void)[] = []
  private removeStreamObserver?: () => void
  public isTemplateNote = false
  private saveTimeout?: Promise<void>

  constructor(
    application: SNApplication,
    noteUuid: string | undefined,
    private defaultTitle: string | undefined,
    private defaultTag: UuidString | undefined,
  ) {
    this.application = application
    if (noteUuid) {
      this.note = application.items.findItem(noteUuid) as SNNote
    }
  }

  async initialize(addTagHierarchy: boolean): Promise<void> {
    if (!this.note) {
      const note = this.application.mutator.createTemplateItem<NoteContent, SNNote>(
        ContentType.Note,
        {
          text: '',
          title: this.defaultTitle || '',
          references: [],
        },
      )

      if (this.defaultTag) {
        const tag = this.application.items.findItem(this.defaultTag) as SNTag
        await this.application.items.addTagToNote(note, tag, addTagHierarchy)
      }

      this.isTemplateNote = true
      this.note = note

      this.notifyObservers(this.note, PayloadEmitSource.InitialObserverRegistrationPush)
    }
    this.streamItems()
  }

  private notifyObservers(note: SNNote, source: PayloadEmitSource): void {
    for (const observer of this.innerValueChangeObservers) {
      observer(note, source)
    }
  }

  private streamItems() {
    this.removeStreamObserver = this.application.streamItems<SNNote>(
      ContentType.Note,
      ({ changed, inserted, source }) => {
        const notes = changed.concat(inserted)

        const matchingNote = notes.find((item) => {
          return item.uuid === this.note.uuid
        })

        if (matchingNote) {
          this.isTemplateNote = false
          this.note = matchingNote
          this.notifyObservers(matchingNote, source)
        }
      },
    )
  }

  deinit(): void {
    this.removeStreamObserver?.()
    ;(this.removeStreamObserver as unknown) = undefined
    ;(this.application as unknown) = undefined

    this.innerValueChangeObservers.length = 0

    this.saveTimeout = undefined
  }

  public insertTemplatedNote(): Promise<DecryptedItemInterface> {
    this.isTemplateNote = false
    return this.application.mutator.insertItem(this.note)
  }

  /**
   * Register to be notified when the controller's note's inner values change
   * (and thus a new object reference is created)
   */
  public addNoteInnerValueChangeObserver(
    callback: (note: SNNote, source: PayloadEmitSource) => void,
  ): () => void {
    this.innerValueChangeObservers.push(callback)

    if (this.note) {
      callback(this.note, PayloadEmitSource.InitialObserverRegistrationPush)
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
    editorValues: EditorValues
    bypassDebouncer?: boolean
    isUserModified?: boolean
    dontUpdatePreviews?: boolean
    customMutate?: (mutator: NoteMutator) => void
  }): Promise<void> {
    const title = dto.editorValues.title
    const text = dto.editorValues.text
    const isTemplate = this.isTemplateNote

    if (typeof document !== 'undefined' && document.hidden) {
      void this.application.alertService.alert(STRING_SAVING_WHILE_DOCUMENT_HIDDEN)
      return
    }

    if (isTemplate) {
      await this.insertTemplatedNote()
    }

    if (!this.application.items.findItem(this.note.uuid)) {
      void this.application.alertService.alert(STRING_INVALID_NOTE)
      return
    }

    await this.application.mutator.changeItem(
      this.note,
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
      dto.isUserModified,
    )

    if (this.saveTimeout) {
      this.application.deviceInterface.cancelTimeout(this.saveTimeout)
    }

    const noDebounce = dto.bypassDebouncer || this.application.noAccount()
    const syncDebouceMs = noDebounce ? SAVE_TIMEOUT_NO_DEBOUNCE : SAVE_TIMEOUT_DEBOUNCE
    this.saveTimeout = this.application.deviceInterface.timeout(() => {
      void this.application.sync.sync()
    }, syncDebouceMs)
  }
}
