import 'reflect-metadata'

import { SnCryptoNode } from '@standardnotes/sncrypto-node'

import { Crypter } from './Crypter'

describe('Crypter', () => {
  let crypto: SnCryptoNode

  const createCrypter = () => new Crypter(crypto, 'hexiv')

  beforeEach(() => {
    crypto = {} as jest.Mocked<SnCryptoNode>
    crypto.aes256GcmEncrypt = jest.fn().mockReturnValue({
      iv: 'encrypted-iv',
      tag: 'encrypted-tag',
      ciphertext: 'encrypted-ciphertext',
      encoding: 'utf8',
      aad: 'encrypted-aad',
    })
    crypto.aes256GcmDecrypt = jest.fn().mockReturnValue('decrypted')
  })

  it('should encrypt a string', async () => {
    const crypter = createCrypter()

    expect(await crypter.encrypt('test', 'secretKey')).toEqual('{"iv":"encrypted-iv","tag":"encrypted-tag","ciphertext":"encrypted-ciphertext","encoding":"utf8","aad":"encrypted-aad"}')
  })

  it('should encrypt a string with default hex iv', async () => {
    const crypter = new Crypter(crypto)

    expect(await crypter.encrypt('test', 'secretKey')).toEqual('{"iv":"encrypted-iv","tag":"encrypted-tag","ciphertext":"encrypted-ciphertext","encoding":"utf8","aad":"encrypted-aad"}')
  })

  it('should decrypt a string', async () => {
    const crypter = createCrypter()

    expect(await crypter.decrypt('{"iv":"encrypted-iv","tag":"encrypted-tag","ciphertext":"encrypted-ciphertext","encoding":"utf8","aad":"encrypted-aad"}', 'secretKey')).toEqual('decrypted')
  })
})
