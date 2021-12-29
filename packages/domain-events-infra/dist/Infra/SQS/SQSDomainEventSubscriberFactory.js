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
exports.SQSDomainEventSubscriberFactory = void 0;
const sqs_consumer_1 = require("sqs-consumer");
class SQSDomainEventSubscriberFactory {
    constructor(sqs, queueUrl, domainEventMessageHandler) {
        this.sqs = sqs;
        this.queueUrl = queueUrl;
        this.domainEventMessageHandler = domainEventMessageHandler;
    }
    create() {
        const sqsConsumer = sqs_consumer_1.Consumer.create({
            attributeNames: ['All'],
            messageAttributeNames: ['compression', 'event'],
            queueUrl: this.queueUrl,
            sqs: this.sqs,
            handleMessage: 
            /* istanbul ignore next */
            (message) => __awaiter(this, void 0, void 0, function* () { return yield this.domainEventMessageHandler.handleMessage(message.Body); }),
        });
        sqsConsumer.on('error', this.domainEventMessageHandler.handleError.bind(this.domainEventMessageHandler));
        sqsConsumer.on('processing_error', this.domainEventMessageHandler.handleError.bind(this.domainEventMessageHandler));
        return sqsConsumer;
    }
}
exports.SQSDomainEventSubscriberFactory = SQSDomainEventSubscriberFactory;
