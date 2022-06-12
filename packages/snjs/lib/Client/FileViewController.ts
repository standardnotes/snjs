import { FileItem } from '@standardnotes/models'
import { ContentType } from '@standardnotes/common'
import { SNApplication } from '../Application/Application'
import { ItemViewController } from './ItemViewControllerInterface'

export class FileViewController implements ItemViewController {
  public item: FileItem
  public dealloced = false
  private removeStreamObserver?: () => void

  constructor(private application: SNApplication, fileItem: FileItem) {
    this.item = fileItem
  }

  deinit() {
    this.dealloced = true
    this.removeStreamObserver?.()
    ;(this.removeStreamObserver as unknown) = undefined
    ;(this.application as unknown) = undefined
    ;(this.item as unknown) = undefined
  }

  async initialize() {
    this.streamItems()
  }

  private streamItems() {
    this.removeStreamObserver = this.application.streamItems<FileItem>(ContentType.File, ({ changed, inserted }) => {
      const files = changed.concat(inserted)

      const matchingFile = files.find((item) => {
        return item.uuid === this.item.uuid
      })

      if (matchingFile) {
        this.item = matchingFile
      }
    })
  }
}
