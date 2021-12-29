import { SubscriptionName } from '@standardnotes/auth';
export interface SubscriptionReassignedEventPayload {
    userEmail: string;
    extensionKey: string;
    offline: boolean;
    subscriptionId: number;
    subscriptionName: SubscriptionName;
    subscriptionExpiresAt: number;
    timestamp: number;
}
