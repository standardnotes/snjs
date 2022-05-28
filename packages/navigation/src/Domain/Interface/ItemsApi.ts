import { ItemManagerInterface } from '@standardnotes/services'

export interface ItemsApiForNavigationController {
  addObserver: ItemManagerInterface['addObserver']
  createDisplayController: ItemManagerInterface['createDisplayController']
  getFilesForNote: ItemManagerInterface['getFilesForNote']
  itemsReferencingItem: ItemManagerInterface['itemsReferencingItem']
  findItem: ItemManagerInterface['findItem']
}
