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
const SNSDomainEventPublisher_1 = require("./SNSDomainEventPublisher");
describe('SNSDomainEventPublisher', () => {
    let sns;
    const topicArn = 'test-topic-arn';
    let event;
    const createPublisher = () => new SNSDomainEventPublisher_1.SNSDomainEventPublisher(sns, topicArn);
    beforeEach(() => {
        const publish = {};
        publish.promise = jest.fn().mockReturnValue(Promise.resolve());
        sns = {};
        sns.publish = jest.fn().mockReturnValue(publish);
        event = {};
        event.type = 'TEST';
        event.payload = { foo: 'bar' };
    });
    it('should publish a domain event', () => __awaiter(void 0, void 0, void 0, function* () {
        yield createPublisher().publish(event);
        expect(sns.publish).toHaveBeenCalledWith({
            Message: 'eJyrViqpLEhVslIKcQ0OUdJRKkiszMlPTFGyqlZKy88HiiclFinV1gIA9tQMhA==',
            MessageAttributes: {
                event: {
                    DataType: 'String',
                    StringValue: 'TEST',
                },
                compression: {
                    DataType: 'String',
                    StringValue: 'true',
                },
            },
            TopicArn: 'test-topic-arn',
        });
    }));
});
