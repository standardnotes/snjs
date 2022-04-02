import { PayloadInterface } from './PayloadInterface'

export interface DeletedPayloadInterface extends PayloadInterface {
  readonly deleted: true
  discardable: boolean | undefined
}
