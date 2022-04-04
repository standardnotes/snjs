import { DeletedPayload } from './../../Payload/Implementations/DeletedPayload'
import { MutationType } from '../Types/MutationType'
import { CopyPayload } from '../../Payload/Utilities/Functions'
import { GenericItem } from '../Implementations/GenericItem'
import { PayloadInterface } from '../../Payload'

/**
 * An item mutator takes in an item, and an operation, and returns the resulting payload.
 * Subclasses of mutators can modify the content field directly, but cannot modify the payload directly.
 * All changes to the payload must occur by copying the payload and reassigning its value.
 */
export class ItemMutator {
  public readonly item: GenericItem
  protected payload: PayloadInterface
  protected readonly type: MutationType

  constructor(item: GenericItem, type: MutationType) {
    this.item = item
    this.type = type
    this.payload = item.payload
  }

  public getUuid() {
    return this.payload.uuid
  }

  public getItem() {
    return this.item
  }

  public getResult() {
    if (this.type === MutationType.NonDirtying) {
      return CopyPayload(this.payload)
    }

    const result = CopyPayload(this.payload, {
      dirty: true,
      dirtiedDate: new Date(),
    })

    return result
  }

  public setDeleted() {
    this.payload = new DeletedPayload(
      {
        ...this.payload,
        deleted: true,
        content: undefined,
      },
      this.payload.source,
    )
  }

  public set lastSyncBegan(began: Date) {
    this.payload = CopyPayload(this.payload, {
      lastSyncBegan: began,
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
