import { DecryptedItem } from '../../Abstract/Item/Implementations/DecryptedItem'
import { PredicateInterface, PredicateJsonForm } from '../../Runtime/Predicate/Interface'
import { predicateFromJson } from '../../Runtime/Predicate/Generators'
import { ItemContent } from '../../Abstract/Content/ItemContent'
import { DecryptedPayloadInterface } from '../../Abstract/Payload/Interfaces/DecryptedPayload'
import { ItemInterface } from '../../Abstract/Item'
import { ContentType } from '@standardnotes/common'

export const SMART_TAG_DSL_PREFIX = '!['

export enum SystemViewId {
  AllNotes = 'all-notes',
  Files = 'files',
  ArchivedNotes = 'archived-notes',
  TrashedNotes = 'trashed-notes',
  UntaggedNotes = 'untagged-notes',
}

export interface SmartViewContent extends ItemContent {
  title: string
  predicate: PredicateJsonForm
}

export function isSystemView(view: SmartView): boolean {
  return Object.values(SystemViewId).includes(view.uuid as SystemViewId)
}

export function isSmartView(x: ItemInterface): x is SmartView {
  return x.content_type === ContentType.SmartView
}

/**
 * A tag that defines a predicate that consumers can use
 * to retrieve a dynamic list of items.
 */
export class SmartView extends DecryptedItem<SmartViewContent> {
  public readonly predicate!: PredicateInterface<DecryptedItem>
  public readonly title: string

  constructor(payload: DecryptedPayloadInterface<SmartViewContent>) {
    super(payload)
    this.title = String(this.content.title || '')

    try {
      this.predicate = this.content.predicate && predicateFromJson(this.content.predicate)
    } catch (error) {
      console.error(error)
    }
  }
}
