import { FeatureIdentifier } from '@standardnotes/features';
import { ConflictStrategy } from '@Protocol/payloads/deltas/strategies';
import { addIfUnique, isValidUrl, removeFromArray } from '@Lib/utils';
import { UuidString } from './../../types';
import { AppDataField } from './../core/item';
import { PurePayload } from '@Payloads/pure_payload';
import { ItemMutator, SNItem } from '@Models/core/item';
import { ContentType } from '@Models/content_types';
import { HistoryEntry } from '@Lib/services/history/entries/history_entry';
import {
  ComponentArea,
  ComponentFlag,
  FeatureDescription,
} from '@standardnotes/features';

export { ComponentArea };

export enum ComponentAction {
  SetSize = 'set-size',
  StreamItems = 'stream-items',
  StreamContextItem = 'stream-context-item',
  SaveItems = 'save-items',
  SelectItem = 'select-item',
  AssociateItem = 'associate-item',
  DeassociateItem = 'deassociate-item',
  ClearSelection = 'clear-selection',
  CreateItem = 'create-item',
  CreateItems = 'create-items',
  DeleteItems = 'delete-items',
  SetComponentData = 'set-component-data',
  ToggleActivateComponent = 'toggle-activate-component',
  RequestPermissions = 'request-permissions',
  PresentConflictResolution = 'present-conflict-resolution',
  DuplicateItem = 'duplicate-item',
  ComponentRegistered = 'component-registered',
  ActivateThemes = 'themes',
  Reply = 'reply',
  SaveSuccess = 'save-success',
  SaveError = 'save-error',
  ThemesActivated = 'themes-activated',
  KeyDown = 'key-down',
  KeyUp = 'key-up',
  Click = 'click',
}

export type ComponentPermission = {
  name: ComponentAction;
  content_types?: ContentType[];
};

export interface ComponentContent {
  componentData: Record<string, any>;
  /** Items that have requested a component to be disabled in its context */
  disassociatedItemIds: string[];
  /** Items that have requested a component to be enabled in its context */
  associatedItemIds: string[];
  local_url: string | null;
  hosted_url?: string;
  offlineOnly: boolean;
  name: string;
  autoupdateDisabled: boolean;
  package_info: FeatureDescription;
  area: ComponentArea;
  permissions: ComponentPermission[];
  valid_until: Date | number;
  active: boolean;
  legacy_url?: string;
  isMobileDefault: boolean;
  isDeprecated: boolean;
}

/**
 * Components are mostly iframe based extensions that communicate with the SN parent
 * via the postMessage API. However, a theme can also be a component, which is activated
 * only by its url.
 */
export class SNComponent extends SNItem implements ComponentContent {
  public readonly componentData: Record<string, any>;
  /** Items that have requested a component to be disabled in its context */
  public readonly disassociatedItemIds: string[];
  /** Items that have requested a component to be enabled in its context */
  public readonly associatedItemIds: string[];
  public readonly local_url: string;
  public readonly hosted_url?: string;
  public readonly offlineOnly: boolean;
  public readonly name: string;
  public readonly autoupdateDisabled: boolean;
  public readonly package_info: FeatureDescription;
  public readonly area: ComponentArea;
  public readonly permissions: ComponentPermission[] = [];
  public readonly valid_until: Date;
  public readonly active: boolean;
  public readonly legacy_url?: string;
  public readonly isMobileDefault: boolean;

  constructor(payload: PurePayload) {
    super(payload);
    /** Custom data that a component can store in itself */
    this.componentData = this.payload.safeContent.componentData || {};

    if (isValidUrl(this.payload.safeContent.hosted_url)) {
      this.hosted_url = this.payload.safeContent.hosted_url;
    } else if (isValidUrl(this.payload.safeContent.url)) {
      this.hosted_url = this.payload.safeContent.url;
    } else if (isValidUrl(this.payload.safeContent.legacy_url)) {
      this.hosted_url = this.payload.safeContent.legacy_url;
    }
    this.local_url = this.payload.safeContent.local_url;

    this.valid_until = new Date(this.payload.safeContent.valid_until || 0);
    this.offlineOnly = this.payload.safeContent.offlineOnly;
    this.name = this.payload.safeContent.name;
    this.area = this.payload.safeContent.area;
    this.package_info = this.payload.safeContent.package_info || {};
    this.permissions = this.payload.safeContent.permissions || [];
    this.active = this.payload.safeContent.active;
    this.autoupdateDisabled = this.payload.safeContent.autoupdateDisabled;
    this.disassociatedItemIds =
      this.payload.safeContent.disassociatedItemIds || [];
    this.associatedItemIds = this.payload.safeContent.associatedItemIds || [];
    this.isMobileDefault = this.payload.safeContent.isMobileDefault;
    /**
     * @legacy
     * We don't want to set this.url directly, as we'd like to phase it out.
     * If the content.url exists, we'll transfer it to legacy_url. We'll only
     * need to set this if content.hosted_url is blank, otherwise,
     * hosted_url is the url replacement.
     */
    this.legacy_url = !this.payload.safeContent.hosted_url
      ? this.payload.safeContent.url
      : undefined;
  }

  /** Do not duplicate components under most circumstances. Always keep original */
  public strategyWhenConflictingWithItem(
    item: SNItem,
    previousRevision?: HistoryEntry
  ): ConflictStrategy {
    if (this.errorDecrypting) {
      return super.strategyWhenConflictingWithItem(item, previousRevision);
    }
    return ConflictStrategy.KeepLeft;
  }

  public isEditor(): boolean {
    return this.area === ComponentArea.Editor;
  }

  public isTheme(): boolean {
    return (
      this.content_type === ContentType.Theme ||
      this.area === ComponentArea.Themes
    );
  }

  public isDefaultEditor(): boolean {
    return this.getAppDomainValue(AppDataField.DefaultEditor) === true;
  }

  public getLastSize(): any {
    return this.getAppDomainValue(AppDataField.LastSize);
  }

  public acceptsThemes(): boolean {
    return this.payload.safeContent.package_info?.acceptsThemes;
  }

  /**
   * The key used to look up data that this component may have saved to an item.
   * This data will be stored on the item using this key.
   */
  public getClientDataKey(): string {
    if (this.legacy_url) {
      return this.legacy_url;
    } else {
      return this.uuid;
    }
  }

  public hasValidHostedUrl(): boolean {
    return (this.hosted_url || this.legacy_url) != undefined;
  }

  public contentKeysToIgnoreWhenCheckingEquality(): string[] {
    return ['active', 'disassociatedItemIds', 'associatedItemIds'].concat(
      super.contentKeysToIgnoreWhenCheckingEquality()
    );
  }

  /**
   * An associative component depends on being explicitly activated for a
   * given item, compared to a dissaciative component, which is enabled by
   * default in areas unrelated to a certain item.
   */
  public static associativeAreas(): ComponentArea[] {
    return [ComponentArea.Editor];
  }

  public isAssociative(): boolean {
    return SNComponent.associativeAreas().includes(this.area);
  }

  public isExplicitlyEnabledForItem(uuid: UuidString): boolean {
    return this.associatedItemIds.indexOf(uuid) !== -1;
  }

  public isExplicitlyDisabledForItem(uuid: UuidString): boolean {
    return this.disassociatedItemIds.indexOf(uuid) !== -1;
  }

  public get isExpired(): boolean {
    return this.valid_until.getTime() > 0 && this.valid_until <= new Date();
  }

  public get identifier(): FeatureIdentifier {
    return this.package_info.identifier;
  }

  public get isDeprecated(): boolean {
    let flags: string[] = this.package_info.flags ?? [];
    flags = flags.map((flag: string) => flag.toLowerCase());
    return flags.includes(ComponentFlag.Deprecated);
  }
}

export class ComponentMutator extends ItemMutator {
  get typedContent(): Partial<ComponentContent> {
    return this.content as Partial<ComponentContent>;
  }

  set active(active: boolean) {
    this.typedContent.active = active;
  }

  set isMobileDefault(isMobileDefault: boolean) {
    this.typedContent.isMobileDefault = isMobileDefault;
  }

  set defaultEditor(defaultEditor: boolean) {
    this.setAppDataItem(AppDataField.DefaultEditor, defaultEditor);
  }

  set componentData(componentData: Record<string, any>) {
    this.typedContent.componentData = componentData;
  }

  set package_info(package_info: any) {
    this.typedContent.package_info = package_info;
  }

  set local_url(local_url: string) {
    this.typedContent.local_url = local_url;
  }

  set hosted_url(hosted_url: string) {
    this.typedContent.hosted_url = hosted_url;
  }

  set valid_until(valid_until: Date) {
    this.typedContent.valid_until = valid_until;
  }

  set permissions(permissions: ComponentPermission[]) {
    this.typedContent.permissions = permissions;
  }

  public associateWithItem(uuid: UuidString): void {
    const associated = this.typedContent.associatedItemIds || [];
    addIfUnique(associated, uuid);
    this.typedContent.associatedItemIds = associated;
  }

  public disassociateWithItem(uuid: UuidString): void {
    const disassociated = this.typedContent.disassociatedItemIds || [];
    addIfUnique(disassociated, uuid);
    this.typedContent.disassociatedItemIds = disassociated;
  }

  public removeAssociatedItemId(uuid: UuidString): void {
    removeFromArray(this.typedContent.associatedItemIds || [], uuid);
  }

  public removeDisassociatedItemId(uuid: UuidString): void {
    removeFromArray(this.typedContent.disassociatedItemIds || [], uuid);
  }

  public setLastSize(size: string): void {
    this.setAppDataItem(AppDataField.LastSize, size);
  }
}
