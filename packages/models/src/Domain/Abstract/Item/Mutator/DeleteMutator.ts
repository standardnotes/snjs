import { DeletedPayload } from './../../Payload/Implementations/DeletedPayload'
import { DeletedPayloadInterface, PayloadInterface } from '../../Payload'
import { ItemInterface } from '../Interfaces/ItemInterface'
import { ItemMutator } from './ItemMutator'
import { MutationType } from '../Types/MutationType'

export class DeleteItemMutator<
  I extends ItemInterface<PayloadInterface> = ItemInterface<PayloadInterface>,
> extends ItemMutator<PayloadInterface, I> {
  public getDeletedResult(): DeletedPayloadInterface {
    const dirtying = this.type !== MutationType.NonDirtying
    const result = new DeletedPayload(
      {
        ...this.payload.ejected(),
        deleted: true,
        content: undefined,
        dirty: dirtying ? true : this.payload.dirty,
        dirtiedDate: dirtying ? new Date() : this.payload.dirtiedDate,
      },
      this.payload.source,
    )

    return result
  }

  public override getResult(): PayloadInterface {
    throw Error('Must use getDeletedResult')
  }
}
