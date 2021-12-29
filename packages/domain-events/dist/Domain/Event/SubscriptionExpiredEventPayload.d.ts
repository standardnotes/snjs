import { SubscriptionName } from '@standardnotes/auth';
export interface SubscriptionExpiredEventPayload {
    userEmail: string;
    subscriptionId: number;
    subscriptionName: SubscriptionName;
    timestamp: number;
    offline: boolean;
}
