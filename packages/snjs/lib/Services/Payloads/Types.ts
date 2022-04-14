import { ContentType } from '@standardnotes/common'
import {
  DecryptedPayloadInterface,
  DeletedPayloadInterface,
  EncryptedPayloadInterface,
  FullyFormedPayloadInterface,
  PayloadEmitSource,
} from '@standardnotes/models'

export type EmitQueue<P extends FullyFormedPayloadInterface> = QueueElement<P>[]

export type PayloadManagerChangeData = {
  /** The payloads are pre-existing but have been changed */
  changed: FullyFormedPayloadInterface[]

  /** The payloads have been newly inserted */
  inserted: FullyFormedPayloadInterface[]

  /** The payloads have been deleted from local state (and remote state if applicable) */
  discarded: DeletedPayloadInterface[]

  /** Payloads for which encrypted overwrite protection is enabled and enacted */
  ignored: EncryptedPayloadInterface[]

  /** Payloads which were previously error decrypting but now successfully decrypted */
  unerrored: DecryptedPayloadInterface[]

  source: PayloadEmitSource

  sourceKey?: string
}

export type PayloadsChangeObserverCallback = (data: PayloadManagerChangeData) => void

export type PayloadsChangeObserver = {
  types: ContentType[]
  callback: PayloadsChangeObserverCallback
  priority: number
}

export type QueueElement<P extends FullyFormedPayloadInterface = FullyFormedPayloadInterface> = {
  payloads: P[]
  source: PayloadEmitSource
  sourceKey?: string
  resolve: (alteredPayloads: P[]) => void
}

/**
 * An array of content types for which we enable encrypted overwrite protection.
 * If a payload attempting to be emitted is errored, yet our current local version
 * is not errored, and the payload's content type is in this array, we do not overwrite
 * our local version. We instead notify observers of this interaction for them to handle
 * as needed
 */
export const OverwriteProtectedTypes = Object.freeze([ContentType.ItemsKey])
