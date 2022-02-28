import { MinimalHttpResponse } from '../Http/MinimalHttpResponses'

export type CreateValetTokenResponse = MinimalHttpResponse & {
  data?: {
    success: true
    valetToken: string
  } | {
    success: false
    reason: 'no-subscription' | 'expired-subscription'
  }
}
