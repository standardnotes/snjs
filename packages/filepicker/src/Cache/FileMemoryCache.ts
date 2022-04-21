import { removeFromArray } from '@standardnotes/utils'
import { Uuid } from '@standardnotes/common'

export class FileMemoryCache {
  private cache: Record<Uuid, Uint8Array> = {}
  private orderedQueue: Uuid[] = []

  constructor(public readonly maxSize: number) {}

  add(uuid: Uuid, data: Uint8Array): boolean {
    if (data.length > this.maxSize) {
      return false
    }

    while (this.size + data.length > this.maxSize) {
      this.remove(this.orderedQueue[0])
    }

    this.cache[uuid] = data

    this.orderedQueue.push(uuid)

    return true
  }

  get size(): number {
    return Object.values(this.cache)
      .map((bytes) => bytes.length)
      .reduce((total, fileLength) => total + fileLength, 0)
  }

  get(uuid: Uuid): Uint8Array | undefined {
    return this.cache[uuid]
  }

  remove(uuid: Uuid): void {
    delete this.cache[uuid]

    removeFromArray(this.orderedQueue, uuid)
  }

  clear(): void {
    this.cache = {}

    this.orderedQueue = []
  }
}
