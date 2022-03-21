import { AppDataField } from '@standardnotes/applications'
import { ItemMutator } from '@Lib/Models/Item/ItemMutator'

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
