import { verify } from 'jsonwebtoken'

import { TokenDecoderInterface } from './TokenDecoderInterface'
export class TokenDecoder implements TokenDecoderInterface {
  constructor(
    private jwtSecret: string,
  ) {
  }

  decodeToken<T>(token: string): T | undefined {
    try {
      return <T> verify(token, this.jwtSecret, {
        algorithms: [ 'HS256' ],
      })
    } catch (error) {
      return undefined
    }
  }
}
