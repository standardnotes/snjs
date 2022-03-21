import { NoteWithTags } from './note_with_tags'
import { SystemViewId } from '../../models/SmartView/SmartView'
import { NotesDisplayCriteria } from '@Lib/protocol/collection/notes_display_criteria'
import { ContentType } from '@standardnotes/common'
import {
  CompoundPredicate,
  CreateMaxPayloadFromAnyObject,
  FillItemContent,
  Predicate,
} from '@standardnotes/payloads'
import { SmartView, SmartViewContent } from '@Lib/models/SmartView/SmartView'

export function BuildSmartViews(criteria: NotesDisplayCriteria): SmartView[] {
  const notes = new SmartView(
    CreateMaxPayloadFromAnyObject({
      uuid: SystemViewId.AllNotes,
      content_type: ContentType.SmartView,
      content: FillItemContent({
        title: 'Notes',
        predicate: allNotesPredicate(criteria).toJson(),
      } as SmartViewContent),
    }),
  )

  const archived = new SmartView(
    CreateMaxPayloadFromAnyObject({
      uuid: SystemViewId.ArchivedNotes,
      content_type: ContentType.SmartView,
      content: FillItemContent({
        title: 'Archived',
        predicate: archivedNotesPredicate(criteria).toJson(),
      } as SmartViewContent),
    }),
  )

  const trash = new SmartView(
    CreateMaxPayloadFromAnyObject({
      uuid: SystemViewId.TrashedNotes,
      content_type: ContentType.SmartView,
      content: FillItemContent({
        title: 'Trash',
        predicate: trashedNotesPredicate(criteria).toJson(),
      } as SmartViewContent),
    }),
  )

  const untagged = new SmartView(
    CreateMaxPayloadFromAnyObject({
      uuid: SystemViewId.UntaggedNotes,
      content_type: ContentType.SmartView,
      content: FillItemContent({
        title: 'Untagged',
        predicate: untaggedNotesPredicate(criteria).toJson(),
      } as SmartViewContent),
    }),
  )

  return [notes, archived, trash, untagged]
}

function allNotesPredicate(criteria: NotesDisplayCriteria) {
  const subPredicates = [new Predicate('content_type', '=', ContentType.Note)]

  if (criteria.includeTrashed === false) {
    subPredicates.push(new Predicate('trashed', '=', false))
  }
  if (criteria.includeArchived === false) {
    subPredicates.push(new Predicate('archived', '=', false))
  }
  if (criteria.includeProtected === false) {
    subPredicates.push(new Predicate('protected', '=', false))
  }
  if (criteria.includePinned === false) {
    subPredicates.push(new Predicate('pinned', '=', false))
  }
  const predicate = new CompoundPredicate('and', subPredicates)

  return predicate
}

function archivedNotesPredicate(criteria: NotesDisplayCriteria) {
  const subPredicates = [
    new Predicate('archived', '=', true),
    new Predicate('content_type', '=', ContentType.Note),
  ]
  if (criteria.includeTrashed === false) {
    subPredicates.push(new Predicate('trashed', '=', false))
  }
  if (criteria.includeProtected === false) {
    subPredicates.push(new Predicate('protected', '=', false))
  }
  if (criteria.includePinned === false) {
    subPredicates.push(new Predicate('pinned', '=', false))
  }
  const predicate = new CompoundPredicate('and', subPredicates)

  return predicate
}

function trashedNotesPredicate(criteria: NotesDisplayCriteria) {
  const subPredicates = [
    new Predicate('trashed', '=', true),
    new Predicate('content_type', '=', ContentType.Note),
  ]
  if (criteria.includeArchived === false) {
    subPredicates.push(new Predicate('archived', '=', false))
  }
  if (criteria.includeProtected === false) {
    subPredicates.push(new Predicate('protected', '=', false))
  }
  if (criteria.includePinned === false) {
    subPredicates.push(new Predicate('pinned', '=', false))
  }
  const predicate = new CompoundPredicate('and', subPredicates)

  return predicate
}

function untaggedNotesPredicate(criteria: NotesDisplayCriteria) {
  const subPredicates = [
    new Predicate('content_type', '=', ContentType.Note),
    new Predicate<NoteWithTags>('tagsCount', '=', 0),
  ]
  if (criteria.includeArchived === false) {
    subPredicates.push(new Predicate('archived', '=', false))
  }
  if (criteria.includeProtected === false) {
    subPredicates.push(new Predicate('protected', '=', false))
  }
  if (criteria.includePinned === false) {
    subPredicates.push(new Predicate('pinned', '=', false))
  }
  const predicate = new CompoundPredicate('and', subPredicates)

  return predicate
}
