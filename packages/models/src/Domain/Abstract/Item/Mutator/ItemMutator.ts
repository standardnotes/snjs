import { Copy } from '@standardnotes/utils'
import { MutationType } from '../Types/MutationType'
import { DecryptedItem } from '../Implementations/DecryptedItem'
import { ItemContent } from '../Interfaces/ItemContent'
import { PurePayload } from '../../Payload/Implementations/PurePayload'
import { CopyPayload, PayloadByMerging } from '../../Payload/Utilities/Functions'
import { GenericItem } from '../Implementations/GenericItem'
import { PayloadInterface } from '../../Payload'
import { isDecryptedItem } from '../Interfaces/TypeCheck'
import { isDecryptedPayload } from '../../Payload/Interfaces/TypeCheck'

/**
 * An item mutator takes in an item, and an operation, and returns the resulting payload.
 * Subclasses of mutators can modify the content field directly, but cannot modify the payload directly.
 * All changes to the payload must occur by copying the payload and reassigning its value.
 */
export class ItemMutator<C extends ItemContent = ItemContent> {
  public readonly item: GenericItem
  protected payload: PayloadInterface
  protected readonly type: MutationType
  protected content?: C

  constructor(item: GenericItem, type: MutationType) {
    this.item = item
    this.type = type
    this.payload = item.payload

    if (isDecryptedItem(item)) {
      const mutableCopy = Copy(item.payload.content)
      this.content = mutableCopy
    }
  }

  public getUuid() {
    return this.payload.uuid
  }

  public getItem() {
    return this.item
  }

  public getResult() {
    if (this.type === MutationType.NonDirtying) {
      return CopyPayload(this.payload, {
        content: this.content,
      })
    }

    const result = CopyPayload(this.payload, {
      content: this.content,
      dirty: true,
      dirtiedDate: new Date(),
    })

    return result
  }

  /** Merges the input payload with the base payload */
  public mergePayload(payload: PurePayload) {
    const merged = PayloadByMerging(this.payload, payload)
    this.payload = merged

    if (isDecryptedPayload(merged)) {
      const mutableContent = Copy(merged.content)
      this.content = mutableContent
    } else {
      this.content = undefined
    }
  }

  /** Not recommended to use as this might break item schema if used incorrectly */
  public unsafe_setCustomContent(content: ItemContent): void {
    this.content = Copy(content)
  }

  public setDeleted() {
    this.content = undefined
    this.payload = CopyPayload(this.payload, {
      content: this.content,
      deleted: true,
    })
  }

  public set lastSyncBegan(began: Date) {
    this.payload = CopyPayload(this.payload, {
      content: this.content,
      lastSyncBegan: began,
    })
  }

  public set errorDecrypting(errorDecrypting: boolean) {
    this.payload = CopyPayload(this.payload, {
      content: this.content,
      errorDecrypting: errorDecrypting,
    })
  }

  public set updated_at(updated_at: Date) {
    this.payload = CopyPayload(this.payload, {
      updated_at: updated_at,
    })
  }

  public set updated_at_timestamp(updated_at_timestamp: number) {
    this.payload = CopyPayload(this.payload, {
      updated_at_timestamp,
    })
  }
}
