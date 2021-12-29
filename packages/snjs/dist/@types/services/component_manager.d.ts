import { FeatureDescription } from '@standardnotes/features';
import { SNFeaturesService } from './features_service';
import { PayloadSource } from '../protocol/payloads/sources';
import { ItemManager } from './item_manager';
import { SNNote } from '../models/app/note';
import { SNTheme } from '../models/app/theme';
import { SNAlertService } from './alert_service';
import { SNSyncService } from './sync/sync_service';
import { PureService } from './pure_service';
import { ComponentArea, SNComponent } from '../models/app/component';
import { ComponentPermission } from '@standardnotes/features';
import { Environment, Platform } from '../platforms';
import { UuidString } from '../types';
import { PermissionDialog, DesktopManagerInterface } from './component_manager/types';
import { ActionObserver, ComponentViewer } from './component_manager/component_viewer';
export declare const enum ComponentManagerEvent {
    ViewerDidFocus = "ViewerDidFocus"
}
export declare type EventData = {
    componentViewer?: ComponentViewer;
};
/**
 * Responsible for orchestrating component functionality, including editors, themes,
 * and other components. The component manager primarily deals with iframes, and orchestrates
 * sending and receiving messages to and from frames via the postMessage API.
 */
export declare class SNComponentManager extends PureService<ComponentManagerEvent, EventData> {
    private itemManager;
    private syncService;
    private featuresService;
    protected alertService: SNAlertService;
    private environment;
    private platform;
    private timeout;
    private desktopManager?;
    private viewers;
    private removeItemObserver;
    private permissionDialogs;
    constructor(itemManager: ItemManager, syncService: SNSyncService, featuresService: SNFeaturesService, alertService: SNAlertService, environment: Environment, platform: Platform, timeout: any);
    get isDesktop(): boolean;
    get isMobile(): boolean;
    get components(): SNComponent[];
    componentsForArea(area: ComponentArea): SNComponent[];
    /** @override */
    deinit(): void;
    createComponentViewer(component: SNComponent, contextItem?: UuidString, actionObserver?: ActionObserver): ComponentViewer;
    destroyComponentViewer(viewer: ComponentViewer): void;
    setDesktopManager(desktopManager: DesktopManagerInterface): void;
    handleChangedComponents(components: SNComponent[], source?: PayloadSource): void;
    addItemObserver(): void;
    detectFocusChange: () => void;
    onWindowMessage: (event: MessageEvent) => void;
    configureForNonMobileUsage(): void;
    configureForDesktop(): void;
    postActiveThemesToAllViewers(): void;
    getActiveThemes(): SNTheme[];
    nativeFeatureForComponent(component: SNComponent): FeatureDescription | undefined;
    urlForComponent(component: SNComponent): string | undefined;
    urlsForActiveThemes(): string[];
    private findComponent;
    findComponentViewer(identifier: string): ComponentViewer | undefined;
    componentViewerForSessionKey(key: string): ComponentViewer | undefined;
    private areRequestedPermissionsValid;
    runWithPermissions(componentUuid: UuidString, requiredPermissions: ComponentPermission[], runFunction: () => void): void;
    promptForPermissionsWithAngularAsyncRendering(component: SNComponent, permissions: ComponentPermission[], callback: (approved: boolean) => Promise<void>): void;
    promptForPermissions(component: SNComponent, permissions: ComponentPermission[], callback: (approved: boolean) => Promise<void>): void;
    presentPermissionsDialog(_dialog: PermissionDialog): void;
    toggleTheme(uuid: UuidString): Promise<void>;
    toggleComponent(uuid: UuidString): Promise<void>;
    deleteComponent(uuid: UuidString): Promise<void>;
    isComponentActive(component: SNComponent): boolean;
    allComponentIframes(): HTMLIFrameElement[];
    iframeForComponentViewer(viewer: ComponentViewer): HTMLIFrameElement | undefined;
    editorForNote(note: SNNote): SNComponent | undefined;
    getDefaultEditor(): SNComponent;
    permissionsStringForPermissions(permissions: ComponentPermission[], component: SNComponent): string;
}
