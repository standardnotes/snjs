import { ContentType, Uuid } from '@standardnotes/common'
import {
  BuildSmartViews,
  computeUnifiedFilterForDisplayOptions,
  DisplayOptions,
  FileItem,
  FilterDisplayOptions,
  isNote,
  ItemDisplayController,
  SmartView,
  SNNote,
  SystemViewId,
  isFile,
  isPayloadSourceNotInterestingToClients,
  isSmartView,
  isTag,
} from '@standardnotes/models'
import { ItemManagerChangeData } from '@standardnotes/services'
import { extendArray, assert, Uuids } from '@standardnotes/utils'
import { NavigationDisplayOptions } from '../Interface/DisplayOptions'
import { NavigationEventHandler } from '../Interface/EventHandler'
import { ItemsApiForNavigationController } from '../Interface/ItemsApi'
import { NavigationControllerInterface } from '../Interface/NavigationControllerInterface'
import { Folder, SupportedItem, NavigationControllerConfig, FolderContentTypes, isFolder } from '../Interface/Types'

export class NavigationController implements NavigationControllerInterface {
  private notes: SNNote[] = []
  private folders: Folder[] = []
  private files: FileItem[] = []
  private selectedItems: Set<Uuid> = new Set()

  private navigationDisplayController: ItemDisplayController<SNNote | FileItem>
  private folderDisplayController: ItemDisplayController<Folder>
  private fileDisplayController: ItemDisplayController<FileItem>
  private systemSmartViews: SmartView[]
  private lastDisplayOptions?: DisplayOptions

  private disposers: (() => void)[] = []

  constructor(
    private items: ItemsApiForNavigationController,
    private readonly config: NavigationControllerConfig = { supportsFileNavigation: false },
    private eventHandler?: NavigationEventHandler,
  ) {
    this.disposers.push(
      items.addObserver<SNNote>(ContentType.Note, (stream) => {
        this.handleNotesStream(stream)

        if (!isPayloadSourceNotInterestingToClients(stream.source)) {
          this.handleSelectionUpdatesForStream(stream)
        }
      }),

      items.addObserver<Folder>(FolderContentTypes, (stream) => {
        this.handleFoldersStream(stream)

        if (!isPayloadSourceNotInterestingToClients(stream.source)) {
          this.handleSelectionUpdatesForStream(stream)
        }
      }),

      items.addObserver<FileItem>(ContentType.File, (stream) => {
        this.handleFilesStream(stream)

        if (!isPayloadSourceNotInterestingToClients(stream.source)) {
          this.handleSelectionUpdatesForStream(stream)
        }
      }),
    )

    this.systemSmartViews = this.rebuildSystemSmartViews({})

    this.navigationDisplayController = items.createDisplayController([ContentType.Note, ContentType.File], {
      sortBy: 'created_at',
      sortDirection: 'dsc',
      hiddenContentTypes: !this.config.supportsFileNavigation ? [ContentType.File] : [],
    })

    this.folderDisplayController = items.createDisplayController(FolderContentTypes, {
      sortBy: 'title',
      sortDirection: 'asc',
    })

    this.fileDisplayController = items.createDisplayController([ContentType.File], {
      sortBy: 'title',
      sortDirection: 'asc',
    })
  }

  deinit(): void {
    for (const disposer of this.disposers) {
      disposer()
    }

    ;(this.disposers as unknown) = undefined
    ;(this.eventHandler as unknown) = undefined
    ;(this.notes as unknown) = undefined
    ;(this.folders as unknown) = undefined
    ;(this.files as unknown) = undefined
    ;(this.selectedItems as unknown) = undefined
    ;(this.systemSmartViews as unknown) = undefined
    ;(this.navigationDisplayController as unknown) = undefined
    ;(this.folderDisplayController as unknown) = undefined
    ;(this.fileDisplayController as unknown) = undefined
  }

  private handleNotesStream(_stream: ItemManagerChangeData<SNNote>): void {
    this.reloadNotesAndNotify()
  }

  private handleFilesStream(_stream: ItemManagerChangeData<FileItem>): void {
    this.files = this.fileDisplayController.items()

    this.eventHandler?.onFiles(this.files)
  }

  private handleFoldersStream(stream: ItemManagerChangeData<Folder>): void {
    this.reloadFoldersAndNotify()

    const relevantChanged = [...stream.changed, ...stream.inserted]
    const selectedFolderIds = Uuids(this.getSelectedFolders())

    const changesInSelected = relevantChanged.some((f) => selectedFolderIds.includes(f.uuid))
    if (changesInSelected) {
      this.reloadDisplayOptions()
    }
  }

  private reloadNotesAndNotify(): void {
    assert(this.navigationDisplayController.contentTypes.length === 2)

    const fileContentTypeHidden = !this.config.supportsFileNavigation
    if (fileContentTypeHidden) {
      this.notes = this.navigationDisplayController.items() as SNNote[]
    } else {
      this.notes = this.navigationDisplayController.items().filter(isNote)
    }

    this.eventHandler?.onNotes(this.notes)
  }

  private reloadFoldersAndNotify(): void {
    this.folders = [...this.systemSmartViews, ...this.folderDisplayController.items()]

    this.eventHandler?.onFolders(this.folders)
  }

  private handleSelectionUpdatesForStream(stream: ItemManagerChangeData<SupportedItem>): void {
    const { removed } = stream

    this.deselectItems(removed)
  }

  selectItems(
    items: SupportedItem[],
    { multipleSelection }: { multipleSelection: boolean } = { multipleSelection: false },
  ): void {
    if (!multipleSelection) {
      this.selectedItems.clear()
    }

    for (const item of items) {
      this.selectedItems.add(item.uuid)
    }

    this.notifyEventHandlerOfChangeInSelection(items)
  }

  deselectItems(items: { uuid: SupportedItem['uuid']; content_type: SupportedItem['content_type'] }[]): void {
    for (const item of items) {
      this.selectedItems.delete(item.uuid)
    }

    this.notifyEventHandlerOfChangeInSelection(items)
  }

  private notifyEventHandlerOfChangeInSelection(
    concernedItems: { uuid: SupportedItem['uuid']; content_type: SupportedItem['content_type'] }[],
  ): void {
    if (concernedItems.some((item) => item.content_type === ContentType.Note)) {
      this.eventHandler?.onSelectedNotes(this.getSelectedNotes())
    }

    if (concernedItems.some((item) => FolderContentTypes.includes(item.content_type))) {
      this.eventHandler?.onSelectedFolders(this.getSelectedFolders())
    }

    if (concernedItems.some((item) => item.content_type === ContentType.File)) {
      this.eventHandler?.onSelectedFiles(this.getSelectedFiles())
    }
  }

  getNotes(): SNNote[] {
    return this.notes
  }

  getFolders(): Folder[] {
    return this.folders
  }

  getFiles(): FileItem[] {
    return this.files
  }

  getNotesAndFiles(): (SNNote | FileItem)[] {
    assert(this.config.supportsFileNavigation)

    return this.navigationDisplayController.items()
  }

  private allSelectedItems(): SupportedItem[] {
    const uuids = Array.from(this.selectedItems.values())

    const items: SupportedItem[] = []
    for (const uuid of uuids) {
      const item = this.items.findItem(uuid)
      if (item) {
        items.push(item as SupportedItem)
      }
    }

    return items
  }

  getSelectedNotes(): SNNote[] {
    return this.allSelectedItems().filter(isNote)
  }

  getSelectedNotesAndFiles(): (SNNote | FileItem)[] {
    const allSelected = this.allSelectedItems()
    return [...allSelected.filter(isNote), ...allSelected.filter(isFile)]
  }

  getSelectedFolders(): Folder[] {
    return this.allSelectedItems().filter(isFolder)
  }

  getSelectedFiles(): FileItem[] {
    return this.allSelectedItems().filter(isFile)
  }

  getFilesForSelectedNotes(): FileItem[] {
    const selectedNotes = this.getSelectedNotes()

    const files: FileItem[] = []
    for (const note of selectedNotes) {
      extendArray(files, this.items.getFilesForNote(note))
    }

    return files
  }

  private reloadDisplayOptions(): void {
    if (this.lastDisplayOptions) {
      this.setDisplayOptions(this.lastDisplayOptions)

      this.reloadNotesAndNotify()
    }
  }

  setDisplayOptions(options: NavigationDisplayOptions): void {
    const override: FilterDisplayOptions = {}

    const selectedFolders = this.getSelectedFolders()
    const tags = selectedFolders.filter(isTag)
    const views = selectedFolders.filter(isSmartView)

    if (views.find((view) => view.uuid === SystemViewId.AllNotes)) {
      if (options.includeArchived == undefined) {
        override.includeArchived = false
      }
      if (options.includeTrashed == undefined) {
        override.includeTrashed = false
      }
    }
    if (views.find((view) => view.uuid === SystemViewId.ArchivedNotes)) {
      if (options.includeTrashed == undefined) {
        override.includeTrashed = false
      }
    }
    if (views.find((view) => view.uuid === SystemViewId.TrashedNotes)) {
      if (options.includeArchived == undefined) {
        override.includeArchived = true
      }
    }

    this.rebuildSystemSmartViews({ ...options, ...override })

    const updatedOptions: DisplayOptions = {
      ...options,
      ...override,
      ...{
        tags: tags,
        views: views,
      },
    }

    this.lastDisplayOptions = updatedOptions

    this.navigationDisplayController.setDisplayOptions({
      customFilter: computeUnifiedFilterForDisplayOptions(updatedOptions, {
        elementsReferencingElement: this.items.itemsReferencingItem,
      }),
      ...updatedOptions,
    })
  }

  private rebuildSystemSmartViews(criteria: FilterDisplayOptions): SmartView[] {
    this.systemSmartViews = BuildSmartViews(criteria, this.config)

    this.items.registerGlobalSmartViews(this.systemSmartViews)

    return this.systemSmartViews
  }

  get allNotesSmartView(): SmartView {
    return this.systemSmartViews.find((tag) => tag.uuid === SystemViewId.AllNotes) as SmartView
  }

  get archivedSmartView(): SmartView {
    return this.systemSmartViews.find((tag) => tag.uuid === SystemViewId.ArchivedNotes) as SmartView
  }

  get trashSmartView(): SmartView {
    return this.systemSmartViews.find((tag) => tag.uuid === SystemViewId.TrashedNotes) as SmartView
  }

  get untaggedNotesSmartView(): SmartView {
    return this.systemSmartViews.find((tag) => tag.uuid === SystemViewId.UntaggedNotes) as SmartView
  }
}
