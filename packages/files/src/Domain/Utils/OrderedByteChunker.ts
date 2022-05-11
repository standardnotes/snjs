export class OrderedByteChunker {
  private bytes = new Uint8Array()
  private index = 1
  private remainingChunks: number[] = []

  constructor(
    chunkSizes: number[],
    private onChunk: (chunk: Uint8Array, index: number, isLast: boolean) => Promise<void>,
  ) {
    this.remainingChunks = chunkSizes.slice()
  }

  public async addBytes(bytes: Uint8Array, isLast: boolean): Promise<void> {
    this.bytes = new Uint8Array([...this.bytes, ...bytes])

    if (this.bytes.length >= this.remainingChunks[0] || isLast) {
      await this.popBytes(isLast)
    }
  }

  private async popBytes(isLast: boolean): Promise<void> {
    const readUntil = this.remainingChunks[0]

    const chunk = this.bytes.slice(0, readUntil)

    this.bytes = new Uint8Array([...this.bytes.slice(readUntil)])

    this.remainingChunks.shift()

    await this.onChunk(chunk, this.index++, isLast)
  }
}
