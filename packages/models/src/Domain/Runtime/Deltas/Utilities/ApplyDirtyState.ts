import { ImmutablePayloadCollection } from '../../Collection/Payload/ImmutablePayloadCollection'
import { FullyFormedPayloadInterface } from '../../../Abstract/Payload/Interfaces/UnionTypes'
import { SyncResolvedPayload } from './SyncResolvedPayload'

export function payloadByFinalizingSyncState(
  payload: FullyFormedPayloadInterface,
  baseCollection: ImmutablePayloadCollection,
): SyncResolvedPayload {
  const basePayload = baseCollection.find(payload.uuid)

  if (!basePayload) {
    return payload.copyAsSyncResolved({
      dirty: false,
      dirtiedDate: undefined,
      lastSyncEnd: new Date(),
    })
  }

  const stillDirty =
    basePayload.dirtiedDate &&
    basePayload.lastSyncBegan &&
    basePayload.dirtiedDate >= basePayload.lastSyncBegan

  return payload.copyAsSyncResolved({
    dirty: stillDirty != undefined ? stillDirty : false,
    dirtiedDate: stillDirty != undefined ? new Date() : undefined,
    lastSyncEnd: new Date(),
  })
}

export function payloadsByFinalizingSyncState(
  payloads: FullyFormedPayloadInterface[],
  baseCollection: ImmutablePayloadCollection,
): SyncResolvedPayload[] {
  return payloads.map((p) => payloadByFinalizingSyncState(p, baseCollection))
}
