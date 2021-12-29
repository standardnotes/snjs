import { SubscriptionName } from './SubscriptionName';
export declare type Subscription = {
    planName: SubscriptionName;
    endsAt: number;
    createdAt: number;
    updatedAt: number;
    cancelled: boolean;
};
