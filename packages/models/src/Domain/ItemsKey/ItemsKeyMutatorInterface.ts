import { ItemMutator } from '../Item/ItemMutator'

export interface ItemsKeyMutatorInterface extends ItemMutator {
  set isDefault(isDefault: boolean)
}
