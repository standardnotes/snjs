import { TagContent } from './../../Syncable/Tag/Tag'
import { ContentType } from '@standardnotes/common'
import { FillItemContent } from '../../Abstract/Content/ItemContent'
import { DecryptedPayload, PayloadSource, PayloadTimestampDefaults } from '../../Abstract/Payload'
import { FileContent, SNFile } from '../../Syncable/File'
import { NoteContent, SNNote } from '../../Syncable/Note'
import { SNTag } from '../../Syncable/Tag'

let currentId = 0

export const mockUuid = () => {
  return `${currentId++}`
}

export const createNote = (payload?: Partial<NoteContent>): SNNote => {
  return new SNNote(
    new DecryptedPayload(
      {
        uuid: mockUuid(),
        content_type: ContentType.Note,
        content: FillItemContent({ ...payload }),
        ...PayloadTimestampDefaults(),
      },
      PayloadSource.Constructor,
    ),
  )
}

export const createNoteWithContent = (content: Partial<NoteContent>): SNNote => {
  return new SNNote(
    new DecryptedPayload(
      {
        uuid: mockUuid(),
        content_type: ContentType.Note,
        content: FillItemContent<NoteContent>(content),
        ...PayloadTimestampDefaults(),
      },
      PayloadSource.Constructor,
    ),
  )
}

export const createTag = (title = 'photos') => {
  return new SNTag(
    new DecryptedPayload(
      {
        uuid: mockUuid(),
        content_type: ContentType.Tag,
        content: FillItemContent<TagContent>({ title }),
        ...PayloadTimestampDefaults(),
      },
      PayloadSource.Constructor,
    ),
  )
}

export const createFile = (name = 'screenshot.png') => {
  return new SNFile(
    new DecryptedPayload(
      {
        uuid: mockUuid(),
        content_type: ContentType.File,
        content: FillItemContent<FileContent>({ name }),
        ...PayloadTimestampDefaults(),
      },
      PayloadSource.Constructor,
    ),
  )
}
