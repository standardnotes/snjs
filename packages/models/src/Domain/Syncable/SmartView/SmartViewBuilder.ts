import { DecryptedPayload } from './../../Abstract/Payload/Implementations/DecryptedPayload'
import { SNNote } from '../Note/Note'
import { SmartViewContent, SmartView, SystemViewId } from './SmartView'
import { ItemWithTags } from '../../Runtime/Display/Search/ItemWithTags'
import { ContentType } from '@standardnotes/common'
import { FillItemContent } from '../../Abstract/Content/ItemContent'
import { Predicate } from '../../Runtime/Predicate/Predicate'
import { CompoundPredicate } from '../../Runtime/Predicate/CompoundPredicate'
import { PayloadTimestampDefaults } from '../../Abstract/Payload'
import { FilterDisplayOptions } from '../../Runtime/Display'
import { PredicateInterface } from '../../Runtime/Predicate/Interface'

export function BuildSmartViews(options: FilterDisplayOptions): SmartView[] {
  const notesAndFiles = new SmartView(
    new DecryptedPayload({
      uuid: SystemViewId.AllNotesAndFiles,
      content_type: ContentType.SmartView,
      ...PayloadTimestampDefaults(),
      content: FillItemContent<SmartViewContent>({
        title: 'Notes & Files',
        predicate: allNotesAndFilesPredicate(options).toJson(),
      }),
    }),
  )

  const archived = new SmartView(
    new DecryptedPayload({
      uuid: SystemViewId.ArchivedNotes,
      content_type: ContentType.SmartView,
      ...PayloadTimestampDefaults(),
      content: FillItemContent<SmartViewContent>({
        title: 'Archived',
        predicate: archivedNotesPredicate(options).toJson(),
      }),
    }),
  )

  const trash = new SmartView(
    new DecryptedPayload({
      uuid: SystemViewId.TrashedNotes,
      content_type: ContentType.SmartView,
      ...PayloadTimestampDefaults(),
      content: FillItemContent<SmartViewContent>({
        title: 'Trash',
        predicate: trashedNotesPredicate(options).toJson(),
      }),
    }),
  )

  const untagged = new SmartView(
    new DecryptedPayload({
      uuid: SystemViewId.UntaggedNotes,
      content_type: ContentType.SmartView,
      ...PayloadTimestampDefaults(),
      content: FillItemContent<SmartViewContent>({
        title: 'Untagged',
        predicate: untaggedNotesPredicate(options).toJson(),
      }),
    }),
  )

  return [notesAndFiles, archived, trash, untagged]
}

function allNotesAndFilesPredicate(options: FilterDisplayOptions) {
  const subPredicates: PredicateInterface<SNNote>[] = []

  const notesAndFilesPredicate = new CompoundPredicate('or', [
    new Predicate('content_type', '=', ContentType.Note),
    new Predicate('content_type', '=', ContentType.File),
  ])
  subPredicates.push(notesAndFilesPredicate)

  if (options.includeTrashed === false) {
    subPredicates.push(new Predicate('trashed', '=', false))
  }
  if (options.includeArchived === false) {
    subPredicates.push(new Predicate('archived', '=', false))
  }
  if (options.includeProtected === false) {
    subPredicates.push(new Predicate('protected', '=', false))
  }
  if (options.includePinned === false) {
    subPredicates.push(new Predicate('pinned', '=', false))
  }
  const predicate = new CompoundPredicate('and', subPredicates)

  return predicate
}

function archivedNotesPredicate(options: FilterDisplayOptions) {
  const subPredicates: Predicate<SNNote>[] = [
    new Predicate('archived', '=', true),
    new Predicate('content_type', '=', ContentType.Note),
  ]
  if (options.includeTrashed === false) {
    subPredicates.push(new Predicate('trashed', '=', false))
  }
  if (options.includeProtected === false) {
    subPredicates.push(new Predicate('protected', '=', false))
  }
  if (options.includePinned === false) {
    subPredicates.push(new Predicate('pinned', '=', false))
  }
  const predicate = new CompoundPredicate('and', subPredicates)

  return predicate
}

function trashedNotesPredicate(options: FilterDisplayOptions) {
  const subPredicates: Predicate<SNNote>[] = [
    new Predicate('trashed', '=', true),
    new Predicate('content_type', '=', ContentType.Note),
  ]
  if (options.includeArchived === false) {
    subPredicates.push(new Predicate('archived', '=', false))
  }
  if (options.includeProtected === false) {
    subPredicates.push(new Predicate('protected', '=', false))
  }
  if (options.includePinned === false) {
    subPredicates.push(new Predicate('pinned', '=', false))
  }
  const predicate = new CompoundPredicate('and', subPredicates)

  return predicate
}

function untaggedNotesPredicate(options: FilterDisplayOptions) {
  const subPredicates = [
    new Predicate('content_type', '=', ContentType.Note),
    new Predicate<ItemWithTags>('tagsCount', '=', 0),
  ]
  if (options.includeArchived === false) {
    subPredicates.push(new Predicate('archived', '=', false))
  }
  if (options.includeProtected === false) {
    subPredicates.push(new Predicate('protected', '=', false))
  }
  if (options.includePinned === false) {
    subPredicates.push(new Predicate('pinned', '=', false))
  }
  const predicate = new CompoundPredicate('and', subPredicates)

  return predicate
}
