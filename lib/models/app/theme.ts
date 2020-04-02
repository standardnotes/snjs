import { AppDataField } from './../core/item';
import { SNItem } from '@Models/core/item';
import { ConflictStrategies } from '@Payloads/deltas';
import { ContentType } from '@Models/content_types';
import { SNComponent, ComponentAreas } from '@Models/app/component';

export class SNTheme extends SNComponent {

  public area: ComponentAreas = ComponentAreas.Themes

  isLayerable() {
    return this.package_info && this.package_info.layerable;
  }

  getDefaultContentType()  {
    return ContentType.Theme;
  }

  /** Do not duplicate under most circumstances. Always keep original */
  strategyWhenConflictingWithItem(item: SNItem) {
    if(this.errorDecrypting) {
      return super.strategyWhenConflictingWithItem(item);
    }

    return ConflictStrategies.KeepLeft;
  }

  setMobileRules(rules: any) {
    // this.setAppDataItem(AppDataField.MobileRules, rules);
    throw Error('setMobileRules is deprecated and no longer supported. Use mutators instead.');
  }

  getMobileRules() {
    return this.getAppDomainValue(AppDataField.MobileRules) || {constants: {}, rules: {}};
  }

  /** Same as getMobileRules but without default value. */
  hasMobileRules() {
    return this.getAppDomainValue(AppDataField.MobileRules);
  }

  setNotAvailOnMobile(na: boolean) {
    // this.setAppDataItem(AppDataField.NotAvailableOnMobile, na);
    throw Error('setNotAvailOnMobile is deprecated and no longer supported. Use mutators instead.');
  }

  getNotAvailOnMobile() {
    return this.getAppDomainValue(AppDataField.NotAvailableOnMobile);
  }

  /**
   * We must not use .active because if you set that to true, it will also
   * activate that theme on desktop/web
   */
  setMobileActive(active: boolean) {
    // this.setAppDataItem(AppDataField.MobileActive, active);
    throw Error('setMobileActive is deprecated and no longer supported. Use mutators instead.');
  }

  isMobileActive() {
    // return this.getAppDomainValue(AppDataField.MobileActive);
    throw Error('isMobileActive is deprecated and no longer supported. Use mutators instead.');
  }
}
