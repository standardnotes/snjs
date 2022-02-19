import { StreamingFilePicker, OnChunkCallback, FileSelectionResponse, ChunkDiskPusher } from './types';
/**
 * The File System Access API File Picker
 * https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
 */
export declare class FSAAFilePicker implements StreamingFilePicker {
    private uploadHandle;
    private downloadHandle;
    private loggingEnabled;
    private log;
    selectFileAndStream(onChunk: OnChunkCallback): Promise<FileSelectionResponse>;
    saveFile(): Promise<ChunkDiskPusher>;
}
