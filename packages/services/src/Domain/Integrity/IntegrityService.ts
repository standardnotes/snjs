import { IntegrityEvent } from './IntegrityEvent'
import { AbstractService } from '../Service/AbstractService'
import { CreateMaxPayloadFromAnyObject, ItemManagerInterface, PayloadSource } from '@standardnotes/payloads'
import { ItemApiInterface } from '../Item/ItemApiInterface'
import { IntegrityApiInterface } from './IntegrityApiInterface'
import { GetSingleItemResponse } from '@standardnotes/responses'
import { InternalEventHandlerInterface } from '../Internal/InternalEventHandlerInterface'
import { InternalEventInterface } from '../Internal/InternalEventInterface'
import { InternalEventBusInterface } from '../Internal/InternalEventBusInterface'
import { SyncEvent } from '../Event/SyncEvent'

export class IntegrityService
  extends AbstractService<IntegrityEvent>
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

    for (const serverItemResponse of serverItemResponses) {
      if (serverItemResponse.data === undefined || serverItemResponse.error || !('item' in serverItemResponse.data)) {
        this.log(`Could not obtain item for integrity adjustments: ${serverItemResponse.error}`)

        continue
      }

      void this.itemManager.emitItemFromPayload(
        CreateMaxPayloadFromAnyObject(serverItemResponse.data.item),
        PayloadSource.RemoteRetrieved,
      )
    }

    void this.notifyEvent(IntegrityEvent.IntegrityCheckCompleted)
  }
}
