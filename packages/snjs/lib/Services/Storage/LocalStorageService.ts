import { RootKeyInterface, PayloadInterface, TransferPayload, ItemContent } from '@standardnotes/models'
import * as Services from '@standardnotes/services'

export class LocalStorageService extends Services.AbstractService implements Services.StorageServiceInterface {
  constructor(
    private storage: Storage,
    protected override internalEventBus: Services.InternalEventBusInterface,
  ) {
    super(internalEventBus)
  }

  getValue<T>(key: string, _mode?: Services.StorageValueModes, defaultValue?: T): T {
    const value = this.storage.getItem(key)

    return value != undefined ? (value as unknown as T) : (defaultValue as T)
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

  setValue(key: string, value: unknown, _mode?: Services.StorageValueModes): void {
    this.storage.setItem(key, JSON.stringify(value))
  }

  async removeValue(key: string, _mode?: Services.StorageValueModes): Promise<void> {
    await Promise.resolve(this.storage.removeItem(key))
  }
}
