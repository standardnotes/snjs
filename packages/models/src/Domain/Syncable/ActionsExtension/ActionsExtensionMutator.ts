import { DecryptedItemMutator } from '../../Abstract/Item/Implementations/DecryptedItemMutator'
import { ActionExtensionContent } from './ActionsExtension'
import { Action } from './Types'

export class ActionsExtensionMutator extends DecryptedItemMutator<ActionExtensionContent> {
  set description(description: string) {
    this.content.description = description
  }

  set supported_types(supported_types: string[]) {
    this.content.supported_types = supported_types
  }

  set actions(actions: Action[]) {
    this.content.actions = actions
  }

  set deprecation(deprecation: string | undefined) {
    this.content.deprecation = deprecation
  }
}
