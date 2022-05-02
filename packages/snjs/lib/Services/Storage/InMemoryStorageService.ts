import { RootKeyInterface, PayloadInterface, TransferPayload, ItemContent } from '@standardnotes/models'
import * as Services from '@standardnotes/services'

export class InMemoryStorageService extends Services.AbstractService implements Services.StorageServiceInterface {
  private values: Map<string, unknown>

  constructor(
    protected override internalEventBus: Services.InternalEventBusInterface,
  ) {
    super(internalEventBus)

    this.values = new Map<string, unknown>()
  }

  getValue<T>(key: string, _mode?: Services.StorageValueModes, defaultValue?: T): T {
    const value = this.values.get(key)

    return value != undefined ? (value as T) : (defaultValue as T)
  }

  setValue(key: string, value: unknown, _mode?: Services.StorageValueModes): void {
    this.values.set(key, value)
  }

  async removeValue(key: string, _mode?: Services.StorageValueModes): Promise<void> {
    await Promise.resolve(this.values.delete(key))
  }

  canDecryptWithKey(_key: RootKeyInterface): Promise<boolean> {
    throw new Error('Method not implemented.');
  }

  savePayload(_payload: PayloadInterface<TransferPayload<ItemContent>, ItemContent>): Promise<void> {
    throw new Error('Method not implemented.');
  }

  savePayloads(_decryptedPayloads: PayloadInterface<TransferPayload<ItemContent>, ItemContent>[]): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
