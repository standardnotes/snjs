import * as IORedis from 'ioredis';
import { DomainEventPublisherInterface } from '@standardnotes/domain-events';
import { DomainEventInterface } from '@standardnotes/domain-events';
export declare class RedisDomainEventPublisher implements DomainEventPublisherInterface {
    private redisClient;
    private eventChannel;
    constructor(redisClient: IORedis.Redis, eventChannel: string);
    publish(event: DomainEventInterface): Promise<void>;
}
