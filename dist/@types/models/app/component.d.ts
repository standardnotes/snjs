import { UuidString } from './../../types';
import { PurePayload } from '../../protocol/payloads/pure_payload';
import { SNItem, ItemMutator } from '../core/item';
import { ConflictStrategies } from '../../protocol/payloads/index';
export declare enum ComponentArea {
    Editor = "editor-editor",
    Themes = "themes",
    TagsList = "tags-list",
    EditorStack = "editor-stack",
    NoteTags = "note-tags",
    Rooms = "rooms",
    Modal = "modal",
    Any = "*"
}
/**
 * Components are mostly iframe based extensions that communicate with the SN parent
 * via the postMessage API. However, a theme can also be a component, which is activated
 * only by its url.
 */
export declare class SNComponent extends SNItem {
    readonly componentData: Record<string, any>;
    /** Items that have requested a component to be disabled in its context */
    readonly disassociatedItemIds: string[];
    /** Items that have requested a component to be enabled in its context */
    readonly associatedItemIds: string[];
    readonly local_url: string;
    readonly hosted_url: string;
    readonly offlineOnly: boolean;
    readonly name: string;
    readonly autoupdateDisabled: boolean;
    readonly package_info: any;
    readonly area: ComponentArea;
    readonly permissions: any[];
    readonly valid_until: Date;
    readonly active: boolean;
    readonly legacy_url: string;
    constructor(payload: PurePayload);
    /** Do not duplicate components under most circumstances. Always keep original */
    strategyWhenConflictingWithItem(item: SNItem): ConflictStrategies.KeepLeft | ConflictStrategies.KeepRight | ConflictStrategies.KeepLeftDuplicateRight | ConflictStrategies.KeepLeftMergeRefs;
    isEditor(): boolean;
    isTheme(): boolean;
    isDefaultEditor(): boolean;
    getLastSize(): any;
    acceptsThemes(): any;
    /**
     * The key used to look up data that this component may have saved to an item.
     * This data will be stored on the item using this key.
     */
    getClientDataKey(): string;
    hasValidHostedUrl(): string;
    contentKeysToIgnoreWhenCheckingEquality(): string[];
    /**
     * An associative component depends on being explicitly activated for a
     * given item, compared to a dissaciative component, which is enabled by
     * default in areas unrelated to a certain item.
     */
    static associativeAreas(): ComponentArea[];
    isAssociative(): boolean;
    isExplicitlyEnabledForItem(item: SNItem): boolean;
    isExplicitlyDisabledForItem(item: SNItem): boolean;
}
export declare class ComponentMutator extends ItemMutator {
    set active(active: boolean);
    set componentData(componentData: Record<string, any>);
    associateWithItem(item: SNItem): void;
    disassociateWithItem(item: SNItem): void;
    removeAssociatedItemId(uuid: UuidString): void;
    removeDisassociatedItemId(uuid: UuidString): void;
    setLastSize(size: string): void;
}
