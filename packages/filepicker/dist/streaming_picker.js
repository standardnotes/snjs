"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamingFilePicker = void 0;
/**
 * The File System Access API File Picker
 * https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
 */
class StreamingFilePicker {
    constructor() {
        this.loggingEnabled = true;
    }
    log(...args) {
        if (!this.loggingEnabled) {
            return;
        }
        console.log(args);
    }
    static available() {
        return window.showOpenFilePicker != undefined;
    }
    selectFileAndStream(onChunk) {
        return __awaiter(this, void 0, void 0, function* () {
            const selectedFilesHandles = yield window.showOpenFilePicker();
            const uploadHandle = selectedFilesHandles[0];
            const file = yield uploadHandle.getFile();
            const stream = file.stream();
            const reader = stream.getReader();
            let chunkIndex = 1;
            let previousChunk;
            const processChunk = ({ done, value, }) => __awaiter(this, void 0, void 0, function* () {
                if (done) {
                    this.log('Read final chunk', previousChunk.length);
                    yield onChunk(previousChunk, chunkIndex, true);
                    return;
                }
                if (previousChunk) {
                    this.log('Read chunk', previousChunk.length);
                    yield onChunk(previousChunk, chunkIndex, false);
                    chunkIndex++;
                }
                previousChunk = value;
                return reader.read().then(processChunk);
            });
            yield reader.read().then(processChunk);
            this.log('Finished streaming file.');
            const pattern = /(?:\.([^.]+))?$/;
            const extMatches = pattern.exec(file.name);
            const ext = (extMatches === null || extMatches === void 0 ? void 0 : extMatches[1]) || '';
            const name = file.name.split('.')[0];
            return { name, ext };
        });
    }
    saveFile(name) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log('Showing save file picker');
            const downloadHandle = yield window.showSaveFilePicker({
                suggestedName: name,
            });
            const writableStream = yield downloadHandle.createWritable();
            const pusher = (chunk) => __awaiter(this, void 0, void 0, function* () {
                this.log('Writing chunk to disk of size', chunk.length);
                yield writableStream.write(chunk);
            });
            const closer = () => {
                this.log('Closing write stream');
                return writableStream.close();
            };
            return { pusher, closer };
        });
    }
}
exports.StreamingFilePicker = StreamingFilePicker;
