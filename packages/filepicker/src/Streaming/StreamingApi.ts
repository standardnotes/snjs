import { FileSystemApi, DirectoryHandle, FileHandle, FileSystemNoSelection } from '@standardnotes/services'

interface WebDirectoryHandle extends DirectoryHandle, FileSystemDirectoryHandle {}
interface WebFileHandle extends FileHandle {
  nativeHandle: FileSystemFileHandle
  writableStream: FileSystemWritableFileStream
}

export class StreamingFileApi implements FileSystemApi {
  selectDirectory(): Promise<DirectoryHandle> {
    return window.showDirectoryPicker()
  }

  async createFile(directory: WebDirectoryHandle, name: string): Promise<WebFileHandle> {
    const nativeHandle = await directory.getFileHandle(name, { create: true })
    const writableStream = await nativeHandle.createWritable()

    return {
      nativeHandle,
      writableStream,
    }
  }

  createDirectory(
    parentDirectory: WebDirectoryHandle,
    name: string,
  ): Promise<WebDirectoryHandle | FileSystemNoSelection> {
    return parentDirectory.getDirectoryHandle(name, { create: true })
  }

  async saveBytes(file: WebFileHandle, bytes: Uint8Array): Promise<'success' | 'failed'> {
    await file.writableStream.write(bytes)

    return 'success'
  }

  async saveString(file: WebFileHandle, contents: string): Promise<'success' | 'failed'> {
    await file.writableStream.write(contents)

    return 'success'
  }

  async closeFileHandle(file: WebFileHandle): Promise<'success' | 'failed'> {
    await file.writableStream.close()

    return 'success'
  }
}
