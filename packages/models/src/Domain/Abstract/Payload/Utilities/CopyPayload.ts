import { CreatePayload } from './CreatePayload'
import { DecryptedPayloadInterface } from '../Interfaces/DecryptedPayload'
import { ItemContent } from '../../Item'
import { ConcreteTransferPayload, DecryptedTransferPayload } from '../../TransferPayload'
import { ConcretePayload } from '../Interfaces/TypeCheck'

export function CopyPayload<T extends ConcreteTransferPayload, P extends ConcretePayload>(
  payload: P,
  override?: Partial<T>,
  source = payload.source,
): P {
  const params: T = {
    ...(payload.ejected() as T),
    ...override,
  }
  const result = CreatePayload(params, source)
  return result as unknown as P
}

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
