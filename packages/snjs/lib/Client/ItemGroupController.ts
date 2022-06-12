import { ApplicationEvent } from '../Application/Event'
import { FileItem, PrefKey } from '@standardnotes/models'
import { removeFromArray } from '@standardnotes/utils'
import { UuidString } from '@Lib/Types/UuidString'
import { SNApplication } from '../Application/Application'
import { NoteViewController } from './NoteViewController'
import { FileViewController } from './FileViewController'

type ItemControllerGroupChangeCallback = (activeController: NoteViewController | FileViewController | undefined) => void

export class ItemGroupController {
  public itemControllers: (NoteViewController | FileViewController)[] = []
  private application: SNApplication
  private addTagHierarchy: boolean
  changeObservers: ItemControllerGroupChangeCallback[] = []
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

    for (const controller of this.itemControllers) {
      this.closeItemController(controller, { notify: false })
    }

    this.itemControllers.length = 0
  }

  async createNoteController(noteUuid?: string, noteTitle?: string, noteTag?: UuidString): Promise<NoteViewController> {
    if (this.activeItemViewController) {
      this.closeItemController(this.activeItemViewController, { notify: false })
    }

    const controller = new NoteViewController(this.application, noteUuid, noteTitle, noteTag)

    this.itemControllers.push(controller)

    await controller.initialize(this.addTagHierarchy)

    this.notifyObservers()

    return controller
  }

  async createFileController(fileItem: FileItem): Promise<FileViewController> {
    if (this.activeItemViewController) {
      this.closeItemController(this.activeItemViewController, { notify: false })
    }

    const controller = new FileViewController(this.application, fileItem)

    this.itemControllers.push(controller)

    await controller.initialize()

    this.notifyObservers()

    return controller
  }

  public closeItemController(
    controller: NoteViewController | FileViewController,
    { notify = true }: { notify: boolean } = { notify: true },
  ): void {
    controller.deinit()

    removeFromArray(this.itemControllers, controller)

    if (notify) {
      this.notifyObservers()
    }
  }

  closeActiveItemController(): void {
    const activeController = this.activeItemViewController

    if (activeController) {
      this.closeItemController(activeController, { notify: true })
    }
  }

  closeAllItemControllers(): void {
    for (const controller of this.itemControllers) {
      this.closeItemController(controller, { notify: false })
    }

    this.notifyObservers()
  }

  get activeItemViewController(): NoteViewController | FileViewController | undefined {
    return this.itemControllers[0]
  }

  /**
   * Notifies observer when the active controller has changed.
   */
  public addActiveControllerChangeObserver(callback: ItemControllerGroupChangeCallback): () => void {
    this.changeObservers.push(callback)

    if (this.activeItemViewController) {
      callback(this.activeItemViewController)
    }

    const thislessChangeObservers = this.changeObservers
    return () => {
      removeFromArray(thislessChangeObservers, callback)
    }
  }

  private notifyObservers(): void {
    for (const observer of this.changeObservers) {
      observer(this.activeItemViewController)
    }
  }
}
