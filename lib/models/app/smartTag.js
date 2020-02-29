import { SNTag } from '@Models/app/tag';
import { ContentTypes } from '@Models/content_types';
import { SFPredicate } from '@Models/core/predicate';
import { CreateMaxPayloadFromAnyObject } from '@Payloads/generator';

const SYSTEM_TAG_ALL_NOTES = 'all-notes';
const SYSTEM_TAG_ARCHIVED_NOTES = 'archived-notes';
const SYSTEM_TAG_TRASHED_NOTES = 'trashed-notes';

/**
 * A tag that defines a predicate that consumers can use to retrieve a dynamic
 * list of notes.
 */
export class SNSmartTag extends SNTag {
  constructor(payload) {
    super(payload);
    this.content_type = ContentTypes.SmartTag;
  }

  static systemSmartTags() {
    const allNotes = CreateMaxPayloadFromAnyObject({
      object: {
        uuid: SYSTEM_TAG_ALL_NOTES,
        dummy: true,
        content: {
          title: 'All notes',
          isSystemTag: true,
          isAllTag: true,
          predicate: new SFPredicate.FromArray(['content_type', '=', ContentTypes.Note])
        }
      }
    });
    const archived = CreateMaxPayloadFromAnyObject({
      object: {
        uuid: SYSTEM_TAG_ARCHIVED_NOTES,
        dummy: true,
        content: {
          title: 'Archived',
          isSystemTag: true,
          isArchiveTag: true,
          predicate: new SFPredicate.FromArray(['archived', '=', true])
        }
      }
    });
    const trash = CreateMaxPayloadFromAnyObject({
      object: {
        uuid: SYSTEM_TAG_TRASHED_NOTES,
        dummy: true,
        content: {
          title: 'Trash',
          isSystemTag: true,
          isTrashTag: true,
          predicate: new SFPredicate.FromArray(['content.trashed', '=', true])
        }
      }
    });
    return [
      new SNSmartTag(allNotes),
      new SNSmartTag(archived),
      new SNSmartTag(trash)
    ];
  }
}
