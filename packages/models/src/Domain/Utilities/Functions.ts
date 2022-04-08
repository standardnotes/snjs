import { Uuid } from '@standardnotes/common'
import { PayloadInterface } from '../Abstract/Payload/Interfaces/PayloadInterface'
import { PayloadSource } from '../Abstract/Payload/Types/PayloadSource'

/**
 * Whether the changed payload represents only an internal change that shouldn't
 * require a UI refresh
 */
export function isPayloadSourceInternalChange(source: PayloadSource): boolean {
  return [PayloadSource.RemoteSaved, PayloadSource.PreSyncSave].includes(source)
}

export function isPayloadSourceRetrieved(source: PayloadSource): boolean {
  return [
    PayloadSource.RemoteRetrieved,
    PayloadSource.ComponentRetrieved,
    PayloadSource.RemoteActionRetrieved,
  ].includes(source)
}

export function SureFindPayload<P extends PayloadInterface = PayloadInterface>(
  uuid: Uuid,
  payloads: P[],
): P {
  return payloads.find((payload) => payload.uuid === uuid) as P
}
