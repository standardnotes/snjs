import { ItemMutator } from '../../Abstract/Item/Implementations/ItemMutator'

export interface ItemsKeyMutatorInterface extends ItemMutator {
  set isDefault(isDefault: boolean)
}
