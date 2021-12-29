"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const RedisDomainEventSubscriber_1 = require("./RedisDomainEventSubscriber");
describe('RedisDomainEventSubscriber', () => {
    let redisClient;
    const eventChannel = 'test-channel';
    const createSubscriber = () => new RedisDomainEventSubscriber_1.RedisDomainEventSubscriber(redisClient, eventChannel);
    beforeEach(() => {
        redisClient = {};
        redisClient.subscribe = jest.fn();
    });
    it('should start the subscription', () => {
        createSubscriber().start();
        expect(redisClient.subscribe).toHaveBeenCalledWith('test-channel');
    });
});
