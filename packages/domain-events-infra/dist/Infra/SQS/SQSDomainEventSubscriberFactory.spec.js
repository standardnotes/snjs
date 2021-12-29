"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const SQSDomainEventSubscriberFactory_1 = require("./SQSDomainEventSubscriberFactory");
const sqs_consumer_1 = require("sqs-consumer");
describe('SQSDomainEventSubscriberFactory', () => {
    let sqs;
    const queueUrl = 'https://queue-url';
    let domainEventMessageHandler;
    const createFactory = () => new SQSDomainEventSubscriberFactory_1.SQSDomainEventSubscriberFactory(sqs, queueUrl, domainEventMessageHandler);
    beforeEach(() => {
        sqs = {};
        domainEventMessageHandler = {};
        domainEventMessageHandler.handleMessage = jest.fn();
        domainEventMessageHandler.handleError = jest.fn();
    });
    it('should create a domain event subscriber', () => {
        const subscriber = createFactory().create();
        expect(subscriber).toBeInstanceOf(sqs_consumer_1.Consumer);
    });
});
