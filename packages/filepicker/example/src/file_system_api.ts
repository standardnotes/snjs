import { StreamingFileReader, StreamingFileSaver } from '../../../filepicker'
import { SNApplication, ContentType, SNFile } from '../../../snjs'

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

    const reader = new StreamingFileReader(
      2_000_000,
      async (chunk, index, isLast) => {
        await this.application.fileService.pushBytesForUpload(
          operation,
          chunk,
          index,
          isLast,
        )
      },
    )
    reader.loggingEnabled = true
    const fileResult = await reader.selectFileAndStream()

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

    const file = this.application
      .getItems<SNFile>(ContentType.File)
      .find((file) => file.remoteIdentifier === this.remoteIdentifier)

    const saver = new StreamingFileSaver(file.nameWithExt)
    await saver.selectFileToSaveTo()
    saver.loggingEnabled = true

    await this.application.fileService.downloadFile(
      file,
      async (decryptedBytes: Uint8Array) => {
        console.log(`Pushing ${decryptedBytes.length} decrypted bytes to disk`)
        await saver.pushBytes(decryptedBytes)
      },
    )
    console.log('Closing file saver reader')
    await saver.finish()

    console.log('Successfully downloaded and decrypted file!')
  }
}
