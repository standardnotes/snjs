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
exports.SNSDomainEventPublisher = void 0;
const zlib = require("zlib");
class SNSDomainEventPublisher {
    constructor(snsClient, topicArn) {
        this.snsClient = snsClient;
        this.topicArn = topicArn;
    }
    publish(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const message = {
                TopicArn: this.topicArn,
                MessageAttributes: {
                    event: {
                        DataType: 'String',
                        StringValue: event.type,
                    },
                    compression: {
                        DataType: 'String',
                        StringValue: 'true',
                    },
                },
                Message: zlib.deflateSync(JSON.stringify(event)).toString('base64'),
            };
            yield this.snsClient.publish(message).promise();
        });
    }
}
exports.SNSDomainEventPublisher = SNSDomainEventPublisher;
