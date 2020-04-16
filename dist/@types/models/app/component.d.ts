import { ConflictStrategy } from '../../protocol/payloads/deltas/strategies';
import { UuidString } from './../../types';
import { PurePayload } from '../../protocol/payloads/pure_payload';
import { SNItem, ItemMutator } from '../core/item';
import { ContentType } from '../content_types';
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
export declare enum ComponentAction {
    SetSize = "set-size",
    StreamItems = "stream-items",
    StreamContextItem = "stream-context-item",
    SaveItems = "save-items",
    SelectItem = "select-item",
    AssociateItem = "associate-item",
    DeassociateItem = "deassociate-item",
    ClearSelection = "clear-selection",
    CreateItem = "create-item",
    CreateItems = "create-items",
    DeleteItems = "delete-items",
    SetComponentData = "set-component-data",
    InstallLocalComponent = "install-local-component",
    ToggleActivateComponent = "toggle-activate-component",
    RequestPermissions = "request-permissions",
    PresentConflictResolution = "present-conflict-resolution",
    DuplicateItem = "duplicate-item",
    ComponentRegistered = "component-registered",
    ActivateThemes = "themes",
    Reply = "reply",
    SaveSuccess = "save-success",
    SaveError = "save-error"
}
export declare type ComponentPermission = {
    name: ComponentAction;
    content_types?: ContentType[];
};
interface ComponentContent {
    componentData: Record<string, any>;
    /** Items that have requested a component to be disabled in its context */
    disassociatedItemIds: string[];
    /** Items that have requested a component to be enabled in its context */
    associatedItemIds: string[];
    local_url: string;
    hosted_url: string;
    offlineOnly: boolean;
    name: string;
    autoupdateDisabled: boolean;
    package_info: any;
    area: ComponentArea;
    permissions: ComponentPermission[];
    valid_until: Date;
    active: boolean;
    legacy_url: string;
    isMobileDefault: boolean;
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
    readonly hosted_url: string;
    readonly offlineOnly: boolean;
    readonly name: string;
    readonly autoupdateDisabled: boolean;
    readonly package_info: any;
    readonly area: ComponentArea;
    readonly permissions: ComponentPermission[];
    readonly valid_until: Date;
    readonly active: boolean;
    readonly legacy_url: string;
    readonly isMobileDefault: boolean;
    constructor(payload: PurePayload);
    /** Do not duplicate components under most circumstances. Always keep original */
    strategyWhenConflictingWithItem(item: SNItem): ConflictStrategy.KeepLeft | ConflictStrategy.KeepRight | ConflictStrategy.KeepLeftDuplicateRight | ConflictStrategy.KeepLeftMergeRefs;
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
    get typedContent(): Partial<ComponentContent>;
    set active(active: boolean);
    set defaultEditor(defaultEditor: boolean);
    set componentData(componentData: Record<string, any>);
    set package_info(package_info: any);
    set local_url(local_url: string);
    set hosted_url(hosted_url: string);
    set permissions(permissions: ComponentPermission[]);
    associateWithItem(item: SNItem): void;
    disassociateWithItem(item: SNItem): void;
    removeAssociatedItemId(uuid: UuidString): void;
    removeDisassociatedItemId(uuid: UuidString): void;
    setLastSize(size: string): void;
}
export {};
