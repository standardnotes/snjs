import { ItemMutator, ItemsKeyMutatorInterface, ItemsKeyContent } from '@standardnotes/models'

export class ItemsKeyMutator
  extends ItemMutator<ItemsKeyContent>
  implements ItemsKeyMutatorInterface
{
  set isDefault(isDefault: boolean) {
    this.sureContent.isDefault = isDefault
  }
}
