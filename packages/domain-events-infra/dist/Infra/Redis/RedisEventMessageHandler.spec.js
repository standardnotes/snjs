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
require("reflect-metadata");
const RedisEventMessageHandler_1 = require("./RedisEventMessageHandler");
describe('RedisEventMessageHandler', () => {
    let handler;
    let handlers;
    let logger;
    const createHandler = () => new RedisEventMessageHandler_1.RedisEventMessageHandler(handlers, logger);
    beforeEach(() => {
        handler = {};
        handler.handle = jest.fn();
        handlers = new Map([['TEST', handler]]);
        logger = {};
        logger.debug = jest.fn();
        logger.error = jest.fn();
    });
    it('should handle messages', () => __awaiter(void 0, void 0, void 0, function* () {
        yield createHandler().handleMessage('eJyrViqpLEhVslIKcQ0OUdJRKkiszMlPTFGyqlZKy88HiiclFinV1gIA9tQMhA==');
        expect(handler.handle).toHaveBeenCalledWith({
            payload: {
                foo: 'bar',
            },
            type: 'TEST',
        });
    }));
    it('should handle errors', () => __awaiter(void 0, void 0, void 0, function* () {
        yield createHandler().handleMessage('eJyasdasdrViqpLEhVslIKcQ0OUdJRKkiszMlPTFGyqlZKy88HiiclFinV1gIA9tQMhA==');
        expect(logger.error).toHaveBeenCalled();
        expect(handler.handle).not.toHaveBeenCalled();
    }));
    it('should tell if there is no handler for an event', () => __awaiter(void 0, void 0, void 0, function* () {
        yield createHandler().handleMessage('eJyrViqpLEhVslIKcQ0OMVLSUSpIrMzJT0xRsqpWSsvPB0okJRYp1dYCAABHDLY=');
        expect(logger.debug).toHaveBeenCalledWith('Event handler for event type TEST2 does not exist');
        expect(handler.handle).not.toHaveBeenCalled();
    }));
});
