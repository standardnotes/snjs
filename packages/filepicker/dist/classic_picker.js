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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.ClassicFilePicker = void 0;
var ClassicFilePicker = /** @class */ (function () {
    function ClassicFilePicker(file, chunkSize) {
        this.file = file;
        this.chunkSize = chunkSize;
        this.loggingEnabled = true;
    }
    ClassicFilePicker.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.loggingEnabled) {
            return;
        }
        console.log(args);
    };
    ClassicFilePicker.prototype.readFile = function (file) {
        return __awaiter(this, void 0, void 0, function () {
            var reader;
            return __generator(this, function (_a) {
                reader = new FileReader();
                reader.readAsArrayBuffer(file);
                return [2 /*return*/, new Promise(function (resolve) {
                        reader.onload = function (readerEvent) {
                            var target = readerEvent.target;
                            var content = target.result;
                            resolve(new Uint8Array(content));
                        };
                    })];
            });
        });
    };
    ClassicFilePicker.prototype.readFileAndSplit = function (onChunk) {
        return __awaiter(this, void 0, void 0, function () {
            var buffer, chunkId, i, readUntil, chunk, isFinalChunk, pattern, extMatches, ext, name;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.readFile(this.file)];
                    case 1:
                        buffer = _a.sent();
                        chunkId = 0;
                        for (i = 0; i < buffer.length; i += this.chunkSize) {
                            readUntil = i + this.chunkSize > buffer.length ? buffer.length : i + this.chunkSize;
                            chunk = buffer.slice(i, readUntil);
                            isFinalChunk = readUntil === buffer.length;
                            this.log("Pushing " + chunk.length + " bytes");
                            onChunk(chunk, chunkId++, isFinalChunk);
                        }
                        pattern = /(?:\.([^.]+))?$/;
                        extMatches = pattern.exec(this.file.name);
                        ext = (extMatches === null || extMatches === void 0 ? void 0 : extMatches[1]) || '';
                        name = this.file.name.split('.')[0];
                        return [2 /*return*/, { name: name, ext: ext }];
                }
            });
        });
    };
    ClassicFilePicker.prototype.saveFile = function (name, bytes) {
        return __awaiter(this, void 0, void 0, function () {
            var link, blob;
            return __generator(this, function (_a) {
                this.log('Saving file to disk...');
                link = document.createElement('a');
                blob = new Blob([bytes], {
                    type: 'text/plain;charset=utf-8'
                });
                link.href = window.URL.createObjectURL(blob);
                link.setAttribute('download', name);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(link.href);
                this.log('Closing write stream');
                return [2 /*return*/];
            });
        });
    };
    return ClassicFilePicker;
}());
exports.ClassicFilePicker = ClassicFilePicker;
