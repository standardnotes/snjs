import { ItemMutator, ItemsKeyMutatorInterface, ItemsKeyContent } from '@standardnotes/models'

export class ItemsKeyMutator
  extends DecryptedItemMutator<ItemsKeyContent>
  implements ItemsKeyMutatorInterface
{
  set isDefault(isDefault: boolean) {
    this.content.isDefault = isDefault
  }
}
