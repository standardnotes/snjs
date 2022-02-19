var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ContentType } from '../../../snjs';
import { StreamingFilePicker } from '../../../filepicker';
export class FileSystemApi {
    constructor(application) {
        this.application = application;
        this.uploadFile = () => __awaiter(this, void 0, void 0, function* () {
            const operation = yield this.application.fileService.beginNewFileUpload();
            const picker = new StreamingFilePicker();
            const fileResult = yield picker.selectFileAndStream((chunk, index, isLast) => __awaiter(this, void 0, void 0, function* () {
                yield this.application.fileService.pushBytesForUpload(operation, chunk, index, isLast);
            }));
            const fileObj = yield this.application.fileService.finishUpload(operation, fileResult.name, fileResult.ext);
            this.remoteIdentifier = fileObj.remoteIdentifier;
            this.downloadButton.style.display = '';
            return fileObj;
        });
        this.downloadFile = () => __awaiter(this, void 0, void 0, function* () {
            console.log('Downloading file', this.remoteIdentifier);
            const file = this.application['itemManager']
                .getItems(ContentType.File)
                .find((file) => file.remoteIdentifier === this.remoteIdentifier);
            const picker = new StreamingFilePicker();
            const { pusher, closer } = yield picker.saveFile();
            yield this.application.fileService.downloadFile(file, (decryptedBytes) => __awaiter(this, void 0, void 0, function* () {
                console.log(`Pushing ${decryptedBytes.length} decrypted bytes to disk`);
                yield pusher(decryptedBytes);
            }));
            console.log('Closing file saver reader');
            yield closer();
            console.log('Successfully downloaded and decrypted file!');
        });
        this.configureFilePicker();
        this.configureDownloadButton();
    }
    get downloadButton() {
        return document.getElementById('downloadButton');
    }
    configureDownloadButton() {
        this.downloadButton.onclick = this.downloadFile;
        this.downloadButton.style.display = 'none';
    }
    configureFilePicker() {
        const button = document.getElementById('fileSystemUploadButton');
        button.onclick = this.uploadFile;
        console.log('File picker ready.');
    }
}
