"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentDecoder = void 0;
class ContentDecoder {
    decode(content, leftPaddingLength = 3) {
        try {
            const contentToDecode = leftPaddingLength > 0 ? content.substring(leftPaddingLength) : content;
            const contentBuffer = Buffer.from(contentToDecode, 'base64');
            const decodedContent = contentBuffer.toString();
            return JSON.parse(decodedContent);
        }
        catch (error) {
            return {};
        }
    }
    encode(content, leftPaddingLength = 3) {
        const stringifiedContent = JSON.stringify(content);
        const encodedContent = Buffer.from(stringifiedContent).toString('base64');
        return encodedContent.padStart(encodedContent.length + leftPaddingLength, '0');
    }
}
exports.ContentDecoder = ContentDecoder;
