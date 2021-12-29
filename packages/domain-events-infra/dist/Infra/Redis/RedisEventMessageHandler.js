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
exports.RedisEventMessageHandler = void 0;
const zlib = require("zlib");
class RedisEventMessageHandler {
    constructor(handlers, logger) {
        this.handlers = handlers;
        this.logger = logger;
    }
    handleMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const domainEventJson = zlib.unzipSync(Buffer.from(message, 'base64')).toString();
                const domainEvent = JSON.parse(domainEventJson);
                const handler = this.handlers.get(domainEvent.type);
                if (!handler) {
                    this.logger.debug(`Event handler for event type ${domainEvent.type} does not exist`);
                    return;
                }
                yield handler.handle(domainEvent);
            }
            catch (error) {
                yield this.handleError(error);
            }
        });
    }
    handleError(error) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.error('Error occured while handling Redis message: %O', error);
        });
    }
}
exports.RedisEventMessageHandler = RedisEventMessageHandler;
