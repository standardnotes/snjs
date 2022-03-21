import { ItemMutator } from '@Lib/models/Item/ItemMutator'

export class ItemsKeyMutator extends ItemMutator {
  set isDefault(isDefault: boolean) {
    this.content!.isDefault = isDefault
  }
}
