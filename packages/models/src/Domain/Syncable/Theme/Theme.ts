import { ComponentArea } from '@standardnotes/features'
import { SNComponent } from '../Component/Component'
import { DecryptedItem } from '../../Abstract/Item/Implementations/DecryptedItem'
import { ConflictStrategy } from '../../Abstract/Item/Types/ConflictStrategy'
import { AppDataField } from '../../Abstract/Item/Types/AppDataField'
import { HistoryEntryInterface } from '../../Runtime/History'

export class SNTheme extends SNComponent {
  public area: ComponentArea = ComponentArea.Themes

  isLayerable(): boolean {
    return (this.package_info && this.package_info.layerable) || false
  }

  /** Do not duplicate under most circumstances. Always keep original */
  strategyWhenConflictingWithItem(
    _item: DecryptedItem,
    _previousRevision?: HistoryEntryInterface,
  ): ConflictStrategy {
    return ConflictStrategy.KeepLeft
  }

  getMobileRules() {
    return (
      this.getAppDomainValue(AppDataField.MobileRules) || {
        constants: {},
        rules: {},
      }
    )
  }

  /** Same as getMobileRules but without default value. */
  hasMobileRules() {
    return this.getAppDomainValue(AppDataField.MobileRules)
  }

  getNotAvailOnMobile() {
    return this.getAppDomainValue(AppDataField.NotAvailableOnMobile)
  }

  isMobileActive() {
    return this.getAppDomainValue(AppDataField.MobileActive)
  }
}
