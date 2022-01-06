import { removeFromArray } from '@Lib/utils';
import { SNItem } from '@Models/core/item';
import { ContentType } from '@Models/content_types';
import { SNTag } from '@Lib/index';
import { PayloadSource } from '@Lib/protocol/payloads';
import { SNNote } from '@Lib/models';
import { UuidString } from '@Lib/types';
import { SNApplication } from './../application';

export class NoteViewController {
  public note!: SNNote;
  private application: SNApplication;
  private innerValueChangeObservers: ((
    note: SNNote,
    source: PayloadSource
  ) => void)[] = [];
  private removeStreamObserver?: () => void;
  public isTemplateNote = false;

  constructor(
    application: SNApplication,
    noteUuid: string | undefined,
    private defaultTitle: string | undefined,
    private defaultTag: UuidString | undefined
  ) {
    this.application = application;
    if (noteUuid) {
      this.note = application.findItem(noteUuid) as SNNote;
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
      )) as SNNote;
      if (this.defaultTag) {
        const tag = this.application.findItem(this.defaultTag) as SNTag;
        await this.application.addTagHierarchyToNote(note, tag);
      }
      this.isTemplateNote = true;
      this.note = note;
      this.notifyObservers(this.note, this.note.payload.source);
    }
    this.streamItems();
  }

  private notifyObservers(note: SNNote, source: PayloadSource): void {
    for (const observer of this.innerValueChangeObservers) {
      observer(note, source);
    }
  }

  private streamItems() {
    this.removeStreamObserver = this.application.streamItems(
      ContentType.Note,
      (items, source) => {
        this.handleNoteStream(items as SNNote[], source);
      }
    );
  }

  deinit(): void {
    this.removeStreamObserver?.();
    (this.removeStreamObserver as unknown) = undefined;
    (this.application as unknown) = undefined;
    this.innerValueChangeObservers.length = 0;
  }

  private handleNoteStream(notes: SNNote[], source: PayloadSource) {
    /** Update our note object reference whenever it changes */
    const matchingNote = notes.find((item) => {
      return item.uuid === this.note.uuid;
    }) as SNNote;
    if (matchingNote) {
      this.isTemplateNote = false;
      this.note = matchingNote;
      this.notifyObservers(matchingNote, source);
    }
  }

  insertTemplatedNote(): Promise<SNItem> {
    this.isTemplateNote = false;
    return this.application.insertItem(this.note);
  }

  /**
   * Register to be notified when the controller's note's inner values change
   * (and thus a new object reference is created)
   */
  public addNoteInnerValueChangeObserver(
    callback: (note: SNNote, source: PayloadSource) => void
  ): () => void {
    this.innerValueChangeObservers.push(callback);
    if (this.note) {
      callback(this.note, this.note.payload.source);
    }

    return () => {
      removeFromArray(this.innerValueChangeObservers, callback);
    };
  }
}
