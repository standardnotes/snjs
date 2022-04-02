import { DecryptedItem } from '../../Abstract/Item/Implementations/DecryptedItem'
import { ContentType } from '@standardnotes/common'
import { Predicate } from '../../Runtime/Predicate/Predicate'
import { PrefKey, PrefValue } from './PrefKey'

export class SNUserPrefs extends DecryptedItem {
  static singletonPredicate = new Predicate('content_type', '=', ContentType.UserPrefs)

  get isSingleton(): true {
    return true
  }

  singletonPredicate(): Predicate<SNUserPrefs> {
    return SNUserPrefs.singletonPredicate
  }

  getPref<K extends PrefKey>(key: K): PrefValue[K] | undefined {
    return this.getAppDomainValue(key)
  }
}
