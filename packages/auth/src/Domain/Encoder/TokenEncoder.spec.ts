import 'reflect-metadata'

import { TokenEncoder } from './TokenEncoder'

describe('TokenEncoder', () => {
  const jwtSecret = 'secret'

  const createEncoder = () => new TokenEncoder(jwtSecret)

  it('should encode a token', () => {
    expect(createEncoder().encodeToken({
      user_uuid: '123',
    }))
      .toEqual('eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX3V1aWQiOiIxMjMifQ.dC6O32I6QskBy3-sskjYY8as_KFo8wFrbwph2l9n6y0')
  })
})
