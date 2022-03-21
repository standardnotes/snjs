import { ItemMutator } from '@Lib/Models/Item/ItemMutator'
import { PrefKey, PrefValue } from './UserPrefs'

export class UserPrefsMutator extends ItemMutator {
  setPref<K extends PrefKey>(key: K, value: PrefValue[K]): void {
    this.setAppDataItem(key, value)
  }
}
