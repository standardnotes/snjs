import { AppDataField } from '@standardnotes/applications'
import { SNItem } from '@Lib/Models/Item/Item'
import { ConflictStrategy } from '@Lib/Protocol/payloads/deltas/strategies'
import { SNComponent } from '@Lib/Models/Component/Component'
import { ComponentArea } from '@standardnotes/features'
import { HistoryEntry } from '@Lib/services/History/Entries/HistoryEntry'

export class SNTheme extends SNComponent {
  public area: ComponentArea = ComponentArea.Themes

  isLayerable(): boolean {
    return this.package_info && this.package_info.layerable!
  }

  /** Do not duplicate under most circumstances. Always keep original */
  strategyWhenConflictingWithItem(item: SNItem, previousRevision?: HistoryEntry): ConflictStrategy {
    if (this.errorDecrypting) {
      return super.strategyWhenConflictingWithItem(item, previousRevision)
    }

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


