import { ClientDisplayableError } from '@standardnotes/responses'
import { EncryptedFileInterface } from '../Types'
import { FilesServerInterface } from '../FilesServerInterface'

export type AbortSignal = 'aborted'
export type AbortFunction = () => void

export const Deferred = <T>() => {
  let resolve!: (value: T | PromiseLike<T>) => void
  let reject!: () => void

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return {
    resolve,
    reject,
    promise,
  }
}

export class FileDownloader {
  private aborted = false
  private abortDeferred = Deferred<AbortSignal>()

  constructor(
    private file: EncryptedFileInterface,
    private apiToken: string,
    private apiService: FilesServerInterface,
    private onEncryptedBytes?: (encryptedBytes: Uint8Array, abort: AbortFunction) => Promise<void>,
  ) {}

  public async download(): Promise<ClientDisplayableError | AbortSignal | undefined> {
    const chunkIndex = 0
    const startRange = 0

    const result = await Promise.race([
      this.abortDeferred.promise,
      this.apiService.downloadFile(this.file, chunkIndex, this.apiToken, startRange, async (bytes) => {
        if (!this.aborted && this.onEncryptedBytes) {
          await this.onEncryptedBytes(bytes, this.abort)
        }
      }),
    ])

    return result
  }

  public abort(): void {
    this.aborted = true

    this.abortDeferred.resolve('aborted')

    this.onEncryptedBytes = undefined
  }
}
