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
    this.setAppDataItem('mobileRules', rules);
  }

  getMobileRules() {
    return this.getAppDataItem('mobileRules') || {constants: {}, rules: {}};
  }

  /** Same as getMobileRules but without default value. */
  hasMobileRules() {
    return this.getAppDataItem('mobileRules');
  }

  setNotAvailOnMobile(na: boolean) {
    this.setAppDataItem('notAvailableOnMobile', na);
  }

  getNotAvailOnMobile() {
    return this.getAppDataItem('notAvailableOnMobile');
  }

  /**
   * We must not use .active because if you set that to true, it will also
   * activate that theme on desktop/web
   */
  setMobileActive(active: boolean) {
    this.setAppDataItem('mobileActive', active);
  }

  isMobileActive() {
    return this.getAppDataItem('mobileActive');
  }
}
