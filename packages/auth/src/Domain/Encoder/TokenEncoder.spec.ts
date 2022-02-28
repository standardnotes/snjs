import 'reflect-metadata'

import { verify } from 'jsonwebtoken'

import { TokenEncoder } from './TokenEncoder'

describe('TokenEncoder', () => {
  const jwtSecret = 'secret'

  const createEncoder = () => new TokenEncoder<{ user_uuid: string }>(jwtSecret)

  it('should encode a token', () => {
    const encodedToken = createEncoder().encodeToken({ user_uuid: '123' })

    expect((verify(encodedToken, jwtSecret)).user_uuid).toEqual('123')
    expect((verify(encodedToken, jwtSecret)).exp).toBeUndefined()
  })

  it('should encode an expirable token', () => {
    const encodedToken = createEncoder().encodeExpirableToken({ user_uuid: '123' }, 123)

    expect((verify(encodedToken, jwtSecret)).user_uuid).toEqual('123')
    expect((verify(encodedToken, jwtSecret)).exp).toBeGreaterThan(0)
  })
})
