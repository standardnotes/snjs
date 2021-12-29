"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const ContentDecoder_1 = require("./ContentDecoder");
describe('ContentDecoder', () => {
    const createDecoder = () => new ContentDecoder_1.ContentDecoder();
    it('should decode content', () => {
        const content = '000eyJmb28iOiJiYXIifQ==';
        expect(createDecoder().decode(content)).toEqual({
            foo: 'bar',
        });
    });
    it('should decode content without padding', () => {
        const content = 'eyJmb28iOiJiYXIifQ==';
        expect(createDecoder().decode(content, 0)).toEqual({
            foo: 'bar',
        });
    });
    it('should encode content', () => {
        expect(createDecoder().encode({
            foo: 'bar',
        })).toEqual('000eyJmb28iOiJiYXIifQ==');
    });
    it('should return empty object on decoding failure', () => {
        const content = '032400eyJmb28iOiJiYXIifQ==';
        expect(createDecoder().decode(content)).toEqual({});
    });
});
