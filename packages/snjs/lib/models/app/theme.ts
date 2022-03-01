import { AppDataField } from '@standardnotes/applications'
import { ItemMutator, SNItem } from '@Models/core/item'
import { ConflictStrategy } from '@Protocol/payloads/deltas/strategies'
import { SNComponent } from '@Models/app/component'
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

export class ThemeMutator extends ItemMutator {
  setMobileRules(rules: any) {
    this.setAppDataItem(AppDataField.MobileRules, rules)
  }

  setNotAvailOnMobile(notAvailable: boolean) {
    this.setAppDataItem(AppDataField.NotAvailableOnMobile, notAvailable)
  }

  set local_url(local_url: string) {
    this.content!.local_url = local_url
  }

  /**
   * We must not use .active because if you set that to true, it will also
   * activate that theme on desktop/web
   */
  setMobileActive(active: boolean) {
    this.setAppDataItem(AppDataField.MobileActive, active)
  }
}
