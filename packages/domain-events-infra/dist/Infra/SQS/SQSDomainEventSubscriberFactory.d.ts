import { SQS } from 'aws-sdk';
import { DomainEventMessageHandlerInterface } from '@standardnotes/domain-events';
import { DomainEventSubscriberFactoryInterface } from '@standardnotes/domain-events';
import { DomainEventSubscriberInterface } from '@standardnotes/domain-events';
export declare class SQSDomainEventSubscriberFactory implements DomainEventSubscriberFactoryInterface {
    private sqs;
    private queueUrl;
    private domainEventMessageHandler;
    constructor(sqs: SQS, queueUrl: string, domainEventMessageHandler: DomainEventMessageHandlerInterface);
    create(): DomainEventSubscriberInterface;
}
