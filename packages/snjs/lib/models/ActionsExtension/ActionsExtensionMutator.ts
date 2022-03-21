import { ItemMutator } from '@Lib/models/Item/ItemMutator'
import { Action } from './ActionsExtension'

export class ActionsExtensionMutator extends ItemMutator {
  set description(description: string) {
    this.content!.description = description
  }

  set supported_types(supported_types: string[]) {
    this.content!.supported_types = supported_types
  }

  set actions(actions: Action[]) {
    this.content!.actions = actions
  }

  set deprecation(deprecation: string | undefined) {
    this.content!.deprecation = deprecation
  }
}
