import { IntegrityEvent } from './IntegrityEvent'
import { AbstractService } from '../Service/AbstractService'
import { ItemManagerInterface } from '@standardnotes/payloads'
import { ItemApiInterface } from '../Item/ItemApiInterface'
import { IntegrityApiInterface } from './IntegrityApiInterface'
import { GetSingleItemResponse } from '@standardnotes/responses'
import { InternalEventHandlerInterface } from '../Internal/InternalEventHandlerInterface'
import { InternalEventInterface } from '../Internal/InternalEventInterface'
import { InternalEventBusInterface } from '../Internal/InternalEventBusInterface'
import { SyncEvent } from '../Event/SyncEvent'
import { IntegrityEventPayload } from './IntegrityEventPayload'
import { SyncSource } from '../Sync/SyncSource'

export class IntegrityService
  extends AbstractService<IntegrityEvent, IntegrityEventPayload>
  implements InternalEventHandlerInterface {
  constructor(
    private integrityApi: IntegrityApiInterface,
    private itemApi: ItemApiInterface,
    private itemManager: ItemManagerInterface,
    protected internalEventBus: InternalEventBusInterface,
  ) {
    super(internalEventBus)
  }

  async handleEvent(event: InternalEventInterface): Promise<void> {
    if (event.type !== SyncEvent.SyncRequestsIntegrityCheck) {
      return
    }

    const integrityCheckResponse = await this.integrityApi.checkIntegrity(this.itemManager.integrityPayloads)
    if (integrityCheckResponse.error !== undefined) {
      this.log(`Could not obtain integrity check: ${integrityCheckResponse.error}`)

      return
    }

    const serverItemResponsePromises: Promise<GetSingleItemResponse>[] = []
    for (const mismatch of integrityCheckResponse.data.mismatches) {
      serverItemResponsePromises.push(this.itemApi.getSingleItem(mismatch.uuid))
    }

    const serverItemResponses = await Promise.all(serverItemResponsePromises)

    const rawPayloads = []
    for (const serverItemResponse of serverItemResponses) {
      if (serverItemResponse.data === undefined || serverItemResponse.error || !('item' in serverItemResponse.data)) {
        this.log(`Could not obtain item for integrity adjustments: ${serverItemResponse.error}`)

        continue
      }

      rawPayloads.push(serverItemResponse.data.item)
    }

    await this.notifyEventSync(IntegrityEvent.IntegrityCheckCompleted, {
      rawPayloads: rawPayloads,
      source: (event.payload as { source: SyncSource }).source,
    })
  }
}
