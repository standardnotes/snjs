/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ItemsApiForNavigationController } from './../Interface/ItemsApi'
import { NavigationControllerInterface } from './../Interface/NavigationControllerInterface'
import { NavigationController } from './NavigationController'
import { NavigationEventHandler } from '../Interface/EventHandler'
import { FileItem, SNNote } from '@standardnotes/models'
import { Folder } from '../Interface/Types'

describe('navigation controller', () => {
  let itemManager: ItemsApiForNavigationController
  let defaultEventHandler: NavigationEventHandler

  const createController = (eventHandler: NavigationEventHandler): NavigationControllerInterface => {
    return new NavigationController(itemManager, { supportsFileNavigation: true }, eventHandler)
  }

  beforeEach(() => {
    itemManager = {} as jest.Mocked<ItemsApiForNavigationController>
    itemManager.addObserver = jest.fn()
    itemManager.createDisplayController = jest.fn()
    itemManager.getFilesForNote = jest.fn()
    itemManager.itemsReferencingItem = jest.fn()
    itemManager.findItem = jest.fn()

    defaultEventHandler = {
      onNotes(_notes: SNNote[]) {},
      onFolders(_tags: Folder[]) {},
      onFiles(_files: FileItem[]) {},

      onSelectedNotes(_selectedNotes: SNNote[]) {},
      onSelectedFolders(_selectedFolders: Folder[]) {},
      onSelectedFiles(_selectedFiles: FileItem[]) {},
    }
  })

  it('passes', () => {
    createController(defaultEventHandler)
  })
})
