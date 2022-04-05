import { ContentType } from '@standardnotes/common'
import {
  ContentlessPayloadInterface,
  DecryptedPayloadInterface,
  DeletedPayloadInterface,
  EncryptedPayloadInterface,
  PayloadInterface,
  PayloadSource,
} from '@standardnotes/models'

export type EmitQueue<P extends PayloadInterface = PayloadInterface> = QueueElement<P>[]

export type EmitInPayloads =
  | DecryptedPayloadInterface
  | DeletedPayloadInterface
  | EncryptedPayloadInterface
  | ContentlessPayloadInterface

export type EmitOutPayloads =
  | DecryptedPayloadInterface
  | DeletedPayloadInterface
  | EncryptedPayloadInterface

export type PayloadsChangeObserverCallback = (
  /** The items are pre-existing but have been changed */
  changed: EmitOutPayloads[],

  /** The items have been newly inserted */
  inserted: EmitOutPayloads[],

  /** The items have been deleted from local state (and remote state if applicable) */
  discarded: DeletedPayloadInterface[],

  /** Items for which encrypted overwrite protection is enabled and enacted */
  ignored: EncryptedPayloadInterface[],

  source: PayloadSource,
  sourceKey?: string,
) => void

export type PayloadsChangeObserver = {
  types: ContentType[]
  callback: PayloadsChangeObserverCallback
  priority: number
}

export type QueueElement<P extends PayloadInterface = PayloadInterface> = {
  payloads: P[]
  source: PayloadSource
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
