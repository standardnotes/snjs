import { SubscriptionName } from '@standardnotes/auth';
export interface SubscriptionSyncRequestedEventPayload {
    userEmail: string;
    subscriptionId: number;
    subscriptionName: SubscriptionName;
    subscriptionExpiresAt: number;
    timestamp: number;
    offline: boolean;
    canceled: boolean;
    extensionKey: string;
    offlineFeaturesToken: string;
}
