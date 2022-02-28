import { Subscription } from '@standardnotes/auth'
import { MinimalHttpResponse } from '../Http/MinimalHttpResponses'

export type GetSubscriptionResponse = MinimalHttpResponse & {
  data?: {
    subscription?: Subscription
  }
}
