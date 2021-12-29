import { FeatureIdentifier } from '@standardnotes/features';
import { ConflictStrategy } from '../../../../protocol/payloads/deltas/strategies';
import { UuidString } from './../../types';
import { PurePayload } from '../../../../protocol/payloads/pure_payload';
import { ItemMutator, SNItem } from '../../../../models/core/item';
import { HistoryEntry } from '../../../../services/history/entries/history_entry';
import { ComponentArea, FeatureDescription, ComponentPermission } from '@standardnotes/features';
export { ComponentArea };
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
export declare class SNComponent extends SNItem implements ComponentContent {
    readonly componentData: Record<string, any>;
    /** Items that have requested a component to be disabled in its context */
    readonly disassociatedItemIds: string[];
    /** Items that have requested a component to be enabled in its context */
    readonly associatedItemIds: string[];
    readonly local_url: string;
    readonly hosted_url?: string;
    readonly offlineOnly: boolean;
    readonly name: string;
    readonly autoupdateDisabled: boolean;
    readonly package_info: FeatureDescription;
    readonly area: ComponentArea;
    readonly permissions: ComponentPermission[];
    readonly valid_until: Date;
    readonly active: boolean;
    readonly legacy_url?: string;
    readonly isMobileDefault: boolean;
    constructor(payload: PurePayload);
    /** Do not duplicate components under most circumstances. Always keep original */
    strategyWhenConflictingWithItem(item: SNItem, previousRevision?: HistoryEntry): ConflictStrategy;
    isEditor(): boolean;
    isTheme(): boolean;
    isDefaultEditor(): boolean;
    getLastSize(): any;
    acceptsThemes(): boolean;
    /**
     * The key used to look up data that this component may have saved to an item.
     * This data will be stored on the item using this key.
     */
    getClientDataKey(): string;
    hasValidHostedUrl(): boolean;
    contentKeysToIgnoreWhenCheckingEquality(): string[];
    /**
     * An associative component depends on being explicitly activated for a
     * given item, compared to a dissaciative component, which is enabled by
     * default in areas unrelated to a certain item.
     */
    static associativeAreas(): ComponentArea[];
    isAssociative(): boolean;
    isExplicitlyEnabledForItem(uuid: UuidString): boolean;
    isExplicitlyDisabledForItem(uuid: UuidString): boolean;
    get isExpired(): boolean;
    get identifier(): FeatureIdentifier;
    get isDeprecated(): boolean;
    get deprecationMessage(): string | undefined;
}
export declare class ComponentMutator extends ItemMutator {
    get typedContent(): Partial<ComponentContent>;
    set active(active: boolean);
    set isMobileDefault(isMobileDefault: boolean);
    set defaultEditor(defaultEditor: boolean);
    set componentData(componentData: Record<string, any>);
    set package_info(package_info: any);
    set local_url(local_url: string);
    set hosted_url(hosted_url: string);
    set valid_until(valid_until: Date);
    set permissions(permissions: ComponentPermission[]);
    associateWithItem(uuid: UuidString): void;
    disassociateWithItem(uuid: UuidString): void;
    removeAssociatedItemId(uuid: UuidString): void;
    removeDisassociatedItemId(uuid: UuidString): void;
    setLastSize(size: string): void;
}
