import { SNItem } from '@Models/core/item';
import { SNTag } from '@Models/app/tag';
import { PayloadContent } from '@Payloads/generator';
import { PurePayload } from './../../protocol/payloads/pure_payload';
import { removeFromArray, findInArray } from '@Lib/utils';
import { ContentType } from '@Models/content_types';

/** A note item */
export class SNNote extends SNItem {

  public title!: string
  /* Some external editors can't handle a null value for text.
  * Notes created on mobile with no text have a null value for it,
  * so we'll just set a default here. */
  public text: string = ''
  public tags: SNItem[] = []
  private savedTagsString?: string

  getDefaultContentType() {
    return ContentType.Note;
  }

  mapContentToLocalProperties(content: PayloadContent) {
    super.mapContentToLocalProperties(content);
    this.title = content.title;
    this.text = content.text;
  }

  structureParams() {
    const params = {
      title: this.title,
      text: this.text
    };

    const superParams = super.structureParams();
    Object.assign(superParams, params);
    return superParams;
  }

  addItemAsRelationship(item: SNItem) {
    /**
     * @legacy
     * In v2, note/tag relationships were bidirectional, however in some cases there
     * may be broken links such that a note has references to a tag and not vice versa.
     * Now, only tags contain references to notes. For old notes that may have references to tags,
     * we want to transfer them over to the tag.
     */
    if (item.content_type === ContentType.Tag) {
      item.addItemAsRelationship(this);
    }
    super.addItemAsRelationship(item);
  }

  setIsBeingReferencedBy(item: SNItem) {
    if (item.content_type === ContentType.Tag) {
      if (!findInArray(this.tags, 'uuid', item.uuid as any)) {
        this.tags.push(item);
      }
    }
    super.setIsBeingReferencedBy(item);
    this.clearSavedTagsString();
  }

  setIsNoLongerReferencedBy(item: SNItem) {
    super.setIsNoLongerReferencedBy(item);
    if (item.content_type === ContentType.Tag) {
      removeFromArray(this.tags, item);
    }

    /**
     * @legacy Two-way note-tag relationships need to be handled explicitly.
     */
    if (item.content_type === ContentType.Tag && this.hasRelationshipWithItem(item)) {
      this.removeReferenceWithUuid(item.uuid);
      /** @todo Items shouldn't mark themselves dirty. */
      /** @legacy this.setDirty(true); */
    }

    this.clearSavedTagsString();
  }

  static filterDummyNotes(notes: SNNote[]) {
    return notes.filter((note) => {
      return !note.dummy;
    });
  }

  public referencingItemCompletedMapping(item: SNItem) {
    super.referencingItemCompletedMapping(item);
    if (item.content_type === ContentType.Tag) {
      this.clearSavedTagsString();
    }
  }

  safeText() {
    return this.text || '';
  }

  safeTitle() {
    return this.title || '';
  }

  clearSavedTagsString() {
    this.savedTagsString = undefined;
  }

  tagsString() {
    this.savedTagsString = SNTag.arrayToDisplayString(this.tags as SNTag[]);
    return this.savedTagsString;
  }
}
