import { SNApplication, ContentType, SNFile } from '../../../';

export class FileSystemApi {
  private uploadHandle!: FileSystemFileHandle;
  private downloadHandle!: FileSystemFileHandle;
  private remoteIdentifier!: string;

  constructor(private application: SNApplication) {
    this.configureFilePicker();
    this.configureDownloadButton();
  }

  get downloadButton() {
    return document.getElementById('downloadButton') as HTMLButtonElement;
  }

  configureDownloadButton() {
    this.downloadButton.onclick = this.downloadFile;
    this.downloadButton.style.display = 'none';
  }

  configureFilePicker() {
    const button = document.getElementById(
      'fileSystemUploadButton'
    ) as HTMLButtonElement;
    button.onclick = this.uploadFile;
    console.log('File picker ready.');
  }

  uploadFile = async () => {
    const operation = await this.application.fileService.beginNewFileUpload();

    this.uploadHandle = (await window.showOpenFilePicker())[0];

    const file = await this.uploadHandle.getFile();
    console.log('Uploading file', file.name);

    const stream = (file.stream() as unknown) as ReadableStream;

    const reader = stream.getReader();

    let chunkId = 1;

    let previousChunk: Uint8Array;

    const processChunk = async ({ done, value }) => {
      if (done) {
        console.log('Pushing final chunk', previousChunk.length);
        await this.application.fileService.pushBytesForUpload(
          operation,
          previousChunk,
          chunkId,
          true
        );
        return;
      }

      if (previousChunk) {
        console.log('Pushing chunk', previousChunk.length);
        await this.application.fileService.pushBytesForUpload(
          operation,
          previousChunk,
          chunkId,
          false
        );
        chunkId++;
      }

      previousChunk = value;

      return reader.read().then(processChunk);
    };

    await reader.read().then(processChunk);

    const pattern = /(?:\.([^.]+))?$/;
    const ext = pattern.exec(file.name)[1];
    const fileObj = await this.application.fileService.finishUpload(
      operation,
      file.name.split('.')[0],
      ext
    );

    this.remoteIdentifier = fileObj.remoteIdentifier;

    this.downloadButton.style.display = '';

    console.log('Successfully uploaded file!');

    return fileObj;
  };

  downloadFile = async () => {
    console.log('Downloading file', this.remoteIdentifier);

    this.downloadHandle = await window.showSaveFilePicker();

    const file = this.application['itemManager']
      .getItems(ContentType.File)
      .find((file: SNFile) => file.remoteIdentifier === this.remoteIdentifier);

    const writableStream = await this.downloadHandle.createWritable();

    await this.application.fileService.downloadFile(
      file,
      (decryptedBytes: Uint8Array) => {
        console.log(`Downloaded ${decryptedBytes.length} bytes`);
        writableStream.write(decryptedBytes);
      }
    );
    await writableStream.close();

    console.log('Successfully downloaded and decrypted file!');
  };
}
