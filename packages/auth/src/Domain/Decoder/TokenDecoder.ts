import { verify } from 'jsonwebtoken'

import { Token } from '../Token/Token'
import { OfflineUserTokenData } from '../Token/OfflineUserTokenData'
import { TokenDecoderInterface } from './TokenDecoderInterface'

export class TokenDecoder implements TokenDecoderInterface {
  constructor(
    private jwtSecret: string,
    private legacyJwtSecret: string,
    private authJwtSecret: string,
  ) {
  }

  decodeCrossServiceCommunicationToken(token: string): Token | undefined {
    try {
      return <Token> verify(token, this.authJwtSecret, {
        algorithms: [ 'HS256' ],
      })
    } catch (error) {
      return undefined
    }
  }

  decodeCrossServiceCommunicationOfflineToken(token: string): OfflineUserTokenData | undefined {
    try {
      return <OfflineUserTokenData> verify(token, this.authJwtSecret, {
        algorithms: [ 'HS256' ],
      })
    } catch (error) {
      return undefined
    }
  }

  decodeSessionToken(token: string): Record<string, unknown> | undefined {
    try {
      return <Record<string, unknown>> verify(token, this.jwtSecret, {
        algorithms: [ 'HS256' ],
      })
    } catch (error) {
      try {
        return <Record<string, unknown>> verify(token, this.legacyJwtSecret, {
          algorithms: [ 'HS256' ],
        })
      } catch (legacyError) {
        return undefined
      }
    }
  }
}
