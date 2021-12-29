import { FeatureStatus } from '../../../../services/features_service';
import { SNFeaturesService } from '../../../../services';
import { SNAlertService } from '../../../../services/alert_service';
import { SNSyncService } from '../../../../services/sync/sync_service';
import { Environment, Platform } from '../../../../platforms';
import { ComponentMessage, MessageReply } from './types';
import { ComponentAction, ComponentPermission } from '@standardnotes/features';
import { PayloadSource } from '../../../../protocol/payloads';
import { ItemManager } from '../../../../services/item_manager';
import { UuidString } from '../../../../types';
import { SNItem } from '../../../../models/core/item';
import { SNComponent } from '../../../../models';
import { MessageData } from '..';
declare type RunWithPermissionsCallback = (componentUuid: UuidString, requiredPermissions: ComponentPermission[], runFunction: () => void) => void;
declare type ComponentManagerFunctions = {
    runWithPermissions: RunWithPermissionsCallback;
    urlsForActiveThemes: () => string[];
};
export declare type ActionObserver = (action: ComponentAction, messageData: MessageData) => void;
export declare const enum ComponentViewerEvent {
    FeatureStatusUpdated = "FeatureStatusUpdated"
}
declare type EventObserver = (event: ComponentViewerEvent) => void;
export declare const enum ComponentViewerError {
    OfflineRestricted = "OfflineRestricted",
    MissingUrl = "MissingUrl"
}
export declare class ComponentViewer {
    component: SNComponent;
    private itemManager;
    private syncService;
    private alertService;
    private environment;
    private platform;
    private componentManagerFunctions;
    private url?;
    private contextItemUuid?;
    private streamItems?;
    private streamContextItemOriginalMessage?;
    private streamItemsOriginalMessage?;
    private removeItemObserver;
    private loggingEnabled;
    identifier: string;
    private actionObservers;
    overrideContextItem?: SNItem;
    private featureStatus;
    private removeFeaturesObserver;
    private eventObservers;
    private window?;
    private hidden;
    private readonly;
    lockReadonly: boolean;
    sessionKey?: string;
    constructor(component: SNComponent, itemManager: ItemManager, syncService: SNSyncService, alertService: SNAlertService, featuresService: SNFeaturesService, environment: Environment, platform: Platform, componentManagerFunctions: ComponentManagerFunctions, url?: string | undefined, contextItemUuid?: string | undefined, actionObserver?: ActionObserver);
    get isDesktop(): boolean;
    get isMobile(): boolean;
    destroy(): void;
    private deinit;
    addEventObserver(observer: EventObserver): () => void;
    private notifyEventObservers;
    addActionObserver(observer: ActionObserver): () => void;
    setReadonly(readonly: boolean): void;
    get componentUuid(): string;
    getFeatureStatus(): FeatureStatus;
    private isOfflineRestricted;
    private hasUrlError;
    shouldRender(): boolean;
    getError(): ComponentViewerError | undefined;
    private updateOurComponentRefFromChangedItems;
    handleChangesInItems(items: SNItem[], source?: PayloadSource, sourceKey?: string): void;
    sendManyItemsThroughBridge(items: SNItem[]): void;
    sendContextItemThroughBridge(item: SNItem, source?: PayloadSource): void;
    private log;
    private sendItemsInReply;
    private jsonForItem;
    private replyToMessage;
    /**
     * @param essential If the message is non-essential, no alert will be shown
     *  if we can no longer find the window.
     * @returns
     */
    sendMessage(message: ComponentMessage | MessageReply, essential?: boolean): void;
    private responseItemsByRemovingPrivateProperties;
    getWindow(): Window | undefined;
    /** Called by client when the iframe is ready */
    setWindow(window: Window): Promise<void>;
    postActiveThemes(): void;
    setHidden(hidden: boolean): void;
    handleMessage(message: ComponentMessage): void;
    handleStreamItemsMessage(message: ComponentMessage): void;
    handleStreamContextItemMessage(message: ComponentMessage): void;
    /**
     * Save items is capable of saving existing items, and also creating new ones
     * if they don't exist.
     */
    handleSaveItemsMessage(message: ComponentMessage): void;
    handleCreateItemsMessage(message: ComponentMessage): void;
    handleDeleteItemsMessage(message: ComponentMessage): void;
    handleRequestPermissionsMessage(message: ComponentMessage): void;
    handleSetComponentDataMessage(message: ComponentMessage): void;
    handleSetSizeEvent(message: ComponentMessage): void;
    getIframe(): HTMLIFrameElement | undefined;
}
export {};
