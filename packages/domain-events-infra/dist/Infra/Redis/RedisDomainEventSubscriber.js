"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisDomainEventSubscriber = void 0;
class RedisDomainEventSubscriber {
    constructor(redisClient, eventChannel) {
        this.redisClient = redisClient;
        this.eventChannel = eventChannel;
    }
    start() {
        void this.redisClient.subscribe(this.eventChannel);
    }
}
exports.RedisDomainEventSubscriber = RedisDomainEventSubscriber;
