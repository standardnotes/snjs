import { ComponentAction, ComponentPermission } from '@standardnotes/features';
import { SNComponent } from '../../models';
import { ComponentArea } from '../../models/app/component';
import { UuidString } from '../../types';
import { ContentType } from '../../models/content_types';
import { RawPayload } from '../../protocol/payloads/generator';
export interface DesktopManagerInterface {
    syncComponentsInstallation(components: SNComponent[]): void;
    registerUpdateObserver(callback: (component: SNComponent) => void): void;
    getExtServerHost(): string;
}
export declare type ComponentRawPayload = RawPayload & {
    clientData: any;
};
/**
 * Content types which are allowed to be managed/streamed in bulk by a component.
 */
export declare const AllowedBatchPermissions: readonly ContentType[];
export declare const ComponentDataDomain = "org.standardnotes.sn.components";
export declare type StreamObserver = {
    identifier: string;
    componentUuid: UuidString;
    area: ComponentArea;
    originalMessage: any;
    /** contentTypes is optional in the case of a context stream observer */
    contentTypes?: ContentType[];
};
export declare type PermissionDialog = {
    component: SNComponent;
    permissions: ComponentPermission[];
    permissionsString: string;
    actionBlock: (approved: boolean) => void;
    callback: (approved: boolean) => void;
};
export declare enum KeyboardModifier {
    Shift = "Shift",
    Ctrl = "Control",
    Meta = "Meta"
}
export declare type MessageData = Partial<{
    /** Related to the stream-item-context action */
    item?: ItemMessagePayload;
    /** Related to the stream-items action */
    content_types?: ContentType[];
    items?: ItemMessagePayload[];
    /** Related to the request-permission action */
    permissions?: ComponentPermission[];
    /** Related to the component-registered action */
    componentData?: any;
    uuid?: UuidString;
    environment?: string;
    platform?: string;
    activeThemeUrls?: string[];
    /** Related to set-size action */
    width?: string | number;
    height?: string | number;
    type?: string;
    /** Related to themes action */
    themes?: string[];
    /** Related to clear-selection action */
    content_type?: ContentType;
    /** Related to key-pressed action */
    keyboardModifier?: KeyboardModifier;
}>;
export declare type StreamItemsMessageData = MessageData & {
    content_types: ContentType[];
};
export declare type DeleteItemsMessageData = MessageData & {
    items: ItemMessagePayload[];
};
export declare type ComponentMessage = {
    action: ComponentAction;
    sessionKey?: string;
    componentData?: any;
    data: MessageData;
};
export declare type MessageReplyData = {
    approved?: boolean;
    deleted?: boolean;
    error?: string;
    item?: any;
    items?: any[];
    themes?: string[];
};
export declare type MessageReply = {
    action: ComponentAction;
    original: ComponentMessage;
    data: MessageReplyData;
};
export declare type ItemMessagePayload = {
    uuid: string;
    content_type: ContentType;
    created_at: Date;
    updated_at: Date;
    deleted: boolean;
    content: any;
    clientData: any;
    /** isMetadataUpdate implies that the extension should make reference of updated
     * metadata, but not update content values as they may be stale relative to what the
     * extension currently has. Changes are always metadata updates if the mapping source
     * is PayloadSource.RemoteSaved || PayloadSource.LocalSaved || PayloadSource.PreSyncSave */
    isMetadataUpdate: any;
};
