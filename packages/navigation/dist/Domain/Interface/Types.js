"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFolder = exports.FolderContentTypes = void 0;
const common_1 = require("@standardnotes/common");
const models_1 = require("@standardnotes/models");
exports.FolderContentTypes = [common_1.ContentType.Tag, common_1.ContentType.SmartView];
function isFolder(x) {
    return (0, models_1.isTag)(x) || x.content_type === common_1.ContentType.SmartView;
}
exports.isFolder = isFolder;
