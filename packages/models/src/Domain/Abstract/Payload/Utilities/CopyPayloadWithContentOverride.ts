import { CreatePayload } from './CreatePayload'
import { DecryptedPayloadInterface } from '../Interfaces/DecryptedPayload'
import { ItemContent } from '../../Content/ItemContent'
import { DecryptedTransferPayload } from '../../TransferPayload'

export function CopyPayloadWithContentOverride<C extends ItemContent = ItemContent>(
  payload: DecryptedPayloadInterface<C>,
  contentOverride: Partial<C>,
): DecryptedPayloadInterface<C> {
  const params: DecryptedTransferPayload<C> = {
    ...payload.ejected(),
    content: {
      ...payload.content,
      ...contentOverride,
    },
  }
  const result = CreatePayload(params, payload.source)
  return result
}
