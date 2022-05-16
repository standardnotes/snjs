import { ApplicationEvent } from './../Application/Event'
import { PrefKey } from '@standardnotes/models'
import { removeFromArray } from '@standardnotes/utils'
import { UuidString } from '@Lib/Types/UuidString'
import { SNApplication } from '../Application/Application'
import { NoteViewController } from './NoteViewController'

type NoteControllerGroupChangeCallback = (activeController: NoteViewController) => void

export class NoteGroupController {
  public noteControllers: NoteViewController[] = []
  private application: SNApplication
  private addTagHierarchy: boolean
  changeObservers: NoteControllerGroupChangeCallback[] = []
  eventObservers: (() => void)[] = []

  constructor(application: SNApplication) {
    this.application = application
    this.addTagHierarchy = application.getPreference(PrefKey.NoteAddToParentFolders, true)

    this.eventObservers.push(
      application.addSingleEventObserver(ApplicationEvent.PreferencesChanged, async () => {
        this.addTagHierarchy = application.getPreference(PrefKey.NoteAddToParentFolders, true)
      }),
    )
  }

  public deinit(): void {
    ;(this.application as unknown) = undefined

    this.eventObservers.forEach((removeObserver) => {
      removeObserver()
    })

    this.changeObservers.length = 0

    for (const controller of this.noteControllers) {
      this.closeNoteView(controller, false)
    }

    this.noteControllers.length = 0
  }

  async createNoteView(noteUuid?: string, noteTitle?: string, noteTag?: UuidString): Promise<NoteViewController> {
    const controller = new NoteViewController(this.application, noteUuid, noteTitle, noteTag)
    await controller.initialize(this.addTagHierarchy)
    this.noteControllers.push(controller)
    this.notifyObservers()

    return controller
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
  public addActiveControllerChangeObserver(callback: NoteControllerGroupChangeCallback): () => void {
    this.changeObservers.push(callback)

    if (this.activeNoteViewController) {
      callback(this.activeNoteViewController)
    }

    const thislessChangeObservers = this.changeObservers
    return () => {
      removeFromArray(thislessChangeObservers, callback)
    }
  }

  private notifyObservers(): void {
    for (const observer of this.changeObservers) {
      observer(this.activeNoteViewController)
    }
  }
}
