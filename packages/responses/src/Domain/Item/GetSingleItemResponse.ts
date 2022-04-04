import { TransferPayload } from '@standardnotes/models'
import { MinimalHttpResponse } from '../Http/MinimalHttpResponses'

export type GetSingleItemResponse = MinimalHttpResponse & {
  data:
    | {
        success: true
        item: TransferPayload
      }
    | {
        success: false
        message: string
      }
}
