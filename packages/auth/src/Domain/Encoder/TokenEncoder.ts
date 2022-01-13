import { sign } from 'jsonwebtoken'

import { TokenEncoderInterface } from './TokenEncoderInterface'

export class TokenEncoder implements TokenEncoderInterface {
  constructor(
    private jwtSecret: string,
  ) {
  }

  encodeToken<T>(data: T): string {
    return sign(JSON.stringify(data), this.jwtSecret, { algorithm: 'HS256' })
  }
}
