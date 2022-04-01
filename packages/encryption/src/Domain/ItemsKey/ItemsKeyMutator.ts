import { ItemMutator, ItemsKeyMutatorInterface } from '@standardnotes/models'

export class ItemsKeyMutator extends ItemMutator implements ItemsKeyMutatorInterface {
  set isDefault(isDefault: boolean) {
    this.content!.isDefault = isDefault
  }
}
