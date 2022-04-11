import { ContentType } from '@standardnotes/common'
import { FillItemContent } from '../../Abstract/Content/ItemContent'
import {
  DecryptedPayload,
  DecryptedPayloadInterface,
  DeletedPayload,
  isDeletedPayload,
} from '../../Abstract/Payload'
import { NoteContent } from '../../Syncable/Note'
import { MergePayloads } from './MergePayloads'

describe('MergePayload', () => {
  it('merges non deleted payload onto deleted base', () => {
    const base = new DeletedPayload({
      uuid: '123',
      content_type: ContentType.Note,
      content: undefined,
      deleted: true,
    })

    const nondeleted = new DecryptedPayload({
      uuid: '123',
      content_type: ContentType.Note,
      content: FillItemContent<NoteContent>({ title: 'foo' }),
    })

    const merged = MergePayloads(base, nondeleted)

    expect(isDeletedPayload(merged)).toEqual(false)

    const mergedAsDecrypted = merged as DecryptedPayloadInterface<NoteContent>

    expect(mergedAsDecrypted.content.title).toEqual('foo')
  })
})
