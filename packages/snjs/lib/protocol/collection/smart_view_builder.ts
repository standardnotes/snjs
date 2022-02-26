import { SystemViewId } from './../../models/app/smartTag';
import { NotesDisplayCriteria } from '@Lib/protocol/collection/notes_display_criteria';
import { ContentType } from '@standardnotes/common';
import {
  CompoundPredicate,
  CreateMaxPayloadFromAnyObject,
  FillItemContent,
  Predicate,
} from '@standardnotes/payloads';
import { SmartView, SmartViewContent } from '@Lib/models/app/smartTag';

export function BuildSmartViews(criteria: NotesDisplayCriteria): SmartView[] {
  const notes = new SmartView(
    CreateMaxPayloadFromAnyObject({
      uuid: SystemViewId.AllNotes,
      content_type: ContentType.SmartView,
      content: FillItemContent({
        title: 'Notes',
        predicate: allNotesPredicate(criteria),
      } as SmartViewContent),
    })
  );

  const archived = new SmartView(
    CreateMaxPayloadFromAnyObject({
      uuid: SystemViewId.ArchivedNotes,
      content_type: ContentType.SmartView,
      content: FillItemContent({
        title: 'Archived',
        predicate: archivedNotesPredicate(criteria),
      } as SmartViewContent),
    })
  );

  const trash = new SmartView(
    CreateMaxPayloadFromAnyObject({
      uuid: SystemViewId.TrashedNotes,
      content_type: ContentType.SmartView,
      content: FillItemContent({
        title: 'Trash',
        predicate: trasheddNotesPredicate(criteria),
      } as SmartViewContent),
    })
  );

  return [notes, archived, trash];
}

function allNotesPredicate(criteria: NotesDisplayCriteria) {
  const predicate = new CompoundPredicate('and', [
    new Predicate('content_type', '=', ContentType.Note),
    new Predicate('trashed', '=', criteria.includeTrashed),
    new Predicate('protected', '=', criteria.includeProtected),
    new Predicate('archived', '=', criteria.includeArchived),
    new Predicate('pinned', '=', criteria.includePinned),
  ]);

  return predicate;
}

function archivedNotesPredicate(criteria: NotesDisplayCriteria) {
  const predicate = new CompoundPredicate('and', [
    new Predicate('archived', '=', true),
    new Predicate('content_type', '=', ContentType.Note),
    new Predicate('trashed', '=', criteria.includeTrashed),
    new Predicate('protected', '=', criteria.includeProtected),
    new Predicate('pinned', '=', criteria.includePinned),
  ]);

  return predicate;
}

function trasheddNotesPredicate(criteria: NotesDisplayCriteria) {
  const predicate = new CompoundPredicate('and', [
    new Predicate('trashed', '=', true),
    new Predicate('content_type', '=', ContentType.Note),
    new Predicate('archived', '=', criteria.includeArchived),
    new Predicate('protected', '=', criteria.includeProtected),
    new Predicate('pinned', '=', criteria.includePinned),
  ]);

  return predicate;
}
