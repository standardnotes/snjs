import { EncryptedPayloadInterface } from '../Interfaces/EncryptedPayload'
import { ContentlessPayload } from './ContentlessPayload'

describe('contentless payloads', () => {
  it('creating with content should result in no content', () => {
    const payload = new ContentlessPayload({
      content: 'foo',
    } as never)

    expect((payload as unknown as EncryptedPayloadInterface).content).toBeUndefined
    expect((payload as unknown as EncryptedPayloadInterface).ejected().content).toBeUndefined
  })
})
