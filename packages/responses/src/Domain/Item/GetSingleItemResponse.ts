import { RawPayload } from '@standardnotes/models'
import { MinimalHttpResponse } from '../Http/MinimalHttpResponses'

export type GetSingleItemResponse = MinimalHttpResponse & {
  data: {
    success: true
    item: RawPayload
  } | {
    success: false
    message: string
  };
};
