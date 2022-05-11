import { FileSystemApi, DirectoryHandle, FileHandle } from '@standardnotes/services';

export class MockFileSysten implements FileSystemApi {
  selectedDirectory!: string;
  createdDirectories: string[] = [];
  createdFiles: string[] = [];

  selectDirectory(): Promise<DirectoryHandle> {
    this.selectedDirectory = '/Users/Backups';
    return Promise.resolve(this.selectedDirectory);
  }

  async createFile(directory: DirectoryHandle, name: string): Promise<FileHandle> {
    const file = `${directory}/${name}`;
    this.createdFiles.push(file);
    return { nativeHandle: Promise.resolve(file), writableStream: {} };
  }

  createDirectory(parentDirectory: DirectoryHandle, name: string): Promise<DirectoryHandle> {
    const newDirectory = `${parentDirectory}/${name}`;
    this.createdDirectories.push(newDirectory);
    return Promise.resolve(newDirectory);
  }

  async saveBytes(): Promise<'success' | 'failed'> {
    return 'success';
  }

  async saveString(): Promise<'success' | 'failed'> {
    return 'success';
  }

  async closeFileHandle(): Promise<'success' | 'failed'> {
    return 'success';
  }
}
