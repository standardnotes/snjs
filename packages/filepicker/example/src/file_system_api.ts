import { SNApplication, ContentType, SNFile } from '../../../snjs'
import { StreamingFilePicker } from '../../../filepicker'

export class FileSystemApi {
  private remoteIdentifier!: string

  constructor(private application: SNApplication) {
    this.configureFilePicker()
    this.configureDownloadButton()
  }

  get downloadButton(): HTMLButtonElement {
    return document.getElementById('downloadButton') as HTMLButtonElement
  }

  configureDownloadButton(): void {
    this.downloadButton.onclick = this.downloadFile
    this.downloadButton.style.display = 'none'
  }

  configureFilePicker(): void {
    const button = document.getElementById(
      'fileSystemUploadButton',
    ) as HTMLButtonElement
    button.onclick = this.uploadFile
    console.log('File picker ready.')
  }

  uploadFile = async (): Promise<SNFile> => {
    const operation = await this.application.fileService.beginNewFileUpload()

    const picker = new StreamingFilePicker()
    const fileResult = await picker.selectFileAndStream(
      async (chunk, index, isLast) => {
        await this.application.fileService.pushBytesForUpload(
          operation,
          chunk,
          index,
          isLast,
        )
      },
    )

    const fileObj = await this.application.fileService.finishUpload(
      operation,
      fileResult.name,
      fileResult.ext,
    )

    this.remoteIdentifier = fileObj.remoteIdentifier
    this.downloadButton.style.display = ''

    return fileObj
  }

  downloadFile = async (): Promise<void> => {
    console.log('Downloading file', this.remoteIdentifier)

    const file = this.application['itemManager']
      .getItems(ContentType.File)
      .find((file: SNFile) => file.remoteIdentifier === this.remoteIdentifier)

    const picker = new StreamingFilePicker()
    const { pusher, closer } = await picker.saveFile()

    await this.application.fileService.downloadFile(
      file,
      async (decryptedBytes: Uint8Array) => {
        console.log(`Pushing ${decryptedBytes.length} decrypted bytes to disk`)
        await pusher(decryptedBytes)
      },
    )
    console.log('Closing file saver reader')
    await closer()

    console.log('Successfully downloaded and decrypted file!')
  }
}
