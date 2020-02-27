import { SFItem } from '@Models/core/item';
import { ContentTypes } from '@Models/content_types';
import { ConflictStrategies } from '@Payloads';

export const ComponentAreas = {
  Editor: 'editor-editor',
  Themes: 'themes',
  EditorStack: 'editor-stack',
  NoteTags: 'note-tags',
  Rooms: 'rooms',
  Modal: 'modal'
};

export class SNComponent extends SFItem {

  constructor(payload) {
    super(payload);
    if (!this.componentData) {
      this.componentData = {};
    }
    if (!this.disassociatedItemIds) {
      this.disassociatedItemIds = [];
    }
    if (!this.associatedItemIds) {
      this.associatedItemIds = [];
    }
  }

  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content);
    /**
    * @legacy
    * We don't want to set the url directly, as we'd like to phase it out.
    * If the content.url exists, we'll transfer it to legacy_url. We'll only
    * need to set this if content.hosted_url is blank, otherwise,
    * hosted_url is the url replacement.
    */
    if (!content.hosted_url) {
      this.legacy_url = content.url;
    }
    this.local_url = content.local_url;
    this.hosted_url = content.hosted_url || content.url;
    this.offlineOnly = content.offlineOnly;
    this.name = content.name;
    this.autoupdateDisabled = content.autoupdateDisabled;
    this.package_info = content.package_info;
    this.area = content.area;
    this.active = content.active;
    this.permissions = content.permissions;
    if (!this.permissions) {
      this.permissions = [];
    }
    if (content.valid_until) {
      this.valid_until = new Date(content.valid_until);
    }
    /** Custom data that a component can store in itself */
    this.componentData = content.componentData || {};
    /** Items that have requested a component to be disabled in its context */
    this.disassociatedItemIds = content.disassociatedItemIds || [];
    /** Items that have requested a component to be enabled in its context */
    this.associatedItemIds = content.associatedItemIds || [];
  }

  handleDeletedContent() {
    super.handleDeletedContent();
    this.active = false;
  }

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

  // eslint-disable-next-line camelcase
  get content_type() {
    return ContentTypes.Component;
  }

  /** Do not duplicate components under most circumstances. Always keep original */
  strategyWhenConflictingWithItem({ item }) {
    if (this.errorDecrypting) {
      return super.strategyWhenConflictingWithItem({ item });
    }

    return ConflictStrategies.KeepLeft;
  }

  isEditor() {
    return this.area === ComponentAreas.Editor;
  }

  isTheme() {
    return (
      this.content_type === ContentTypes.Theme ||
      this.area === ComponentAreas.Themes
    );
  }

  isDefaultEditor() {
    return this.getAppDataItem('defaultEditor') === true;
  }

  setLastSize(size) {
    this.setAppDataItem('lastSize', size);
  }

  getLastSize() {
    return this.getAppDataItem('lastSize');
  }

  acceptsThemes() {
    if (this.content.package_info) {
      return this.content.package_info.acceptsThemes === true;
    }
    return true;
  }

  /**
   * The key used to look up data that this component may have saved to an item.
   * This data will be stored on the item using this key.
   */
  getClientDataKey() {
    if (this.legacy_url) {
      return this.legacy_url;
    } else {
      return this.uuid;
    }
  }

  hasValidHostedUrl() {
    return this.hosted_url || this.legacy_url;
  }

  contentKeysToIgnoreWhenCheckingEquality() {
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
  static associativeAreas() {
    return [ComponentAreas.Editor];
  }

  isAssociative() {
    return SNComponent.associativeAreas().includes(this.area);
  }

  associateWithItem(item) {
    this.associatedItemIds.push(item.uuid);
  }

  isExplicitlyEnabledForItem(item) {
    return this.associatedItemIds.indexOf(item.uuid) !== -1;
  }

  isExplicitlyDisabledForItem(item) {
    return this.disassociatedItemIds.indexOf(item.uuid) !== -1;
  }
}
