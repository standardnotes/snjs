import { PayloadFormat } from '../Types/PayloadFormat'
import { PayloadInterface } from './PayloadInterface'

export interface DeletedPayloadInterface extends PayloadInterface {
  readonly deleted: true
  readonly format: PayloadFormat.Deleted
  discardable: boolean | undefined
}
