import { RemoteFileInterface, ApiServiceInterface } from './../types';
import { FileDownloader } from './../workers/file_downloader';

describe('file downloader', () => {
  let apiService: ApiServiceInterface;
  let downloader: FileDownloader;
  let file: RemoteFileInterface;
  const numChunks = 5;

  beforeEach(() => {
    apiService = {} as jest.Mocked<ApiServiceInterface>;
    apiService.downloadFile = jest
      .fn()
      .mockImplementation(
        (_: string, onBytesReceived: (bytes: Uint8Array) => void) => {
          return new Promise<void>((resolve) => {
            for (let i = 0; i < numChunks; i++) {
              onBytesReceived(Uint8Array.from([0xaa]));
            }

            resolve();
          });
        }
      );

    file = {
      remoteIdentifier: '123',
    };
  });

  it('should pass back bytes as they are received', async () => {
    let receivedBytes = new Uint8Array();

    downloader = new FileDownloader(file, apiService, (encryptedBytes) => {
      receivedBytes = new Uint8Array([...receivedBytes, ...encryptedBytes]);
    });

    expect(receivedBytes.length).toBe(0);

    await downloader.download();

    expect(receivedBytes.length).toEqual(numChunks);
  });
});
