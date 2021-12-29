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
const RedisDomainEventPublisher_1 = require("./RedisDomainEventPublisher");
describe('RedisDomainEventPublisher', () => {
    let redisClient;
    let event;
    const eventChannel = 'events';
    const createPublisher = () => new RedisDomainEventPublisher_1.RedisDomainEventPublisher(redisClient, eventChannel);
    beforeEach(() => {
        redisClient = {};
        redisClient.publish = jest.fn();
        event = {};
        event.type = 'TEST';
        event.payload = { foo: 'bar' };
    });
    it('should publish an event to a channel', () => __awaiter(void 0, void 0, void 0, function* () {
        yield createPublisher().publish(event);
        expect(redisClient.publish).toHaveBeenCalledWith('events', 'eJyrViqpLEhVslIKcQ0OUdJRKkiszMlPTFGyqlZKy88HiiclFinV1gIA9tQMhA==');
    }));
});
