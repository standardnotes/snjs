import { Logger } from 'winston';
import { DomainEventMessageHandlerInterface } from '@standardnotes/domain-events';
import { DomainEventHandlerInterface } from '@standardnotes/domain-events';
export declare class RedisEventMessageHandler implements DomainEventMessageHandlerInterface {
    private handlers;
    private logger;
    constructor(handlers: Map<string, DomainEventHandlerInterface>, logger: Logger);
    handleMessage(message: string): Promise<void>;
    handleError(error: Error): Promise<void>;
}
