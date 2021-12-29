import { Logger } from 'winston';
import { DomainEventHandlerInterface } from '@standardnotes/domain-events';
import { DomainEventMessageHandlerInterface } from '@standardnotes/domain-events';
export declare class SQSNewRelicEventMessageHandler implements DomainEventMessageHandlerInterface {
    private handlers;
    private logger;
    constructor(handlers: Map<string, DomainEventHandlerInterface>, logger: Logger);
    handleMessage(message: string): Promise<void>;
    handleError(error: Error): Promise<void>;
}
