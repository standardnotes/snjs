import { FillItemContent } from '@Models/generator';
import { PurePayload } from './../../protocol/payloads/pure_payload';
import { SNTag } from '@Models/app/tag';
import { ContentType } from '@Models/content_types';
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

  public readonly predicate!: SNPredicate
  public readonly isTrashTag: boolean

  constructor(payload: PurePayload) {
    super(payload);
    if(payload.safeContent.predicate) {
      this.predicate = SNPredicate.FromJson(payload.safeContent.predicate);
    }
    this.isTrashTag = payload.safeContent.isTrashTag;
  }

  static systemSmartTags() {
    const allNotes = CreateMaxPayloadFromAnyObject(
      {
        uuid: SYSTEM_TAG_ALL_NOTES,
        content_type: ContentType.SmartTag,
        dummy: true,
        content: FillItemContent({
          title: 'All notes',
          isSystemTag: true,
          isAllTag: true,
          predicate: SNPredicate.FromArray(['content_type', '=', ContentType.Note])
        })
      }
    );
    const archived = CreateMaxPayloadFromAnyObject(
      {
        uuid: SYSTEM_TAG_ARCHIVED_NOTES,
        content_type: ContentType.SmartTag,
        dummy: true,
        content: FillItemContent({
          title: 'Archived',
          isSystemTag: true,
          isArchiveTag: true,
          predicate: SNPredicate.FromArray(['archived', '=', JSON.stringify(true)])
        })
      }
    );
    const trash = CreateMaxPayloadFromAnyObject(
      {
        uuid: SYSTEM_TAG_TRASHED_NOTES,
        content_type: ContentType.SmartTag,
        dummy: true,
        content: FillItemContent({
          title: 'Trash',
          isSystemTag: true,
          isTrashTag: true,
          predicate: SNPredicate.FromArray(['content.trashed', '=', JSON.stringify(true)])
        })
      }
    );
    return [
      CreateItemFromPayload(allNotes) as SNSmartTag,
      CreateItemFromPayload(archived) as SNSmartTag,
      CreateItemFromPayload(trash) as SNSmartTag
    ];
  }
}
