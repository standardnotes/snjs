import { MicrosecondsTimestamp } from '../DataType/MicrosecondsTimestamp'
import { Uuid } from '../DataType/Uuid'

export type ItemIntegrityHash = {
  uuid: Uuid
  updated_at_timestamp: MicrosecondsTimestamp
}
