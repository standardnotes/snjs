import { ItemMutator } from '../../Abstract/Item/Implementations/ItemMutator'
import { PrefKey, PrefValue } from './PrefKey'

export class UserPrefsMutator extends ItemMutator {
  setPref<K extends PrefKey>(key: K, value: PrefValue[K]): void {
    this.setAppDataItem(key, value)
  }
}
