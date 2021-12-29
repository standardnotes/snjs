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
exports.RedisDomainEventPublisher = void 0;
const zlib = require("zlib");
class RedisDomainEventPublisher {
    constructor(redisClient, eventChannel) {
        this.redisClient = redisClient;
        this.eventChannel = eventChannel;
    }
    publish(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = zlib.deflateSync(JSON.stringify(event)).toString('base64');
            yield this.redisClient.publish(this.eventChannel, message);
        });
    }
}
exports.RedisDomainEventPublisher = RedisDomainEventPublisher;
