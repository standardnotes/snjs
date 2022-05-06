import { MutationType } from '../Types/MutationType'
import { PayloadInterface } from '../../Payload'
import { ItemInterface } from '../Interfaces/ItemInterface'
import { TransferPayload } from '../../TransferPayload'
import { getIncrementedDirtyIndex } from '../../../Runtime/DirtyCounter/DirtyCounter'

/**
 * An item mutator takes in an item, and an operation, and returns the resulting payload.
 * Subclasses of mutators can modify the content field directly, but cannot modify the payload directly.
 * All changes to the payload must occur by copying the payload and reassigning its value.
 */
export class ItemMutator<
  P extends PayloadInterface<TransferPayload> = PayloadInterface<TransferPayload>,
  I extends ItemInterface<P> = ItemInterface<P>,
> {
  public readonly item: I
  protected payload: P
  protected readonly type: MutationType

  constructor(item: I, type: MutationType) {
    this.item = item
    this.type = type
    this.payload = item.payload
  }

  public getUuid() {
    return this.payload.uuid
  }

  public getItem(): I {
    return this.item
  }

  public getResult(): P {
    if (this.type === MutationType.NonDirtying) {
      return this.payload.copy()
    }

    const result = this.payload.copy({
      dirty: true,
      dirtyIndex: getIncrementedDirtyIndex(),
    })

    return result
  }

  public setBeginSync(began: Date, globalDirtyIndex: number) {
    this.payload = this.payload.copy({
      lastSyncBegan: began,
      globalDirtyIndexAtLastSync: globalDirtyIndex,
    })
  }

  public set errorDecrypting(_: boolean) {
    throw Error('This method is no longer implemented')
  }

  public set updated_at(_: Date) {
    throw Error('This method is no longer implemented')
  }

  public set updated_at_timestamp(_: number) {
    throw Error('This method is no longer implemented')
  }
}
