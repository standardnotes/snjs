import { Token } from '../Token/Token'
import { OfflineUserTokenData } from '../Token/OfflineUserTokenData'

export interface TokenDecoderInterface {
  decodeSessionToken(token: string): Record<string, unknown> | undefined
  decodeCrossServiceCommunicationToken(token: string): Token | undefined
  decodeCrossServiceCommunicationOfflineToken(token: string): OfflineUserTokenData | undefined
}
