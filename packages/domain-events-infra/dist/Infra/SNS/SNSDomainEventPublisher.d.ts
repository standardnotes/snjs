import * as AWS from 'aws-sdk';
import { DomainEventInterface } from '@standardnotes/domain-events';
import { DomainEventPublisherInterface } from '@standardnotes/domain-events';
export declare class SNSDomainEventPublisher implements DomainEventPublisherInterface {
    private snsClient;
    private topicArn;
    constructor(snsClient: AWS.SNS, topicArn: string);
    publish(event: DomainEventInterface): Promise<void>;
}
