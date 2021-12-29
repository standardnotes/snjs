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
exports.RedisDomainEventSubscriberFactory = void 0;
const RedisDomainEventSubscriber_1 = require("./RedisDomainEventSubscriber");
class RedisDomainEventSubscriberFactory {
    constructor(redisClient, domainEventMessageHandler, eventChannel) {
        this.redisClient = redisClient;
        this.domainEventMessageHandler = domainEventMessageHandler;
        this.eventChannel = eventChannel;
    }
    create() {
        const subscriber = new RedisDomainEventSubscriber_1.RedisDomainEventSubscriber(this.redisClient, this.eventChannel);
        this.redisClient.on('message', 
        /* istanbul ignore next */
        (_channel, message) => __awaiter(this, void 0, void 0, function* () { return yield this.domainEventMessageHandler.handleMessage(message); }));
        return subscriber;
    }
}
exports.RedisDomainEventSubscriberFactory = RedisDomainEventSubscriberFactory;
