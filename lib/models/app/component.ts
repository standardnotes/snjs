import { AppDataField } from './../core/item';
import { ItemMutator } from './../../services/item_transformer';
import { PurePayload } from '@Payloads/pure_payload';
import { isString } from '@Lib/utils';
import { SNItem } from '@Models/core/item';
import { ContentType } from '@Models/content_types';
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

  public readonly componentData: Record<string, any>
  /** Items that have requested a component to be disabled in its context */
  public readonly disassociatedItemIds: string[]
  /** Items that have requested a component to be enabled in its context */
  public readonly associatedItemIds: string[]
  public readonly local_url: string
  public readonly hosted_url: string
  public readonly offlineOnly: boolean
  public readonly name: string
  public readonly autoupdateDisabled: boolean
  public readonly package_info: any
  public readonly area: ComponentAreas
  public readonly permissions: any[] = []
  public readonly valid_until: Date
  public readonly active: boolean
  public readonly legacy_url: string

  constructor(payload: PurePayload) {
    super(payload);
    /** Custom data that a component can store in itself */
    this.componentData = this.payload.safeContent.componentData || {};
    this.legacy_url = this.payload.safeContent.legacy_url;
    this.hosted_url = this.payload.safeContent.hosted_url || this.payload.safeContent.url;
    this.local_url = this.payload.safeContent.local_url;
    this.valid_until = new Date(this.payload.safeContent.valid_until);
    this.offlineOnly = this.payload.safeContent.offlineOnly;
    this.name = this.payload.safeContent.name;
    this.area = this.payload.safeContent.area;
    this.package_info = this.payload.safeContent.package_info;
    this.permissions = this.payload.safeContent.permissions || [];
    this.active = this.payload.safeContent.active;
    this.autoupdateDisabled = this.payload.safeContent.autoupdateDisabled;
    this.disassociatedItemIds = this.payload.safeContent.disassociatedItemIds || [];
    this.associatedItemIds = this.payload.safeContent.associatedItemIds || [];
    /**
    * @legacy
    * We don't want to set the url directly, as we'd like to phase it out.
    * If the content.url exists, we'll transfer it to legacy_url. We'll only
    * need to set this if content.hosted_url is blank, otherwise,
    * hosted_url is the url replacement.
    */
    this.legacy_url = !this.payload.safeContent.hosted_url ? this.payload.safeContent.url : undefined;
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
      this.content_type === ContentType.Theme ||
      this.area === ComponentAreas.Themes
    );
  }

  public isDefaultEditor() {
    return this.getAppDomainValue(AppDataField.DefaultEditor) === true;
  }

  public getLastSize() {
    return this.getAppDomainValue(AppDataField.LastSize);
  }

  public acceptsThemes() {
    return this.payload.safeContent.package_info?.acceptsThemes;
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

  public isExplicitlyEnabledForItem(item: SNItem) {
    return this.associatedItemIds.indexOf(item.uuid!) !== -1;
  }

  public isExplicitlyDisabledForItem(item: SNItem) {
    return this.disassociatedItemIds.indexOf(item.uuid!) !== -1;
  }
}

export class ComponentTransformer extends ItemMutator {

  set active(active: boolean) {
    this.content.active = active;
  }

  set componentData(componentData: Record<string, any>) {
    this.content.componentData = componentData;
  }

  public associateWithItem(item: SNItem) {
    this.content.associatedItemIds.push(item.uuid);
  }

  public setLastSize(size: string) {
    this.setAppDataItem('lastSize', size);
  }
}
