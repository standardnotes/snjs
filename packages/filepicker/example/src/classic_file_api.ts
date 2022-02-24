import { SNApplication, ContentType, SNFile } from '../../../snjs'
import { ClassicFilePicker } from '../../../filepicker'

export class ClassicFileApi {
  constructor(private application: SNApplication) {
    this.configureFilePicker()
  }

  configureFilePicker(): void {
    const input = document.getElementById('filePicker') as HTMLInputElement
    input.type = 'file'
    input.onchange = (event) => {
      const target = event.target as HTMLInputElement
      const file = target.files[0]
      void this.handleFileSelect(file)
    }

    console.log('Classic file picker ready.')
  }

  async handleFileSelect(inputFile: File): Promise<void> {
    const filePicker = new ClassicFilePicker(inputFile, 100_000)

    const operation = await this.application.fileService.beginNewFileUpload()
    const fileResult = await filePicker.readFileAndSplit(
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

    const bytes = await this.downloadFileBytes(fileObj.remoteIdentifier)

    await filePicker.saveFile(`${fileObj.name}.${fileObj.ext}`, bytes)
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
