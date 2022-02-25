import { SNApplication, ContentType, SNFile } from '../../../snjs'
import { ClassicFileReader, ClassicFileSaver } from '../../../filepicker'

export class ClassicFileApi {
  constructor(private application: SNApplication) {
    this.configureFilePicker()
  }

  configureFilePicker(): void {
    const input = document.getElementById('filePicker') as HTMLInputElement
    input.onclick = () => {
      void this.openFilePicker()
    }
    console.log('Classic file picker ready.')
  }

  async openFilePicker(): Promise<void> {
    let operation
    const filePicker = new ClassicFileReader(
      2_000_000,
      async (chunk, index, isLast) => {
        if (index === 1) {
          operation = await this.application.fileService.beginNewFileUpload()
        }
        await this.application.fileService.pushBytesForUpload(
          operation,
          chunk,
          index,
          isLast,
        )
      },
    )
    filePicker.loggingEnabled = true
    const fileResult = await filePicker.selectFileAndStream()
    const fileObj = await this.application.fileService.finishUpload(
      operation,
      fileResult.name,
      fileResult.ext,
    )

    const bytes = await this.downloadFileBytes(fileObj.remoteIdentifier)

    new ClassicFileSaver().saveFile(`${fileObj.name}.${fileObj.ext}`, bytes)
  }

  downloadFileBytes = async (remoteIdentifier: string): Promise<Uint8Array> => {
    console.log('Downloading file', remoteIdentifier)
    const file = this.application['itemManager']
      .getItems(ContentType.File)
      .find((file: SNFile) => file.remoteIdentifier === remoteIdentifier)

    let receivedBytes = new Uint8Array()

    await this.application.fileService.downloadFile(
      file,
      (decryptedBytes: Uint8Array) => {
        console.log(`Downloaded ${decryptedBytes.length} bytes`)
        receivedBytes = new Uint8Array([...receivedBytes, ...decryptedBytes])
      },
    )

    console.log('Successfully downloaded and decrypted file!')

    return receivedBytes
  }
}
