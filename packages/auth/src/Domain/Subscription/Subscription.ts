import { SubscriptionName } from './SubscriptionName'

export type Subscription = {
  planName: SubscriptionName,
  endsAt: number,
  createdAt: number,
  updatedAt: number,
  cancelled: boolean,
}
