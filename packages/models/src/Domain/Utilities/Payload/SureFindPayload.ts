import { Uuid } from '@standardnotes/common'
import { PayloadInterface } from '../../Abstract/Payload/Interfaces/PayloadInterface'

export function SureFindPayload<P extends PayloadInterface = PayloadInterface>(
  uuid: Uuid,
  payloads: P[],
): P {
  return payloads.find((payload) => payload.uuid === uuid) as P
}
