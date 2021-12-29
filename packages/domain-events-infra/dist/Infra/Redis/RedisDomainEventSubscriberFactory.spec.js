"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const RedisDomainEventSubscriberFactory_1 = require("./RedisDomainEventSubscriberFactory");
const RedisDomainEventSubscriber_1 = require("./RedisDomainEventSubscriber");
describe('RedisDomainEventSubscriberFactory', () => {
    let redisClient;
    let domainEventMessageHandler;
    const eventChannel = 'events';
    const createFactory = () => new RedisDomainEventSubscriberFactory_1.RedisDomainEventSubscriberFactory(redisClient, domainEventMessageHandler, eventChannel);
    beforeEach(() => {
        redisClient = {};
        redisClient.on = jest.fn();
        domainEventMessageHandler = {};
        domainEventMessageHandler.handleMessage = jest.fn();
    });
    it('should create an event subscriber', () => {
        const subscriber = createFactory().create();
        expect(subscriber).toBeInstanceOf(RedisDomainEventSubscriber_1.RedisDomainEventSubscriber);
        expect(redisClient.on).toHaveBeenCalledWith('message', expect.any(Function));
    });
});
