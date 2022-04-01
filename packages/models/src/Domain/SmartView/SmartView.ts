import { PayloadInterface } from './../Payload/PayloadInterface'
import { SNItem } from '../Item/Item'
import { PredicateInterface, PredicateJsonForm } from '../Predicate/Interface'
import { predicateFromJson } from '../Predicate/Generators'
import { ItemContent } from '../Item/ItemContent'

export const SMART_TAG_DSL_PREFIX = '!['

export enum SystemViewId {
  AllNotes = 'all-notes',
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

/**
 * A tag that defines a predicate that consumers can use
 * to retrieve a dynamic list of items.
 */
export class SmartView extends SNItem {
  public readonly predicate!: PredicateInterface<SNItem>
  public readonly title: string

  constructor(payload: PayloadInterface<SmartViewContent>) {
    super(payload)
    try {
      this.predicate = this.typedContent.predicate && predicateFromJson(this.typedContent.predicate)
    } catch (error) {
      console.error(error)
    }
    this.title = String(this.typedContent.title || '')
  }

  get typedContent(): SmartViewContent {
    return this.payload.safeContent as unknown as SmartViewContent
  }
}
