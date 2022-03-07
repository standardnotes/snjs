import { Uuid } from '@standardnotes/common'
import { GetSingleItemResponse } from '@standardnotes/responses'

export interface ItemApiInterface {
  getSingleItem(itemUuid: Uuid): Promise<GetSingleItemResponse>
}
