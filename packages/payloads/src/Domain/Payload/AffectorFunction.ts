import { ImmutablePayloadCollection } from '../Collection/ImmutablePayloadCollection'
import { PayloadInterface } from './PayloadInterface'

export type AffectorFunction = (
  basePayload: PayloadInterface,
  duplicatePayload: PayloadInterface,
  baseCollection: ImmutablePayloadCollection
) => PayloadInterface[]
