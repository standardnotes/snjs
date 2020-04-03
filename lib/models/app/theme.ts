import { AppDataField } from './../core/item';
import { SNItem, ItemMutator } from '@Models/core/item';
import { ConflictStrategies } from '@Payloads/deltas';
import { SNComponent, ComponentAreas } from '@Models/app/component';

export class SNTheme extends SNComponent {

  public area: ComponentAreas = ComponentAreas.Themes

  isLayerable() {
    return this.package_info && this.package_info.layerable;
  }

  /** Do not duplicate under most circumstances. Always keep original */
  strategyWhenConflictingWithItem(item: SNItem) {
    if (this.errorDecrypting) {
      return super.strategyWhenConflictingWithItem(item);
    }

    return ConflictStrategies.KeepLeft;
  }

  getMobileRules() {
    return this.getAppDomainValue(AppDataField.MobileRules) || { constants: {}, rules: {} };
  }

  /** Same as getMobileRules but without default value. */
  hasMobileRules() {
    return this.getAppDomainValue(AppDataField.MobileRules);
  }

  getNotAvailOnMobile() {
    return this.getAppDomainValue(AppDataField.NotAvailableOnMobile);
  }

  isMobileActive() {
    return this.getAppDomainValue(AppDataField.MobileActive);
  }
}

export class ThemeMutator extends ItemMutator {

  setMobileRules(rules: any) {
    this.setAppDataItem(AppDataField.MobileRules, rules);
  }
  setNotAvailOnMobile(notAvailable: boolean) {
    this.setAppDataItem(AppDataField.NotAvailableOnMobile, notAvailable);
  }

  /**
   * We must not use .active because if you set that to true, it will also
   * activate that theme on desktop/web
   */
  setMobileActive(active: boolean) {
    this.setAppDataItem(AppDataField.MobileActive, active);
  }
}
