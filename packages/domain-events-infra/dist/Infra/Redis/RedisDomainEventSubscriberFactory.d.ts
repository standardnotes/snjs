import * as IORedis from 'ioredis';
import { DomainEventSubscriberFactoryInterface } from '@standardnotes/domain-events';
import { DomainEventSubscriberInterface } from '@standardnotes/domain-events';
import { DomainEventMessageHandlerInterface } from '@standardnotes/domain-events';
export declare class RedisDomainEventSubscriberFactory implements DomainEventSubscriberFactoryInterface {
    private redisClient;
    private domainEventMessageHandler;
    private eventChannel;
    constructor(redisClient: IORedis.Redis, domainEventMessageHandler: DomainEventMessageHandlerInterface, eventChannel: string);
    create(): DomainEventSubscriberInterface;
}
