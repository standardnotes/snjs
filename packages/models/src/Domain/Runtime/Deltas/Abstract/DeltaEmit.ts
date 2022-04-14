import {
  EncryptedPayloadInterface,
  FullyFormedPayloadInterface,
  PayloadEmitSource,
} from '../../../Abstract/Payload'

export type DeltaEmit<P extends FullyFormedPayloadInterface = FullyFormedPayloadInterface> = {
  changed: P[]
  ignored?: EncryptedPayloadInterface[]
  source: PayloadEmitSource
}
