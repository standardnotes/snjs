import { ContentTypes, SNComponent } from '@Models';
import { CONFLICT_STRATEGY_KEEP_LEFT } from '@Payloads/deltas/strategies';

export class SNTheme extends SNComponent {

  constructor(payload) {
    super(payload);
    this.area = 'themes';
  }

  isLayerable() {
    return this.package_info && this.package_info.layerable;
  }

  get content_type() {
    return ContentTypes.Theme;
  }

  /** Do not duplicate under most circumstances. Always keep original */
  strategyWhenConflictingWithItem({item}) {
    if(this.errorDecrypting) {
      return super.strategyWhenConflictingWithItem({item});
    }

    return CONFLICT_STRATEGY_KEEP_LEFT;
  }

  setMobileRules(rules) {
    this.setAppDataItem('mobileRules', rules);
  }

  getMobileRules() {
    return this.getAppDataItem('mobileRules') || {constants: {}, rules: {}};
  }

  /** Same as getMobileRules but without default value. */
  hasMobileRules() {
    return this.getAppDataItem('mobileRules');
  }

  setNotAvailOnMobile(na) {
    this.setAppDataItem('notAvailableOnMobile', na);
  }

  getNotAvailOnMobile() {
    return this.getAppDataItem('notAvailableOnMobile');
  }

  /**
   * We must not use .active because if you set that to true, it will also
   * activate that theme on desktop/web
   */
  setMobileActive(active) {
    this.setAppDataItem('mobileActive', active);
  }

  isMobileActive() {
    return this.getAppDataItem('mobileActive');
  }
}
