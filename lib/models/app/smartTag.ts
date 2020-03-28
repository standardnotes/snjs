import { SNTag } from '@Models/app/tag';
import { ContentTypes } from '@Models/content_types';
import { SNPredicate } from '@Models/core/predicate';
import { CreateMaxPayloadFromAnyObject } from '@Payloads/generator';
import { CreateItemFromPayload } from '../generator';

const SYSTEM_TAG_ALL_NOTES = 'all-notes';
const SYSTEM_TAG_ARCHIVED_NOTES = 'archived-notes';
const SYSTEM_TAG_TRASHED_NOTES = 'trashed-notes';

/**
 * A tag that defines a predicate that consumers can use to retrieve a dynamic
 * list of notes.
 */
export class SNSmartTag extends SNTag {
  
  getDefaultContentType() {
    return ContentTypes.SmartTag;
  }

  static systemSmartTags() {
    const allNotes = CreateMaxPayloadFromAnyObject(
      {
        uuid: SYSTEM_TAG_ALL_NOTES,
        dummy: true,
        content: {
          title: 'All notes',
          isSystemTag: true,
          isAllTag: true,
          predicate: new SNPredicate.FromArray(['content_type', '=', ContentTypes.Note])
        }
      }
    );
    const archived = CreateMaxPayloadFromAnyObject(
      {
        uuid: SYSTEM_TAG_ARCHIVED_NOTES,
        dummy: true,
        content: {
          title: 'Archived',
          isSystemTag: true,
          isArchiveTag: true,
          predicate: new SNPredicate.FromArray(['archived', '=', true])
        }
      }
    );
    const trash = CreateMaxPayloadFromAnyObject(
      {
        uuid: SYSTEM_TAG_TRASHED_NOTES,
        dummy: true,
        content: {
          title: 'Trash',
          isSystemTag: true,
          isTrashTag: true,
          predicate: new SNPredicate.FromArray(['content.trashed', '=', true])
        }
      }
    );
    return [
      CreateItemFromPayload(allNotes),
      CreateItemFromPayload(archived),
      CreateItemFromPayload(trash)
    ];
  }
}
