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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.ClassicFileApi = void 0;
var snjs_1 = require("../../../snjs");
var filepicker_1 = require("../../../filepicker");
var ClassicFileApi = /** @class */ (function () {
    function ClassicFileApi(application) {
        var _this = this;
        this.application = application;
        this.downloadFileBytes = function (remoteIdentifier) { return __awaiter(_this, void 0, void 0, function () {
            var file, receivedBytes;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('Downloading file', remoteIdentifier);
                        file = this.application['itemManager']
                            .getItems(snjs_1.ContentType.File)
                            .find(function (file) { return file.remoteIdentifier === remoteIdentifier; });
                        receivedBytes = new Uint8Array();
                        return [4 /*yield*/, this.application.fileService.downloadFile(file, function (decryptedBytes) {
                                console.log("Downloaded " + decryptedBytes.length + " bytes");
                                receivedBytes = new Uint8Array(__spreadArrays(receivedBytes, decryptedBytes));
                            })];
                    case 1:
                        _a.sent();
                        console.log('Successfully downloaded and decrypted file!');
                        return [2 /*return*/, receivedBytes];
                }
            });
        }); };
        this.configureFilePicker();
    }
    ClassicFileApi.prototype.configureFilePicker = function () {
        var _this = this;
        var input = document.getElementById('filePicker');
        input.type = 'file';
        input.onchange = function (event) {
            var target = event.target;
            var file = target.files[0];
            void _this.handleFileSelect(file);
        };
        console.log('Classic file picker ready.');
    };
    ClassicFileApi.prototype.handleFileSelect = function (inputFile) {
        return __awaiter(this, void 0, void 0, function () {
            var filePicker, operation, fileResult, fileObj, bytes;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filePicker = new filepicker_1.ClassicFilePicker(inputFile, 100000);
                        return [4 /*yield*/, this.application.fileService.beginNewFileUpload()];
                    case 1:
                        operation = _a.sent();
                        return [4 /*yield*/, filePicker.readFileAndSplit(function (chunk, index, isLast) {
                                _this.application.fileService.pushBytesForUpload(operation, chunk, index, isLast);
                            })];
                    case 2:
                        fileResult = _a.sent();
                        return [4 /*yield*/, this.application.fileService.finishUpload(operation, fileResult.name, fileResult.ext)];
                    case 3:
                        fileObj = _a.sent();
                        return [4 /*yield*/, this.downloadFileBytes(fileObj.remoteIdentifier)];
                    case 4:
                        bytes = _a.sent();
                        return [4 /*yield*/, filePicker.saveFile(fileObj.name + "." + fileObj.ext, bytes)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ClassicFileApi;
}());
exports.ClassicFileApi = ClassicFileApi;
