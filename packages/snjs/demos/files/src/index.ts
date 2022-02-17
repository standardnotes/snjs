import { ContentType } from '../../../../common';
import {
  SNApplication,
  Environment,
  Platform,
  SNLog,
  SNFile,
  Runtime,
  ApplicationOptionsDefaults,
} from '../../../';
import WebDeviceInterface from './web_device_interface';
import { SNWebCrypto } from '../../../../sncrypto-web';

SNLog.onLog = console.log;
SNLog.onError = console.error;

console.log('Clearing localStorage...');
localStorage.clear();

/**
 * Important:
 * If reusing e2e docker servers, you must edit docker/auth.env ACCESS_TOKEN_AGE
 * and REFRESH_TOKEN_AGE and increase their ttl.
 */

const host = 'http://localhost:3123';
const filesHost = 'http://localhost:3125';
const mocksHost = 'http://localhost:3124';

const application = new SNApplication(
  Environment.Web,
  Platform.MacWeb,
  new WebDeviceInterface(),
  new SNWebCrypto(),
  {
    confirm: async () => true,
    alert: async () => {},
    blockingDialog: () => () => {},
  },
  `${Math.random()}`,
  [],
  host,
  filesHost,
  '1.0.0',
  undefined,
  Runtime.Dev,
  {
    ...ApplicationOptionsDefaults,
    filesChunkSize: 1_000_000,
  }
);

const fileService = application['fileService'];

console.log('Created application', application);

export async function publishMockedEvent(eventType: string, eventPayload: any) {
  await fetch(`${mocksHost}/events`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eventType,
      eventPayload,
    }),
  });
}

const run = async () => {
  console.log('Preparing for launch...');
  await application.prepareForLaunch({
    receiveChallenge: () => {},
  });
  await application.launch();
  console.log('Application launched...');

  const email = String(Math.random());
  const password = String(Math.random());

  console.log('Registering account...');
  await application.register(email, password);
  console.log(
    `Registered account ${email}/${password}. Be sure to edit docker/auth.env to increase session TTL.`
  );

  console.log('Creating mock subscription...');
  await publishMockedEvent('SUBSCRIPTION_PURCHASED', {
    userEmail: email,
    subscriptionId: 1,
    subscriptionName: 'PLUS_PLAN',
    subscriptionExpiresAt: (new Date().getTime() + 3_600_000) * 1_000,
    timestamp: Date.now(),
    offline: false,
  });
  console.log('Successfully created mock subscription...');

  openFilePicker();
};

function openFilePicker() {
  const input = document.getElementById('filePicker') as HTMLInputElement;
  input.type = 'file';
  input.onchange = (event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files[0];
    handleFileSelect(file);
  };

  console.log('File picker ready.');
}

async function handleFileSelect(inputFile: File) {
  const file = await uploadFile(inputFile);

  const bytes = await downloadFileBytes(file.remoteIdentifier);

  saveFileBytesToDisk(`${file.name}.${file.ext}`, bytes);
}

async function readFile(file: File): Promise<Uint8Array> {
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  return new Promise((resolve) => {
    reader.onload = (readerEvent) => {
      const content = readerEvent.target.result as ArrayBuffer;
      resolve(new Uint8Array(content));
    };
  });
}

const uploadFile = async (file: File) => {
  console.log('Uploading file', file.name);
  const chunkSize = application.options.filesChunkSize;
  const operation = await fileService.beginNewFileUpload();
  const buffer = await readFile(file);

  let chunkId = 1;
  for (let i = 0; i < buffer.length; i += chunkSize) {
    const readUntil =
      i + chunkSize > buffer.length ? buffer.length : i + chunkSize;
    const chunk = buffer.slice(i, readUntil);
    const isFinalChunk = readUntil === buffer.length;

    console.log(`Pushing ${chunk.length} bytes`);
    const bytesUploadedSuccessfully = await fileService.pushBytesForUpload(
      operation,
      chunk,
      chunkId++,
      isFinalChunk
    );
    if (!bytesUploadedSuccessfully) {
      throw new Error('Could not upload file chunk');
    }
  }

  const pattern = /(?:\.([^.]+))?$/;
  const ext = pattern.exec(file.name)[1];
  const fileObj = await fileService.finishUpload(
    operation,
    file.name.split('.')[0],
    ext
  );

  console.log('Successfully uploaded file!');

  return fileObj;
};

const downloadFileBytes = async (remoteIdentifier: string) => {
  console.log('Downloading file', remoteIdentifier);
  const file = application['itemManager']
    .getItems(ContentType.File)
    .find((file: SNFile) => file.remoteIdentifier === remoteIdentifier);

  let receivedBytes = new Uint8Array();

  await fileService.downloadFile(file, (decryptedBytes: Uint8Array) => {
    console.log(`Downloaded ${decryptedBytes.length} bytes`);
    receivedBytes = new Uint8Array([...receivedBytes, ...decryptedBytes]);
  });

  console.log('Successfully downloaded and decrypted file!');

  return receivedBytes;
};

const saveFileBytesToDisk = (name: string, bytes: Uint8Array) => {
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

run();
