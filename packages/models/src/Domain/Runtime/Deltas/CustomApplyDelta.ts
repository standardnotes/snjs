import { DeltaInterface } from './DeltaInterface'
import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'
import { DeletedPayloadInterface, FullyFormedPayloadInterface } from '../../Abstract/Payload'
import { Uuid } from '@standardnotes/common'

type Return = FullyFormedPayloadInterface

export abstract class CustomApplyDelta
  implements DeltaInterface<FullyFormedPayloadInterface, Return>
{
  constructor(readonly baseCollection: ImmutablePayloadCollection<FullyFormedPayloadInterface>) {}

  findBasePayload(uuid: Uuid): DeletedPayloadInterface | FullyFormedPayloadInterface | undefined {
    return this.baseCollection.find(uuid)
  }

  public abstract resultingCollection(): Promise<ImmutablePayloadCollection<Return>>
}
