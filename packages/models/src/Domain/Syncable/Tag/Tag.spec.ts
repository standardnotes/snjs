import { SNTag, TagContent } from './Tag'
import { ContentType } from '@standardnotes/common'
import { CreateMaxPayloadFromAnyObject } from '../../Abstract/Payload/Utilities/Functions'
import { FillItemContent } from '../../Abstract/Item/Interfaces/ItemContent'
import { ContentReference } from '../../Abstract/Reference/ContentReference'

const randUuid = () => String(Math.random())

const create = (title: string, references: ContentReference[] = []): SNTag => {
  const tag = new SNTag(
    CreateMaxPayloadFromAnyObject({
      uuid: randUuid(),
      content_type: ContentType.Tag,
      content: FillItemContent({
        title,
        references,
      } as TagContent),
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
