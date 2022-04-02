import { DeletedPayloadInterface } from './../../Payload/Interfaces/DeletedPayload'
import { ItemInterface } from './ItemInterface'

export interface DeletedItemInterface extends ItemInterface {
  readonly payload: DeletedPayloadInterface
  deleted: true
}
