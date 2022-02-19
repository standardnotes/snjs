import { SNApplication, SNFile } from '../../../snjs';
export declare class FileSystemApi {
    private application;
    private remoteIdentifier;
    constructor(application: SNApplication);
    get downloadButton(): HTMLButtonElement;
    configureDownloadButton(): void;
    configureFilePicker(): void;
    uploadFile: () => Promise<SNFile>;
    downloadFile: () => Promise<void>;
}
