import {
  EncryptedPayloadInterface,
  FullyFormedPayloadInterface,
  PayloadEmitSource,
} from '../../../Abstract/Payload'

export type DeltaEmit<P extends FullyFormedPayloadInterface = FullyFormedPayloadInterface> = {
  emits: P[]
  ignored?: EncryptedPayloadInterface[]
  source: PayloadEmitSource
}
