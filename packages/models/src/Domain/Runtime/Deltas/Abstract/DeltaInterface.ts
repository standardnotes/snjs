import { Uuid } from '@standardnotes/common'
import { FullyFormedPayloadInterface } from '../../../Abstract/Payload'
import { ImmutablePayloadCollection } from '../../Collection/Payload/ImmutablePayloadCollection'
import { DeltaEmit } from './DeltaEmit'

export interface DeltaInterface {
  baseCollection: ImmutablePayloadCollection

  result(): DeltaEmit

  findBasePayload(uuid: Uuid): FullyFormedPayloadInterface | undefined
}
