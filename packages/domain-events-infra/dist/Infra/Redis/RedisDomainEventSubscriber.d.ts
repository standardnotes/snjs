import * as IORedis from 'ioredis';
import { DomainEventSubscriberInterface } from '@standardnotes/domain-events';
export declare class RedisDomainEventSubscriber implements DomainEventSubscriberInterface {
    private redisClient;
    private eventChannel;
    constructor(redisClient: IORedis.Redis, eventChannel: string);
    start(): void;
}
