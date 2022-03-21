import { removeFromArray } from '@standardnotes/utils'
import { UuidString } from "@Lib/Types/UuidString"
import { SNApplication } from './../application'
import { NoteViewController } from './note_view_controller'

type NoteControllerGroupChangeCallback = (activeController: NoteViewController) => void

export class NoteGroupController {
  public noteControllers: NoteViewController[] = []
  private application: SNApplication
  changeObservers: NoteControllerGroupChangeCallback[] = []

  constructor(application: SNApplication) {
    this.application = application
  }

  public deinit(): void {
    ;(this.application as unknown) = undefined
    for (const controller of this.noteControllers) {
      this.closeNoteView(controller, false)
    }
  }

  async createNoteView(noteUuid?: string, noteTitle?: string, noteTag?: UuidString): Promise<void> {
    const controller = new NoteViewController(this.application, noteUuid, noteTitle, noteTag)
    await controller.initialize()
    this.noteControllers.push(controller)
    this.notifyObservers()
  }

  closeNoteView(controller: NoteViewController, notifyObservers = true): void {
    controller.deinit()
    removeFromArray(this.noteControllers, controller)

    if (notifyObservers) {
      this.notifyObservers()
    }
  }

  closeActiveNoteView(): void {
    const activeController = this.activeNoteViewController
    if (activeController) {
      this.closeNoteView(activeController, true)
    }
  }

  closeAllNoteViews(): void {
    for (const controller of this.noteControllers) {
      this.closeNoteView(controller, false)
    }
    this.notifyObservers()
  }

  get activeNoteViewController(): NoteViewController {
    return this.noteControllers[0]
  }

  /**
   * Notifies observer when the active controller has changed.
   */
  public addActiveControllerChangeObserver(
    callback: NoteControllerGroupChangeCallback,
  ): () => void {
    this.changeObservers.push(callback)
    if (this.activeNoteViewController) {
      callback(this.activeNoteViewController)
    }
    return () => {
      removeFromArray(this.changeObservers, callback)
    }
  }

  private notifyObservers(): void {
    for (const observer of this.changeObservers) {
      observer(this.activeNoteViewController)
    }
  }
}
