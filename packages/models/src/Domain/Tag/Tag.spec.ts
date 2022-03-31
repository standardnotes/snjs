import { SNTag } from './Tag'
import {
  ContentReference,
  CreateMaxPayloadFromAnyObject,
  FillItemContent,
} from '@standardnotes/payloads'
import { ContentType } from '@standardnotes/common'

const randUuid = () => String(Math.random())

const create = (title: string, references?: ContentReference[]): SNTag => {
  const tag = new SNTag(
    CreateMaxPayloadFromAnyObject({
      uuid: randUuid(),
      content_type: ContentType.Tag,
      content: FillItemContent({
        title,
        references,
      }),
    }),
  )

  return tag
}

describe('SNTag Tests', () => {
  it('should count notes in the basic case', () => {
    const tag = create('helloworld', [
      { uuid: randUuid(), content_type: ContentType.Note },
      { uuid: randUuid(), content_type: ContentType.Note },
      { uuid: randUuid(), content_type: ContentType.Tag },
    ])

    expect(tag.noteCount).toEqual(2)
  })
})