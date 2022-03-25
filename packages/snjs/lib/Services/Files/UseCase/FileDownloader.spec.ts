import { RemoteFileInterface, EncryptedFileInterface } from '../types'
import { FilesServerInterface } from '../FilesServerInterface'
import { FileDownloader } from './FileDownloader'

describe('file downloader', () => {
  let apiService: FilesServerInterface
  let downloader: FileDownloader
  let file: RemoteFileInterface & EncryptedFileInterface
  const numChunks = 5

  beforeEach(() => {
    apiService = {} as jest.Mocked<FilesServerInterface>
    apiService.downloadFile = jest
      .fn()
      .mockImplementation(
        (
          _file: string,
          _chunkIndex: number,
          _apiToken: string,
          _rangeStart: number,
          onBytesReceived: (bytes: Uint8Array) => void,
        ) => {
          return new Promise<void>((resolve) => {
            for (let i = 0; i < numChunks; i++) {
              onBytesReceived(Uint8Array.from([0xaa]))
            }

            resolve()
          })
        },
      )

    file = {
      chunkSizes: [100_000],
      remoteIdentifier: '123',
      encryptionHeader: 'header',
      key: 'secret',
    }
  })

  it('should pass back bytes as they are received', async () => {
    let receivedBytes = new Uint8Array()

    downloader = new FileDownloader(file, 'api-token', apiService, async (encryptedBytes) => {
      receivedBytes = new Uint8Array([...receivedBytes, ...encryptedBytes])
    })

    expect(receivedBytes.length).toBe(0)

    await downloader.download()

    expect(receivedBytes.length).toEqual(numChunks)
  })
})
