import { SNApplication, ContentType, SNFile } from '../../../';

export class ClassicFileApi {
  constructor(private application: SNApplication) {
    this.configureFilePicker();
  }

  configureFilePicker() {
    const input = document.getElementById('filePicker') as HTMLInputElement;
    input.type = 'file';
    input.onchange = (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files[0];
      this.handleFileSelect(file);
    };

    console.log('Classic file picker ready.');
  }

  async handleFileSelect(inputFile: File) {
    const file = await this.uploadFile(inputFile);

    const bytes = await this.downloadFileBytes(file.remoteIdentifier);

    this.saveFileBytesToDisk(`${file.name}.${file.ext}`, bytes);
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

  downloadFileBytes = async (remoteIdentifier: string) => {
    console.log('Downloading file', remoteIdentifier);
    const file = this.application['itemManager']
      .getItems(ContentType.File)
      .find((file: SNFile) => file.remoteIdentifier === remoteIdentifier);

    let receivedBytes = new Uint8Array();

    await this.application['fileService'].downloadFile(
      file,
      (decryptedBytes: Uint8Array) => {
        console.log(`Downloaded ${decryptedBytes.length} bytes`);
        receivedBytes = new Uint8Array([...receivedBytes, ...decryptedBytes]);
      }
    );

    console.log('Successfully downloaded and decrypted file!');

    return receivedBytes;
  };

  saveFileBytesToDisk = (name: string, bytes: Uint8Array) => {
    console.log('Saving file to disk...');
    const link = document.createElement('a');
    const blob = new Blob([bytes], {
      type: 'text/plain;charset=utf-8',
    });
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', name);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(link.href);
  };
}
