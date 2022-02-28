import { Uuid } from '@standardnotes/common'
import { GetSingleItemResponse, HttpResponse } from '@standardnotes/responses'

export interface ItemApiInterface {
  getSingleItem(itemUuid: Uuid): Promise<GetSingleItemResponse | HttpResponse>
}
