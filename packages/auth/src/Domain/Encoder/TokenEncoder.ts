import { sign } from 'jsonwebtoken'

import { TokenEncoderInterface } from './TokenEncoderInterface'

export class TokenEncoder<T> implements TokenEncoderInterface<T> {
  constructor(
    private jwtSecret: string,
  ) {
  }

  encodeToken(data: T): string {
    return sign(JSON.stringify(data), this.jwtSecret, { algorithm: 'HS256' })
  }
}
