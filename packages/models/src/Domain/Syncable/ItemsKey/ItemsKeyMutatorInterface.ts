import { ItemMutator } from '../../Abstract/Item/ItemMutator'

export interface ItemsKeyMutatorInterface extends ItemMutator {
  set isDefault(isDefault: boolean)
}
