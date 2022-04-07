import { ServerItemResponse } from '@standardnotes/responses'
import {
  EncryptedPayloadInterface,
  DeletedPayloadInterface,
  PayloadSource,
  DeletedPayload,
  EncryptedPayload,
} from '@standardnotes/models'

export function CreatePayloadFromRawServerItem(
  rawItem: ServerItemResponse,
  source: PayloadSource,
): EncryptedPayloadInterface | DeletedPayloadInterface {
  if (rawItem.deleted) {
    return new DeletedPayload({ ...rawItem, content: undefined, deleted: true }, source)
  } else if (rawItem.content != undefined) {
    return new EncryptedPayload(
      {
        ...rawItem,
        content: rawItem.content,
        deleted: false,
      },
      source,
    )
  }

  throw Error('Unhandled case in createPayloadFromRawItem')
}
