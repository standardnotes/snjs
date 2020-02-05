import { SNTag } from '@Models/app/tag'
import { SFPredicate } from '@Models/core/predicate'
import {
  ContentTypes.SmartTag ,
  ContentTypes.Note
} from '@Models/content_types';

const SYSTEM_TAG_ALL_NOTES = "all-notes";
const SYSTEM_TAG_ARCHIVED_NOTES = "archived-notes";
const SYSTEM_TAG_TRASHED_NOTES = "trashed-notes";

export class SNSmartTag extends SNTag {

  constructor(payload) {
    super(payload);
    this.content_type = ContentTypes.SmartTag;
  }

  static systemSmartTags() {
    return [
      new SNSmartTag({
        uuid: SYSTEM_TAG_ALL_NOTES,
        dummy: true,
        content: {
          title: "All notes",
          isSystemTag: true,
          isAllTag: true,
          predicate: new SFPredicate.fromArray(['content_type', '=', ContentTypes.Note])
        }
      }),
      new SNSmartTag({
        uuid: SYSTEM_TAG_ARCHIVED_NOTES,
        dummy: true,
        content: {
          title: "Archived",
          isSystemTag: true,
          isArchiveTag: true,
          predicate: new SFPredicate.fromArray(['archived', '=', true])
        }
      }),
      new SNSmartTag({
        uuid: SYSTEM_TAG_TRASHED_NOTES,
        dummy: true,
        content: {
          title: "Trash",
          isSystemTag: true,
          isTrashTag: true,
          predicate: new SFPredicate.fromArray(['content.trashed', '=', true])
        }
      })
    ]
  }
}
