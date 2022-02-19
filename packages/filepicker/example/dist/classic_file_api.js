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
import { ClassicFilePicker } from '../../../filepicker';
export class ClassicFileApi {
    constructor(application) {
        this.application = application;
        this.downloadFileBytes = (remoteIdentifier) => __awaiter(this, void 0, void 0, function* () {
            console.log('Downloading file', remoteIdentifier);
            const file = this.application['itemManager']
                .getItems(ContentType.File)
                .find((file) => file.remoteIdentifier === remoteIdentifier);
            let receivedBytes = new Uint8Array();
            yield this.application.fileService.downloadFile(file, (decryptedBytes) => {
                console.log(`Downloaded ${decryptedBytes.length} bytes`);
                receivedBytes = new Uint8Array([...receivedBytes, ...decryptedBytes]);
            });
            console.log('Successfully downloaded and decrypted file!');
            return receivedBytes;
        });
        this.configureFilePicker();
    }
    configureFilePicker() {
        const input = document.getElementById('filePicker');
        input.type = 'file';
        input.onchange = (event) => {
            const target = event.target;
            const file = target.files[0];
            void this.handleFileSelect(file);
        };
        console.log('Classic file picker ready.');
    }
    handleFileSelect(inputFile) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePicker = new ClassicFilePicker(inputFile, 100000);
            const operation = yield this.application.fileService.beginNewFileUpload();
            const fileResult = yield filePicker.readFileAndSplit((chunk, index, isLast) => __awaiter(this, void 0, void 0, function* () {
                yield this.application.fileService.pushBytesForUpload(operation, chunk, index, isLast);
            }));
            const fileObj = yield this.application.fileService.finishUpload(operation, fileResult.name, fileResult.ext);
            const bytes = yield this.downloadFileBytes(fileObj.remoteIdentifier);
            yield filePicker.saveFile(`${fileObj.name}.${fileObj.ext}`, bytes);
        });
    }
}
