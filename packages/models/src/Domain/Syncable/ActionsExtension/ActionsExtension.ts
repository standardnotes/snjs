import { FeatureDescription, ThirdPartyFeatureDescription } from '@standardnotes/features'
import { SNItem } from '../../Abstract/Item'
import { ItemContent } from '../../Abstract/Item/ItemContent'
import { ConflictStrategy } from '../../Abstract/Item/ConflictStrategy'
import { PayloadInterface } from '../../Abstract/Payload/PayloadInterface'
import { HistoryEntryInterface } from '../../Runtime/History/HistoryEntryInterface'
import { Action } from './Types'

export interface ActionExtensionInterface {
  actions: Action[]
  deprecation?: string
  description: string
  hosted_url?: string
  name: string
  package_info: FeatureDescription
  supported_types: string[]
  url: string
}

export type ActionExtensionContent = ActionExtensionInterface & ItemContent

/**
 * Related to the SNActionsService and the local Action model.
 */
export class SNActionsExtension extends SNItem<ActionExtensionContent> {
  public readonly actions: Action[] = []
  public readonly description: string
  public readonly url: string
  public readonly supported_types: string[]
  public readonly deprecation?: string
  public readonly name: string
  public readonly package_info: FeatureDescription

  constructor(payload: PayloadInterface<ActionExtensionContent>) {
    super(payload)
    this.name = payload.safeContent.name || ''
    this.description = payload.safeContent.description || ''
    this.url = payload.safeContent.hosted_url || payload.safeContent.url
    this.supported_types = payload.safeContent.supported_types
    this.package_info = this.payload.safeContent.package_info || {}
    this.deprecation = payload.safeContent.deprecation
    this.actions = payload.safeContent.actions
  }

  public get thirdPartyPackageInfo(): ThirdPartyFeatureDescription {
    return this.package_info as ThirdPartyFeatureDescription
  }

  public get isListedExtension(): boolean {
    return (this.package_info.identifier as string) === 'org.standardnotes.listed'
  }

  actionsWithContextForItem(item: SNItem): Action[] {
    return this.actions.filter((action) => {
      return action.context === item.content_type || action.context === 'Item'
    })
  }

  /** Do not duplicate. Always keep original */
  strategyWhenConflictingWithItem(
    item: SNItem,
    previousRevision?: HistoryEntryInterface,
  ): ConflictStrategy {
    if (this.errorDecrypting) {
      return super.strategyWhenConflictingWithItem(item, previousRevision)
    }

    return ConflictStrategy.KeepLeft
  }
}
