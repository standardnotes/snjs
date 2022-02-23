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
exports.ClassicFilePicker = void 0;
class ClassicFilePicker {
    constructor(file, chunkSize) {
        this.file = file;
        this.chunkSize = chunkSize;
        this.loggingEnabled = true;
    }
    log(...args) {
        if (!this.loggingEnabled) {
            return;
        }
        console.log(args);
    }
    readFile(file) {
        return __awaiter(this, void 0, void 0, function* () {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            return new Promise((resolve) => {
                reader.onload = (readerEvent) => {
                    const target = readerEvent.target;
                    const content = target.result;
                    resolve(new Uint8Array(content));
                };
            });
        });
    }
    readFileAndSplit(onChunk) {
        return __awaiter(this, void 0, void 0, function* () {
            const buffer = yield this.readFile(this.file);
            let chunkId = 0;
            for (let i = 0; i < buffer.length; i += this.chunkSize) {
                const readUntil = i + this.chunkSize > buffer.length ? buffer.length : i + this.chunkSize;
                const chunk = buffer.slice(i, readUntil);
                const isFinalChunk = readUntil === buffer.length;
                this.log(`Pushing ${chunk.length} bytes`);
                yield onChunk(chunk, chunkId++, isFinalChunk);
            }
            const pattern = /(?:\.([^.]+))?$/;
            const extMatches = pattern.exec(this.file.name);
            const ext = (extMatches === null || extMatches === void 0 ? void 0 : extMatches[1]) || '';
            const name = this.file.name.split('.')[0];
            return { name, ext };
        });
    }
    saveFile(name, bytes) {
        return __awaiter(this, void 0, void 0, function* () {
            this.log('Saving file to disk...');
            const link = document.createElement('a');
            const blob = new Blob([bytes], {
                type: 'text/plain;charset=utf-8',
            });
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute('download', name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(link.href);
            this.log('Closing write stream');
        });
    }
}
exports.ClassicFilePicker = ClassicFilePicker;
