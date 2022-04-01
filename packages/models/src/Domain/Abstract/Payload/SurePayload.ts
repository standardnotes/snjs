import { ItemContent } from '../Item/ItemContent'
import { PayloadInterface } from './PayloadInterface'

/** A payload but sguaranteed not to be errorDecrypting, and thus has objectified content */
export type SurePayload<C extends ItemContent> = PayloadInterface<C> & {
  content: C
}
