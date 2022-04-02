import { ItemMutator } from '../../Abstract/Item/Implementations/ItemMutator'
import { ActionExtensionContent } from './ActionsExtension'
import { Action } from './Types'

export class ActionsExtensionMutator extends ItemMutator<ActionExtensionContent> {
  set description(description: string) {
    this.sureContent.description = description
  }

  set supported_types(supported_types: string[]) {
    this.sureContent.supported_types = supported_types
  }

  set actions(actions: Action[]) {
    this.sureContent.actions = actions
  }

  set deprecation(deprecation: string | undefined) {
    this.sureContent.deprecation = deprecation
  }
}
