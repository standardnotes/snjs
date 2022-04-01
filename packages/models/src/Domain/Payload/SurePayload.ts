import { PayloadContent } from './PayloadContent'
import { PayloadInterface } from './PayloadInterface'

/** A payload but sguaranteed not to be errorDecrypting, and thus has objectified content */
export type SurePayload<C extends PayloadContent> = PayloadInterface<C> & {
  content: C
}
