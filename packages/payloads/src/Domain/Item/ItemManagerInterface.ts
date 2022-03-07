import { IntegrityPayload } from '../Payload/IntegrityPayload'
import { PayloadInterface } from '../Payload/PayloadInterface'
import { PayloadSource } from '../Payload/PayloadSource'
import { ItemInterface } from './ItemInterface'

export interface ItemManagerInterface {
  integrityPayloads: IntegrityPayload[]
  emitItemFromPayload(payload: PayloadInterface, source: PayloadSource): Promise<ItemInterface>
}
