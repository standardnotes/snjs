import { ClassicFilePicker, OnChunkCallback, FileSelectionResponse } from './types';
export declare class ClassicFileApi implements ClassicFilePicker {
    private file;
    private chunkSize;
    private loggingEnabled;
    constructor(file: File, chunkSize: number);
    private log;
    private readFile;
    selectFileAndSplit(onChunk: OnChunkCallback): Promise<FileSelectionResponse>;
    saveFile(name: string, bytes: Uint8Array): Promise<void>;
}
