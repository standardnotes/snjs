import { DecryptedItemMutator } from '../../Abstract/Item/Implementations/DecryptedItemMutator'

export interface ItemsKeyMutatorInterface extends DecryptedItemMutator {
  set isDefault(isDefault: boolean)
}
