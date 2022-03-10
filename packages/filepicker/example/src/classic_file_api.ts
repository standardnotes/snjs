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

    const files = await ClassicFileReader.selectFiles()
    for (const file of files) {
      const fileResult = await ClassicFileReader.readFile(
        file,
        2_000_000,
        async (chunk, index, isLast) => {
          if (index === 1) {
            operation = await this.application.files.beginNewFileUpload()
          }
          await this.application.files.pushBytesForUpload(operation, chunk, index, isLast)
        },
      )
      const snFile = await this.application.files.finishUpload(
        operation,
        fileResult.name,
        fileResult.ext,
      )

      const bytes = await this.downloadFileBytes(snFile.remoteIdentifier)

      new ClassicFileSaver().saveFile(`${snFile.name}.${snFile.ext}`, bytes)
    }
  }

  downloadFileBytes = async (remoteIdentifier: string): Promise<Uint8Array> => {
    console.log('Downloading file', remoteIdentifier)
    const file = this.application['itemManager']
      .getItems(ContentType.File)
      .find((file: SNFile) => file.remoteIdentifier === remoteIdentifier)

    let receivedBytes = new Uint8Array()

    await this.application.files.downloadFile(file, (decryptedBytes: Uint8Array) => {
      console.log(`Downloaded ${decryptedBytes.length} bytes`)
      receivedBytes = new Uint8Array([...receivedBytes, ...decryptedBytes])
    })

    console.log('Successfully downloaded and decrypted file!')

    return receivedBytes
  }
}
