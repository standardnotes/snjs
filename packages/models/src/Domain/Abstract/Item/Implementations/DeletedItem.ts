import { GenericItem } from './GenericItem'
import { DeletedPayloadInterface } from '../../Payload'
import { DeletedItemInterface } from '../Interfaces/DeletedItem'
import { DeletedTransferPayload } from '../../TransferPayload'

export class DeletedItem
  extends GenericItem<DeletedPayloadInterface>
  implements DeletedItemInterface
{
  deleted: true
  content: undefined

  constructor(payload: DeletedPayloadInterface) {
    super(payload)
  }

  public payloadRepresentation(
    override?: Partial<DeletedTransferPayload>,
  ): DeletedPayloadInterface {
    return this.payload.copy(override)
  }
}
