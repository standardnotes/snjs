import { PayloadSource } from './../../Abstract/Payload/Types/PayloadSource'
import { DecryptedPayload } from './../../Abstract/Payload/Implementations/DecryptedPayload'
import { NoteContent, SNNote } from './Note'
import { ContentType } from '@standardnotes/common'
import { FillItemContent } from '../../Abstract/Item/Interfaces/ItemContent'

const randUuid = () => String(Math.random())

const create = (payload?: Partial<NoteContent>): SNNote =>
  new SNNote(
    new DecryptedPayload(
      {
        uuid: randUuid(),
        content_type: ContentType.Note,
        content: FillItemContent({ ...payload }),
      },
      PayloadSource.Constructor,
    ),
  )

describe('SNNote Tests', () => {
  it('should safely type required fields of Note when creating from PayloadContent', () => {
    const note = create({
      title: 'Expected string',
      text: ['unexpected array'] as never,
      preview_plain: 'Expected preview',
      preview_html: {} as never,
      hidePreview: 'string' as never,
    })

    expect([
      typeof note.title,
      typeof note.text,
      typeof note.preview_html,
      typeof note.preview_plain,
      typeof note.hidePreview,
    ]).toStrictEqual(['string', 'string', 'string', 'string', 'boolean'])
  })

  it('should preserve falsy values when casting from PayloadContent', () => {
    const note = create({
      preview_plain: null as never,
      preview_html: undefined,
    })

    expect(note.preview_plain).toBeFalsy()
    expect(note.preview_html).toBeFalsy()
  })

  it('should set mobilePrefersPlainEditor when given a valid choice', () => {
    const selected = create({
      mobilePrefersPlainEditor: true,
    })

    const unselected = create()

    expect(selected.mobilePrefersPlainEditor).toBeTruthy()
    expect(unselected.mobilePrefersPlainEditor).toBe(undefined)
  })
})
