import { ItemMutator, ItemsKeyMutatorInterface } from '@standardnotes/models'
import { ItemsKeyContent } from './ItemsKey'

export class ItemsKeyMutator
  extends ItemMutator<ItemsKeyContent>
  implements ItemsKeyMutatorInterface
{
  set isDefault(isDefault: boolean) {
    this.sureContent.isDefault = isDefault
  }
}
