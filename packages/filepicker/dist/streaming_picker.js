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
exports.StreamingFilePicker = void 0;
/**
 * The File System Access API File Picker
 * https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
 */
var StreamingFilePicker = /** @class */ (function () {
    function StreamingFilePicker() {
        this.loggingEnabled = true;
    }
    StreamingFilePicker.prototype.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.loggingEnabled) {
            return;
        }
        console.log(args);
    };
    StreamingFilePicker.prototype.selectFileAndStream = function (onChunk) {
        return __awaiter(this, void 0, void 0, function () {
            var selectedFilesHandles, uploadHandle, file, stream, reader, chunkIndex, previousChunk, processChunk, pattern, extMatches, ext, name;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, window.showOpenFilePicker()];
                    case 1:
                        selectedFilesHandles = _a.sent();
                        uploadHandle = selectedFilesHandles[0];
                        return [4 /*yield*/, uploadHandle.getFile()];
                    case 2:
                        file = _a.sent();
                        stream = file.stream();
                        reader = stream.getReader();
                        chunkIndex = 1;
                        processChunk = function (_a) {
                            var done = _a.done, value = _a.value;
                            return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            if (!done) return [3 /*break*/, 2];
                                            this.log('Read final chunk', previousChunk.length);
                                            return [4 /*yield*/, onChunk(previousChunk, chunkIndex, true)];
                                        case 1:
                                            _b.sent();
                                            return [2 /*return*/];
                                        case 2:
                                            if (!previousChunk) return [3 /*break*/, 4];
                                            this.log('Read chunk', previousChunk.length);
                                            return [4 /*yield*/, onChunk(previousChunk, chunkIndex, false)];
                                        case 3:
                                            _b.sent();
                                            chunkIndex++;
                                            _b.label = 4;
                                        case 4:
                                            previousChunk = value;
                                            return [2 /*return*/, reader.read().then(processChunk)];
                                    }
                                });
                            });
                        };
                        return [4 /*yield*/, reader.read().then(processChunk)];
                    case 3:
                        _a.sent();
                        this.log('Finished streaming file.');
                        pattern = /(?:\.([^.]+))?$/;
                        extMatches = pattern.exec(file.name);
                        ext = (extMatches === null || extMatches === void 0 ? void 0 : extMatches[1]) || '';
                        name = file.name.split('.')[0];
                        return [2 /*return*/, { name: name, ext: ext }];
                }
            });
        });
    };
    StreamingFilePicker.prototype.saveFile = function () {
        return __awaiter(this, void 0, void 0, function () {
            var downloadHandle, writableStream, pusher, closer;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log('Showing save file picker');
                        return [4 /*yield*/, window.showSaveFilePicker()];
                    case 1:
                        downloadHandle = _a.sent();
                        return [4 /*yield*/, downloadHandle.createWritable()];
                    case 2:
                        writableStream = _a.sent();
                        pusher = function (chunk) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        this.log('Writing chunk to disk of size', chunk.length);
                                        return [4 /*yield*/, writableStream.write(chunk)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        closer = function () {
                            _this.log('Closing write stream');
                            return writableStream.close();
                        };
                        return [2 /*return*/, { pusher: pusher, closer: closer }];
                }
            });
        });
    };
    return StreamingFilePicker;
}());
exports.StreamingFilePicker = StreamingFilePicker;
