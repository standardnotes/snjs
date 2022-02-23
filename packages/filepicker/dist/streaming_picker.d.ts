import { StreamingFilePickerInterface, OnChunkCallback, FileSelectionResponse, ChunkDiskPusher, ChunkDiskCloser } from './types';
/**
 * The File System Access API File Picker
 * https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
 */
export declare class StreamingFilePicker implements StreamingFilePickerInterface {
    private loggingEnabled;
    private log;
    static available(): boolean;
    selectFileAndStream(onChunk: OnChunkCallback): Promise<FileSelectionResponse>;
    saveFile(name: string): Promise<{
        pusher: ChunkDiskPusher;
        closer: ChunkDiskCloser;
    }>;
}
