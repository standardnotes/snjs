import { Uuid } from '@standardnotes/common'
import { DeletedPayloadInterface, FullyFormedPayloadInterface } from '../../Abstract/Payload'
import { ImmutablePayloadCollection } from '../Collection/Payload/ImmutablePayloadCollection'

export interface DeltaInterface<
  Base extends FullyFormedPayloadInterface,
  Result extends FullyFormedPayloadInterface,
> {
  baseCollection: ImmutablePayloadCollection<Base>

  resultingCollection(): Promise<ImmutablePayloadCollection<Result>>

  findBasePayload(uuid: Uuid): DeletedPayloadInterface | Base | undefined
}
