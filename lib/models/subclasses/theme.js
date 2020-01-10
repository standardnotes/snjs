import { SNComponent } from '@Models/app/component'
import { CONTENT_TYPE_THEME } from '@Models/content_types';

export class SNTheme extends SNComponent {

  constructor(payload) {
    super(payload);
    this.area = 'themes';
  }

  isLayerable() {
    return this.package_info && this.package_info.layerable;
  }

  get content_type() {
    return CONTENT_TYPE_THEME;
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
