import { MicrosecondsTimestamp } from '../DataType/MicrosecondsTimestamp'
import { Uuid } from '../DataType/Uuid'

export type IntegrityPayload = {
  uuid: Uuid
  updated_at_timestamp: MicrosecondsTimestamp
}
