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
      this.closeNoteController(controller, { notify: false })
    }

    this.noteControllers.length = 0
  }

  async createNoteController(noteUuid?: string, noteTitle?: string, noteTag?: UuidString): Promise<NoteViewController> {
    if (this.activeNoteViewController) {
      this.closeNoteController(this.activeNoteViewController, { notify: false })
    }

    const controller = new NoteViewController(this.application, noteUuid, noteTitle, noteTag)

    this.noteControllers.push(controller)

    await controller.initialize(this.addTagHierarchy)

    this.notifyObservers()

    return controller
  }

  public closeNoteController(
    controller: NoteViewController,
    { notify = true }: { notify: boolean } = { notify: true },
  ): void {
    controller.deinit()

    removeFromArray(this.noteControllers, controller)

    if (notify) {
      this.notifyObservers()
    }
  }

  closeActiveNoteController(): void {
    const activeController = this.activeNoteViewController

    if (activeController) {
      this.closeNoteController(activeController, { notify: true })
    }
  }

  closeAllNoteControllers(): void {
    for (const controller of this.noteControllers) {
      this.closeNoteController(controller, { notify: false })
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
