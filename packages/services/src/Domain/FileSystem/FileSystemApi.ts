/* eslint-disable @typescript-eslint/no-empty-interface */
export interface DirectoryHandle {}
export interface FileHandle {
  nativeHandle: unknown
  writableStream: unknown
}

export type FileSystemResult = 'aborted' | 'success' | 'failed'
export type FileSystemNoSelection = 'aborted' | 'failed'

export interface FileSystemApi {
  selectDirectory(): Promise<DirectoryHandle | FileSystemNoSelection>
  createDirectory(parentDirectory: DirectoryHandle, name: string): Promise<DirectoryHandle | FileSystemNoSelection>
  createFile(directory: DirectoryHandle, name: string): Promise<FileHandle | FileSystemNoSelection>
  saveBytes(file: FileHandle, bytes: Uint8Array): Promise<'success' | 'failed'>
  saveString(file: FileHandle, contents: string): Promise<'success' | 'failed'>
  closeFileHandle(file: FileHandle): Promise<'success' | 'failed'>
}
