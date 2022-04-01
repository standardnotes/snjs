import { AppDataField } from '../../Abstract/Item/AppDataField'
import { ComponentContent } from '../Component/ComponentContent'
import { ItemMutator } from '../../Abstract/Item/ItemMutator'

export class ThemeMutator extends ItemMutator<ComponentContent> {
  setMobileRules(rules: unknown) {
    this.setAppDataItem(AppDataField.MobileRules, rules)
  }

  setNotAvailOnMobile(notAvailable: boolean) {
    this.setAppDataItem(AppDataField.NotAvailableOnMobile, notAvailable)
  }

  set local_url(local_url: string) {
    this.sureContent.local_url = local_url
  }

  /**
   * We must not use .active because if you set that to true, it will also
   * activate that theme on desktop/web
   */
  setMobileActive(active: boolean) {
    this.setAppDataItem(AppDataField.MobileActive, active)
  }
}
