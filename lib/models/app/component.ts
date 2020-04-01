import { isString } from '@Lib/utils';
import { SNItem } from '@Models/core/item';
import { ContentTypes } from '@Models/content_types';
import { ConflictStrategies } from '@Payloads/index';

export enum ComponentAreas {
  Editor = 'editor-editor',
  Themes = 'themes',
  EditorStack = 'editor-stack',
  NoteTags = 'note-tags',
  Rooms = 'rooms',
  Modal = 'modal',
  Any = '*'
};

/**
 * Components are mostly iframe based extensions that communicate with the SN parent
 * via the postMessage API. However, a theme can also be a component, which is activated
 * only by its url.
 */
export class SNComponent extends SNItem {

  /** Component Manager properties */
  public window?: Window
  public hidden = false
  public readonly = false
  public sessionKey?: string

  structureParams() {
    const params = {
      legacy_url: this.legacy_url,
      hosted_url: this.hosted_url,
      local_url: this.local_url,
      valid_until: this.valid_until,
      offlineOnly: this.offlineOnly,
      name: this.name,
      area: this.area,
      package_info: this.package_info,
      permissions: this.permissions,
      active: this.active,
      autoupdateDisabled: this.autoupdateDisabled,
      componentData: this.componentData,
      disassociatedItemIds: this.disassociatedItemIds,
      associatedItemIds: this.associatedItemIds,
    };
    const superParams = super.structureParams();
    Object.assign(superParams, params);
    return superParams;
  }

  getDefaultContentType() {
    return ContentTypes.Component;
  }

  /** Custom data that a component can store in itself */
  get componentData() {
    return this.content.componentData || {};
  }
  set componentData(componentData: Record<string, any>) {
    this.content.componentData = componentData;
  }
  
  /** Items that have requested a component to be disabled in its context */
  get disassociatedItemIds() : string[] {
    return this.content.disassociatedItemIds || [];
  }
  set disassociatedItemIds(disassociatedItemIds: string[]) {
    this.content.disassociatedItemIds = disassociatedItemIds;
  }
  
  /** Items that have requested a component to be enabled in its context */
  get associatedItemIds(): string[] {
    return this.content.associatedItemIds || [];
  }
  set associatedItemIds(associatedItemIds: string[]) {
    this.content.associatedItemIds = associatedItemIds;
  }

  get local_url() {
    return this.content.local_url;
  }
  set local_url(url: string) {
    this.content.local_url = url;
  }

  get hosted_url() {
    return this.content.hosted_url || this.content.url;
  }
  set hosted_url(url: string) {
    this.content.hosted_url = url;
  }

  get offlineOnly() {
    return this.content.offlineOnly;
  }
  set offlineOnly(offlineOnly: boolean) {
    this.content.offlineOnly = offlineOnly;
  }

  get name() {
    return this.content.name;
  }
  set name(name: string) {
    this.content.name = name;
  }

  get autoupdateDisabled() {
    return this.content.autoupdateDisabled;
  }
  set autoupdateDisabled(autoupdateDisabled: boolean) {
    this.content.autoupdateDisabled = autoupdateDisabled;
  }

  get package_info() {
    return this.content.package_info;
  }
  set package_info(package_info: any) {
    this.content.package_info = package_info;
  }

  get area() {
    return this.content.area;
  }
  set area(area: ComponentAreas) {
    this.content.area = area;
  }

  get permissions() {
    return this.content.permissions || [];
  }
  set permissions(permissions: any[]) {
    this.content.permissions = permissions;
  }

  get valid_until() {
    const stringOrDate = this.content.valid_until;
    if (isString(stringOrDate)) {
      this.content.valid_until = new Date(stringOrDate);
    }
    return this.content.valid_until;
  }
  set valid_until(valid_until: Date) {
    this.content.valid_until = valid_until;
  }

  get active() {
    return this.content.active;
  }
  set active(active) {
    this.content.active = active;
  }
  
  /**
  * @legacy
  * We don't want to set the url directly, as we'd like to phase it out.
  * If the content.url exists, we'll transfer it to legacy_url. We'll only
  * need to set this if content.hosted_url is blank, otherwise,
  * hosted_url is the url replacement.
  */
  get legacy_url() {
    if(!this.content.hosted_url) {
      return this.content.url;
    }
    return null;
  }
  set legacy_url(url) {
    this.content.legacy_url = url;
  }

  protected handleDeletedContent() {
    super.handleDeletedContent();
    this.active = false;
  }

  /** Do not duplicate components under most circumstances. Always keep original */
  public strategyWhenConflictingWithItem(item: SNItem) {
    if (this.errorDecrypting) {
      return super.strategyWhenConflictingWithItem(item);
    }

    return ConflictStrategies.KeepLeft;
  }

  public isEditor() {
    return this.area === ComponentAreas.Editor;
  }

  public isTheme() {
    return (
      this.content_type === ContentTypes.Theme ||
      this.area === ComponentAreas.Themes
    );
  }

  public isDefaultEditor() {
    return this.getAppDataItem('defaultEditor') === true;
  }

  public setLastSize(size: string) {
    this.setAppDataItem('lastSize', size);
  }

  public getLastSize() {
    return this.getAppDataItem('lastSize');
  }

  public acceptsThemes() {
    if (this.content.package_info) {
      return this.content.package_info.acceptsThemes === true;
    }
    return true;
  }

  /**
   * The key used to look up data that this component may have saved to an item.
   * This data will be stored on the item using this key.
   */
  public getClientDataKey() {
    if (this.legacy_url) {
      return this.legacy_url;
    } else {
      return this.uuid;
    }
  }

  public hasValidHostedUrl() {
    return this.hosted_url || this.legacy_url;
  }

  public contentKeysToIgnoreWhenCheckingEquality() {
    return [
      'active',
      'disassociatedItemIds',
      'associatedItemIds'
    ].concat(super.contentKeysToIgnoreWhenCheckingEquality());
  }

  /**
   * An associative component depends on being explicitly activated for a
   * given item, compared to a dissaciative component, which is enabled by
   * default in areas unrelated to a certain item.
   */
  public static associativeAreas() {
    return [ComponentAreas.Editor];
  }

  public isAssociative() {
    return SNComponent.associativeAreas().includes(this.area);
  }

  public associateWithItem(item: SNItem) {
    this.associatedItemIds.push(item.uuid);
  }

  public isExplicitlyEnabledForItem(item: SNItem) {
    return this.associatedItemIds.indexOf(item.uuid) !== -1;
  }

  public isExplicitlyDisabledForItem(item: SNItem) {
    return this.disassociatedItemIds.indexOf(item.uuid) !== -1;
  }
}
