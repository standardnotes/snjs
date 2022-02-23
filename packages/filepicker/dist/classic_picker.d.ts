import { ClassicFilePickerInterface, OnChunkCallback, FileSelectionResponse } from './types';
export declare class ClassicFilePicker implements ClassicFilePickerInterface {
    private file;
    private chunkSize;
    private loggingEnabled;
    constructor(file: File, chunkSize: number);
    private log;
    private readFile;
    readFileAndSplit(onChunk: OnChunkCallback): Promise<FileSelectionResponse>;
    saveFile(name: string, bytes: Uint8Array): Promise<void>;
}
