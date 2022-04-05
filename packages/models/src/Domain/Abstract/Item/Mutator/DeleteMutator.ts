import { DeletedPayload } from './../../Payload/Implementations/DeletedPayload'
import { DeletedPayloadInterface } from '../../Payload'
import { ItemInterface } from '../Interfaces/ItemInterface'
import { ItemMutator } from './ItemMutator'

export class DeleteItemMutator<
  I extends ItemInterface<DeletedPayloadInterface> = ItemInterface<DeletedPayloadInterface>,
> extends ItemMutator<DeletedPayloadInterface, I> {
  public getResult() {
    const result = new DeletedPayload(
      {
        ...this.payload,
        deleted: true,
        content: undefined,
        dirty: true,
        dirtiedDate: new Date(),
      },
      this.payload.source,
    )

    return result
  }
}
