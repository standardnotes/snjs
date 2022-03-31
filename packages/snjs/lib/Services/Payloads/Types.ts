import { ContentType } from '@standardnotes/common'
import { PurePayload, PayloadSource } from '@standardnotes/payloads'
import { ItemManagerChangeObserverCallback } from '@standardnotes/services'

export type PayloadsChangeObserver = {
  types: ContentType[]
  callback: ItemManagerChangeObserverCallback<PurePayload>
  priority: number
}

export type QueueElement = {
  payloads: PurePayload[]
  source: PayloadSource
  sourceKey?: string
  resolve: (alteredPayloads: PurePayload[]) => void
}

/**
 * An array of content types for which we enable encrypted overwrite protection.
 * If a payload attempting to be emitted is errored, yet our current local version
 * is not errored, and the payload's content type is in this array, we do not overwrite
 * our local version. We instead notify observers of this interaction for them to handle
 * as needed
 */
export const OverwriteProtectedTypes = Object.freeze([ContentType.ItemsKey])
