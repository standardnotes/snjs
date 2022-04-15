import { DeltaInterface } from './DeltaInterface'
import { ImmutablePayloadCollection } from '../../Collection/Payload/ImmutablePayloadCollection'
import { FullyFormedPayloadInterface } from '../../../Abstract/Payload'
import { Uuid } from '@standardnotes/common'
import { DeltaEmit } from './DeltaEmit'

export abstract class CustomApplyDelta implements DeltaInterface {
  constructor(readonly baseCollection: ImmutablePayloadCollection<FullyFormedPayloadInterface>) {}

  findBasePayload(uuid: Uuid): FullyFormedPayloadInterface | undefined {
    return this.baseCollection.find(uuid)
  }

  public abstract result(): DeltaEmit
}
