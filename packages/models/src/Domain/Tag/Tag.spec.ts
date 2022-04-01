import { SNTag } from './Tag'
import { ContentType } from '@standardnotes/common'
import { CreateMaxPayloadFromAnyObject, FillItemContent } from '../Payload/Functions'
import { ContentReference } from '../Reference/ContentReference'

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
