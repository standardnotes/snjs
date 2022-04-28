import { HexString } from '../Types/HexString'
import { Utf8String } from '../Types/Utf8String'

export interface SNCryptoSha256Interface {
  sha256(text: Utf8String): HexString
}
