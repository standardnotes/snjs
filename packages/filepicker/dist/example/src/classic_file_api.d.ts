import { SNApplication } from '../../../snjs';
export declare class ClassicFileApi {
    private application;
    constructor(application: SNApplication);
    configureFilePicker(): void;
    handleFileSelect(inputFile: File): Promise<void>;
    downloadFileBytes: (remoteIdentifier: string) => Promise<Uint8Array>;
}
