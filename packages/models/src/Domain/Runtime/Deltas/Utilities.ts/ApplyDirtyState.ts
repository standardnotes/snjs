import { ImmutablePayloadCollection } from '../../Collection/Payload/ImmutablePayloadCollection'
import { FullyFormedPayloadInterface } from './../../../Abstract/Payload/Interfaces/UnionTypes'

export function payloadByRedirtyingBasedOnBaseState(
  payload: FullyFormedPayloadInterface,
  baseCollection: ImmutablePayloadCollection,
) {
  const basePayload = baseCollection.find(payload.uuid)

  if (!basePayload) {
    return payload
  }

  const stillDirty =
    basePayload.dirtiedDate &&
    basePayload.lastSyncBegan &&
    basePayload.dirtiedDate >= basePayload.lastSyncBegan

  return payload.copy({
    dirty: stillDirty,
    dirtiedDate: stillDirty ? new Date() : undefined,
  })
}

export function payloadsByRedirtyingBasedOnBaseState(
  payloads: FullyFormedPayloadInterface[],
  baseCollection: ImmutablePayloadCollection,
) {
  return payloads.map((p) => payloadByRedirtyingBasedOnBaseState(p, baseCollection))
}
