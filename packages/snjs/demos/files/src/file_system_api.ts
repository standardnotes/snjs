import { SNApplication, ContentType, SNFile } from '../../../';

export class FileSystemApi {
  private handle!: FileSystemFileHandle;
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
    const input = document.getElementById('filePicker') as HTMLInputElement;
    input.type = 'file';
    input.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files[0];
      this.handleFileSelect(file);
    };

    console.log('File picker ready.');
  }

  async handleFileSelect(inputFile: File) {
    const file = await this.uploadFile(inputFile);
    this.remoteIdentifier = file.remoteIdentifier;
    this.downloadButton.style.display = '';
  }

  async readFile(file: File): Promise<Uint8Array> {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    return new Promise((resolve) => {
      reader.onload = (readerEvent) => {
        const content = readerEvent.target.result as ArrayBuffer;
        resolve(new Uint8Array(content));
      };
    });
  }

  uploadFile = async (file: File) => {
    console.log('Uploading file', file.name);
    const chunkSize = this.application.options.filesChunkSize;
    const operation = await this.application[
      'fileService'
    ].beginNewFileUpload();
    const buffer = await this.readFile(file);

    let chunkId = 1;
    for (let i = 0; i < buffer.length; i += chunkSize) {
      const readUntil =
        i + chunkSize > buffer.length ? buffer.length : i + chunkSize;
      const chunk = buffer.slice(i, readUntil);
      const isFinalChunk = readUntil === buffer.length;

      console.log(`Pushing ${chunk.length} bytes`);
      const bytesUploadedSuccessfully = await this.application[
        'fileService'
      ].pushBytesForUpload(operation, chunk, chunkId++, isFinalChunk);
      if (!bytesUploadedSuccessfully) {
        throw new Error('Could not upload file chunk');
      }
    }

    const pattern = /(?:\.([^.]+))?$/;
    const ext = pattern.exec(file.name)[1];
    const fileObj = await this.application['fileService'].finishUpload(
      operation,
      file.name.split('.')[0],
      ext
    );

    console.log('Successfully uploaded file!');

    return fileObj;
  };

  downloadFile = async () => {
    console.log('Downloading file', this.remoteIdentifier);

    this.handle = await window.showSaveFilePicker();

    const file = this.application['itemManager']
      .getItems(ContentType.File)
      .find((file: SNFile) => file.remoteIdentifier === this.remoteIdentifier);

    const writableStream = await this.handle.createWritable();

    await this.application['fileService'].downloadFile(
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
