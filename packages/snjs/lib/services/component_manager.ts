import { Uuids } from '@Models/functions';
import { ComponentMutator } from './../models/app/component';
import { CreateItemFromPayload } from '@Models/generator';
import {
  ContentType,
  displayStringForContentType,
} from './../models/content_types';
import { PayloadSource } from './../protocol/payloads/sources';
import {
  CreateSourcedPayloadFromObject,
  PayloadContent,
  RawPayload,
} from '@Payloads/generator';
import { ItemManager } from '@Services/item_manager';
import { SNNote } from './../models/app/note';
import { SNTheme } from './../models/app/theme';
import { MutationType, SNItem } from '@Models/core/item';
import { SNAlertService } from './alert_service';
import { SNSyncService } from './sync/sync_service';
import find from 'lodash/find';
import uniq from 'lodash/uniq';
import remove from 'lodash/remove';
import { PureService } from '@Lib/services/pure_service';
import {
  ComponentAction,
  ComponentArea,
  ComponentPermission,
  SNComponent,
} from '@Models/app/component';
import { Uuid } from '@Lib/uuid';
import {
  Copy,
  concatArrays,
  extendArray,
  filterFromArray,
  isString,
  removeFromArray,
  searchArray,
  sleep,
} from '@Lib/utils';
import {
  Environment,
  Platform,
  environmentToString,
  platformToString,
} from '@Lib/platforms';
import { UuidString } from '../types';

const DESKTOP_URL_PREFIX = 'sn://';
const LOCAL_HOST = 'localhost';
const CUSTOM_LOCAL_HOST = 'sn.local';
const ANDROID_LOCAL_HOST = '10.0.2.2';

type ComponentRawPayload = RawPayload & {
  clientData: any;
};

/**
 * Content types which are allowed to be managed/streamed in bulk by a component.
 */
const AllowedBatchPermissions = Object.freeze([
  ContentType.ActionsExtension,
  ContentType.Component,
  ContentType.Editor,
  ContentType.ExtensionRepo,
  ContentType.FilesafeCredentials,
  ContentType.FilesafeFileMetadata,
  ContentType.FilesafeIntegration,
  ContentType.Mfa,
  ContentType.ServerExtension,
  ContentType.SmartTag,
  ContentType.Tag,
  ContentType.Theme,
]);

/* This domain will be used to save context item client data */
const ComponentDataDomain = 'org.standardnotes.sn.components';

type StreamObserver = {
  identifier: string;
  componentUuid: UuidString;
  area: ComponentArea;
  originalMessage: any;
  /** contentTypes is optional in the case of a context stream observer */
  contentTypes?: ContentType[];
};

type ComponentHandler = {
  identifier: string;
  areas: ComponentArea[];
  actionHandler?: (
    component: SNComponent,
    action: ComponentAction,
    data: MessageData
  ) => void;
  contextRequestHandler?: (componentUuid: UuidString) => SNItem | undefined;
  componentForSessionKeyHandler?: (
    sessionKey: string
  ) => SNComponent | undefined;
  focusHandler?: (component: SNComponent, focused: boolean) => void;
};

export type PermissionDialog = {
  component: SNComponent;
  permissions: ComponentPermission[];
  permissionsString: string;
  actionBlock: (approved: boolean) => void;
  callback: (approved: boolean) => void;
};

enum KeyboardModifier {
  Shift = 'Shift',
  Ctrl = 'Control',
  Meta = 'Meta',
}

export type MessageData = Partial<{
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

type StreamItemsMessageData = MessageData & {
  content_types: ContentType[];
};

type DeleteItemsMessageData = MessageData & {
  items: ItemMessagePayload[];
};

type ComponentMessage = {
  action: ComponentAction;
  sessionKey?: string;
  componentData?: any;
  data: MessageData;
};

type MessageReplyData = {
  approved?: boolean;
  deleted?: boolean;
  error?: string;
  item?: any;
  items?: any[];
  themes?: string[];
};

type MessageReply = {
  action: ComponentAction;
  original: ComponentMessage;
  data: MessageReplyData;
};

export type ItemMessagePayload = {
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

type ComponentState = {
  window?: Window;
  hidden: boolean;
  readonly: boolean;
  lockReadonly: boolean;
  sessionKey?: string;
};

/**
 * Responsible for orchestrating component functionality, including editors, themes,
 * and other components. The component manager primarily deals with iframes, and orchestrates
 * sending and receiving messages to and from frames via the postMessage API.
 */
export class SNComponentManager extends PureService {
  private itemManager!: ItemManager;
  private syncService!: SNSyncService;
  protected alertService!: SNAlertService;
  private environment: Environment;
  private platform: Platform;
  private timeout: any;
  private desktopManager: any;
  private componentState: Partial<Record<UuidString, ComponentState>> = {};

  private removeItemObserver?: any;
  private streamObservers: StreamObserver[] = [];
  private contextStreamObservers: StreamObserver[] = [];
  private permissionDialogs: PermissionDialog[] = [];
  private handlers: ComponentHandler[] = [];

  private templateComponents: SNComponent[] = [];

  constructor(
    itemManager: ItemManager,
    syncService: SNSyncService,
    alertService: SNAlertService,
    environment: Environment,
    platform: Platform,
    timeout: any
  ) {
    super();
    this.timeout = timeout || setTimeout.bind(window);
    this.itemManager = itemManager;
    this.syncService = syncService;
    this.alertService = alertService;
    this.environment = environment;
    this.platform = platform;
    this.configureForGeneralUsage();
    if (environment !== Environment.Mobile) {
      this.configureForNonMobileUsage();
    }
  }

  get isDesktop(): boolean {
    return this.environment === Environment.Desktop;
  }

  get isMobile(): boolean {
    return this.environment === Environment.Mobile;
  }

  get components(): SNComponent[] {
    return this.itemManager.getItems([
      ContentType.Component,
      ContentType.Theme,
    ]) as SNComponent[];
  }

  componentsForArea(area: ComponentArea): SNComponent[] {
    return this.components.filter((component) => {
      return component.area === area;
    });
  }

  /** @override */
  deinit(): void {
    super.deinit();
    this.streamObservers.length = 0;
    this.contextStreamObservers.length = 0;
    this.permissionDialogs.length = 0;
    this.templateComponents.length = 0;
    this.handlers.length = 0;
    (this.itemManager as any) = undefined;
    (this.syncService as any) = undefined;
    (this.alertService as any) = undefined;
    this.removeItemObserver();
    this.removeItemObserver = null;
    if (window && !this.isMobile) {
      window.removeEventListener('focus', this.detectFocusChange, true);
      window.removeEventListener('blur', this.detectFocusChange, true);
      window.removeEventListener('message', this.onWindowMessage);
    }
  }

  setDesktopManager(desktopManager: any): void {
    this.desktopManager = desktopManager;
    this.configureForDesktop();
  }

  configureForGeneralUsage(): void {
    this.removeItemObserver = this.itemManager.addObserver(
      ContentType.Any,
      (changed, inserted, discarded, _ignored, source, sourceKey) => {
        const items = concatArrays(changed, inserted, discarded) as SNItem[];
        const syncedComponents = items.filter((item) => {
          return (
            item.content_type === ContentType.Component ||
            item.content_type === ContentType.Theme
          );
        }) as SNComponent[];
        /**
         * We only want to sync if the item source is Retrieved, not RemoteSaved to avoid
         * recursion caused by the component being modified and saved after it is updated.
         */
        if (
          syncedComponents.length > 0 &&
          source !== PayloadSource.RemoteSaved
        ) {
          /* Ensure any component in our data is installed by the system */
          if (this.isDesktop) {
            this.desktopManager.syncComponentsInstallation(syncedComponents);
          }
        }

        const themes = syncedComponents.filter((c) => c.isTheme());
        if (themes.length > 0) {
          this.postActiveThemesToAllComponents();
        }

        for (const component of syncedComponents) {
          if (component.isEditor()) {
            /** Editors shouldn't get activated or deactivated */
            continue;
          }
          const isDisplayed = !!this.iframeForComponent(component.uuid);
          if (!component.active && isDisplayed) {
            this.deactivateComponent(component.uuid);
          }
        }
        this.notifyStreamObservers(items, source, sourceKey);
      }
    );
  }

  notifyStreamObservers(
    allItems: SNItem[],
    source?: PayloadSource,
    sourceKey?: string
  ): void {
    for (const observer of this.streamObservers) {
      if (sourceKey && sourceKey === observer.componentUuid) {
        /* Don't notify source of change, as it is the originator, doesn't need duplicate event. */
        continue;
      }
      const relevantItems = allItems.filter((item) => {
        return observer.contentTypes!.indexOf(item.content_type!) !== -1;
      });
      if (relevantItems.length === 0) {
        continue;
      }
      const requiredPermissions: ComponentPermission[] = [
        {
          name: ComponentAction.StreamItems,
          content_types: observer.contentTypes!.sort(),
        },
      ];
      this.runWithPermissions(
        observer.componentUuid,
        requiredPermissions,
        () => {
          this.sendItemsInReply(
            observer.componentUuid,
            relevantItems,
            observer.originalMessage
          );
        }
      );
    }
    const requiredContextPermissions = [
      {
        name: ComponentAction.StreamContextItem,
      },
    ] as ComponentPermission[];
    for (const observer of this.contextStreamObservers) {
      if (sourceKey && sourceKey === observer.componentUuid) {
        /* Don't notify source of change, as it is the originator, doesn't need duplicate event. */
        continue;
      }
      for (const handler of this.handlers) {
        if (
          !handler.areas.includes(observer.area) &&
          !handler.areas.includes(ComponentArea.Any)
        ) {
          continue;
        }
        if (handler.contextRequestHandler) {
          const itemInContext = handler.contextRequestHandler(
            observer.componentUuid
          );
          if (itemInContext) {
            const matchingItem = find(allItems, { uuid: itemInContext.uuid });
            if (matchingItem) {
              if (matchingItem.deleted) {
                continue;
              }
              this.runWithPermissions(
                observer.componentUuid,
                requiredContextPermissions,
                () => {
                  this.sendContextItemInReply(
                    observer.componentUuid,
                    matchingItem,
                    observer.originalMessage,
                    source
                  );
                }
              );
            }
          }
        }
      }
    }
  }

  isNativeExtension(component: SNComponent): boolean {
    const nativeUrls = [
      (window as any)._extensions_manager_location,
      (window as any)._batch_manager_location,
    ];
    const hostedUrl = component.hosted_url;
    const localUrl =
      component.local_url &&
      component.local_url.replace(DESKTOP_URL_PREFIX, '');
    return nativeUrls.includes(hostedUrl) || nativeUrls.includes(localUrl);
  }

  detectFocusChange = (): void => {
    const activeIframes = this.allComponentIframes();
    for (const iframe of activeIframes) {
      if (document.activeElement === iframe) {
        this.timeout(() => {
          const component = this.findComponent(iframe.dataset.componentId!);
          for (const handler of this.handlers) {
            /* Notify all handlers, and not just ones that match this component type */
            handler.focusHandler && handler.focusHandler(component, true);
          }
        });
        break;
      }
    }
  };

  onWindowMessage = (event: MessageEvent): void => {
    /** Make sure this message is for us */
    if (event.data.sessionKey) {
      this.log('Component manager received message', event.data);
      this.handleMessage(
        this.componentForSessionKey(event.data.sessionKey)!,
        event.data
      );
    }
  };

  configureForNonMobileUsage(): void {
    window.addEventListener
      ? window.addEventListener('focus', this.detectFocusChange, true)
      : (window as any).attachEvent('onfocusout', this.detectFocusChange);
    window.addEventListener
      ? window.addEventListener('blur', this.detectFocusChange, true)
      : (window as any).attachEvent('onblur', this.detectFocusChange);

    /* On mobile, events listeners are handled by a respective component */
    window.addEventListener('message', this.onWindowMessage);
  }

  configureForDesktop(): void {
    this.desktopManager.registerUpdateObserver((component: SNComponent) => {
      /* Reload theme if active */
      if (component.active && component.isTheme()) {
        this.postActiveThemesToAllComponents();
      }
    });
  }

  postActiveThemesToAllComponents(): void {
    for (const component of this.components) {
      const componentState = this.findOrCreateDataForComponent(component.uuid);
      if (!componentState.window) {
        continue;
      }
      this.postActiveThemesToComponent(component);
    }
  }

  getActiveThemes(): SNTheme[] {
    if (this.environment === Environment.Mobile) {
      throw Error('getActiveThemes must be handled separately by mobile');
    }
    return this.componentsForArea(ComponentArea.Themes).filter((theme) => {
      return theme.active;
    }) as SNTheme[];
  }

  urlsForActiveThemes(): string[] {
    const themes = this.getActiveThemes();
    const urls = [];
    for (const theme of themes) {
      const url = this.urlForComponent(theme);
      if (url) {
        urls.push(url);
      }
    }
    return urls;
  }

  postActiveThemesToComponent(component: SNComponent): void {
    const urls = this.urlsForActiveThemes();
    const data: MessageReplyData = {
      themes: urls,
    };
    const message: ComponentMessage = {
      action: ComponentAction.ActivateThemes,
      data: data,
    };
    this.sendMessageToComponent(component, message);
  }

  private findComponent(uuid: UuidString) {
    return (
      this.templateComponents.find((c) => c.uuid === uuid) ||
      (this.itemManager.findItem(uuid) as SNComponent)
    );
  }

  public addTemporaryTemplateComponent(component: SNComponent): void {
    this.templateComponents.push(component);
  }

  public removeTemporaryTemplateComponent(component: SNComponent): void {
    this.templateComponents = this.templateComponents.filter(
      (c) => c.uuid !== component.uuid
    );
  }

  contextItemDidChangeInArea(area: ComponentArea): void {
    for (const handler of this.handlers) {
      if (
        !handler.areas.includes(area) &&
        !handler.areas.includes(ComponentArea.Any)
      ) {
        continue;
      }
      const observers = this.contextStreamObservers.filter((observer) => {
        return observer.area === area;
      });
      for (const observer of observers) {
        if (handler.contextRequestHandler) {
          const itemInContext = handler.contextRequestHandler(
            observer.componentUuid
          );
          if (itemInContext) {
            this.sendContextItemInReply(
              observer.componentUuid,
              itemInContext,
              observer.originalMessage
            );
          }
        }
      }
    }
  }

  public isComponentHidden(component: SNComponent): boolean {
    const componentState = this.findOrCreateDataForComponent(component.uuid);
    return componentState.hidden;
  }

  public setComponentHidden(component: SNComponent, hidden: boolean): void {
    /* A hidden component will not receive messages. However, when a component is unhidden,
     * we need to send it any items it may have registered streaming for. */
    const componentState = this.findOrCreateDataForComponent(component.uuid);
    if (hidden) {
      componentState.hidden = true;
    } else if (componentState.hidden) {
      componentState.hidden = false;
      const contextObserver = find(this.contextStreamObservers, {
        identifier: component.uuid,
      });
      if (contextObserver) {
        this.handleStreamContextItemMessage(
          component,
          contextObserver.originalMessage
        );
      }
      const streamObserver = find(this.streamObservers, {
        identifier: component.uuid,
      });
      if (streamObserver) {
        this.handleStreamItemsMessage(
          component,
          streamObserver.originalMessage
        );
      }
    }
  }

  jsonForItem(
    item: SNItem,
    component: SNComponent,
    source?: PayloadSource
  ): ItemMessagePayload {
    const isMetadatUpdate =
      source === PayloadSource.RemoteSaved ||
      source === PayloadSource.LocalSaved ||
      source === PayloadSource.PreSyncSave;
    /** The data all components store into */
    const componentData = item.getDomainData(ComponentDataDomain) || {};
    /** The data for this particular component */
    const clientData = componentData[component.getClientDataKey()!] || {};
    const params: ItemMessagePayload = {
      uuid: item.uuid,
      content_type: item.content_type!,
      created_at: item.created_at!,
      updated_at: item.serverUpdatedAt!,
      deleted: item.deleted!,
      isMetadataUpdate: isMetadatUpdate,
      content: item.content,
      clientData: clientData,
    };
    return this.responseItemsByRemovingPrivateProperties(
      [params],
      component
    )[0];
  }

  sendItemsInReply(
    componentUuid: UuidString,
    items: SNItem[],
    message: ComponentMessage,
    source?: PayloadSource
  ): void {
    const component = this.findComponent(componentUuid);
    this.log(
      'Component manager send items in reply',
      component,
      items,
      message
    );
    const responseData: MessageReplyData = {};
    const mapped = items.map((item) => {
      return this.jsonForItem(item, component, source);
    });
    responseData.items = mapped;
    this.replyToMessage(component, message, responseData);
  }

  sendContextItemInReply(
    componentUuid: UuidString,
    item: SNItem,
    originalMessage: ComponentMessage,
    source?: PayloadSource
  ): void {
    const component = this.findComponent(componentUuid);
    this.log(
      'Component manager send context item in reply',
      component,
      item,
      originalMessage
    );
    const response: MessageReplyData = {
      item: this.jsonForItem(item, component, source),
    };
    this.replyToMessage(component, originalMessage, response);
  }

  replyToMessage(
    component: SNComponent,
    originalMessage: ComponentMessage,
    replyData: MessageReplyData
  ): void {
    const reply: MessageReply = {
      action: ComponentAction.Reply,
      original: originalMessage,
      data: replyData,
    };
    this.sendMessageToComponent(component, reply);
  }

  sendMessageToComponent(
    component: SNComponent,
    message: ComponentMessage | MessageReply
  ): void {
    const permissibleActionsWhileHidden = [
      ComponentAction.ComponentRegistered,
      ComponentAction.ActivateThemes,
    ];
    const componentState = this.findOrCreateDataForComponent(component.uuid);
    if (
      componentState.hidden &&
      !permissibleActionsWhileHidden.includes(message.action)
    ) {
      this.log(
        'Component disabled for current item, ignoring messages.',
        component.name
      );
      return;
    }
    if (!componentState.window && message.action === ComponentAction.Reply) {
      this.log(
        'Component has been deallocated in between message send and reply',
        component,
        message
      );
      return;
    }
    this.log('Component manager send message to component', component, message);
    let origin = this.urlForComponent(component);
    if (!origin || !componentState.window) {
      void this.alertService.alert(
        `Standard Notes is trying to communicate with ${component.name},
        but an error is occurring. Please restart this extension and try again.`
      );
      return;
    }
    if (!origin!.startsWith('http') && !origin!.startsWith('file')) {
      /* Native extension running in web, prefix current host */
      origin = window.location.href + origin;
    }
    /* Mobile messaging requires json */
    componentState.window?.postMessage(
      this.isMobile ? JSON.stringify(message) : message,
      origin!
    );
  }

  urlForComponent(component: SNComponent): string | null {
    /* offlineOnly is available only on desktop, and not on web or mobile. */
    if (component.offlineOnly && !this.isDesktop) {
      return null;
    }
    if (component.offlineOnly || (this.isDesktop && component.local_url)) {
      return (
        component.local_url &&
        component.local_url.replace(
          DESKTOP_URL_PREFIX,
          this.desktopManager.getExtServerHost()
        )
      );
    } else {
      let url = component.hosted_url || component.legacy_url;
      if (this.isMobile) {
        const localReplacement =
          this.platform === Platform.Ios ? LOCAL_HOST : ANDROID_LOCAL_HOST;
        url = url
          .replace(LOCAL_HOST, localReplacement)
          .replace(CUSTOM_LOCAL_HOST, localReplacement);
      }
      return url;
    }
  }

  componentForUrl(url: string): SNComponent {
    return this.components.filter((component) => {
      return component.hosted_url === url || component.legacy_url === url;
    })[0];
  }

  public sessionKeyForComponent(component: SNComponent): string | undefined {
    const componentState = this.findOrCreateDataForComponent(component.uuid);
    return componentState.sessionKey;
  }

  componentForSessionKey(key: string): SNComponent | undefined {
    let component;
    for (const uuid of Object.keys(this.componentState)) {
      const data = this.componentState[uuid];
      if (data?.sessionKey === key) {
        component = this.components.find((c) => c.uuid === uuid) as SNComponent;
        break;
      }
    }
    if (!component) {
      for (const handler of this.handlers) {
        if (handler.componentForSessionKeyHandler) {
          component = handler.componentForSessionKeyHandler(key);
          if (component) {
            break;
          }
        }
      }
    }
    return component;
  }

  handleMessage(component: SNComponent, message: ComponentMessage): void {
    if (!component) {
      this.log('Component not defined for message, returning', message);
      this.alertService.alert(
        'An extension is trying to communicate with Standard Notes, ' +
          'but there is an error establishing a bridge. Please restart the app and try again.'
      );
      return;
    }
    const readwriteActions = [
      ComponentAction.SaveItems,
      ComponentAction.AssociateItem,
      ComponentAction.DeassociateItem,
      ComponentAction.CreateItem,
      ComponentAction.CreateItems,
      ComponentAction.DeleteItems,
      ComponentAction.SetComponentData,
    ];
    const readonlyState = this.getReadonlyStateForComponent(component);
    if (readonlyState.readonly && readwriteActions.includes(message.action)) {
      this.alertService.alert(
        `The extension ${component.name} is trying to save, but it is in a locked state and cannot accept changes.`
      );
      return;
    }
    if (message.action === ComponentAction.StreamItems) {
      this.handleStreamItemsMessage(component, message);
    } else if (message.action === ComponentAction.StreamContextItem) {
      this.handleStreamContextItemMessage(component, message);
    } else if (message.action === ComponentAction.SetComponentData) {
      this.handleSetComponentDataMessage(component, message);
    } else if (message.action === ComponentAction.DeleteItems) {
      this.handleDeleteItemsMessage(component, message);
    } else if (
      message.action === ComponentAction.CreateItems ||
      message.action === ComponentAction.CreateItem
    ) {
      this.handleCreateItemsMessage(component, message);
    } else if (message.action === ComponentAction.SaveItems) {
      this.handleSaveItemsMessage(component, message);
    } else if (message.action === ComponentAction.ToggleActivateComponent) {
      const componentToToggle = this.itemManager.findItem(
        message.data.uuid!
      ) as SNComponent;
      this.handleToggleComponentMessage(componentToToggle);
    } else if (message.action === ComponentAction.RequestPermissions) {
      this.handleRequestPermissionsMessage(component, message);
    } else if (message.action === ComponentAction.InstallLocalComponent) {
      this.handleInstallLocalComponentMessage(component, message);
    } else if (message.action === ComponentAction.DuplicateItem) {
      this.handleDuplicateItemMessage(component, message);
    }
    for (const handler of this.handlers) {
      if (
        handler.actionHandler &&
        (handler.areas.includes(component.area) ||
          handler.areas.includes(ComponentArea.Any))
      ) {
        this.timeout(() => {
          handler.actionHandler!(component, message.action, message.data);
        });
      }
    }
  }

  responseItemsByRemovingPrivateProperties<T extends RawPayload>(
    responseItems: T[],
    component: SNComponent,
    includeUrls = false
  ): T[] {
    if (component && this.isNativeExtension(component)) {
      /* System extensions can bypass this step */
      return responseItems;
    }
    /* Don't allow component to overwrite these properties. */
    let privateContentProperties = [
      'autoupdateDisabled',
      'permissions',
      'active',
    ];
    if (includeUrls) {
      privateContentProperties = privateContentProperties.concat([
        'hosted_url',
        'local_url',
      ]);
    }
    return responseItems.map((responseItem) => {
      const privateProperties = privateContentProperties.slice();
      /** Server extensions are allowed to modify url property */
      if (
        includeUrls &&
        responseItem.content_type !== ContentType.ServerExtension
      ) {
        privateProperties.push('url');
      }
      if (!responseItem.content || isString(responseItem.content)) {
        return responseItem;
      }
      const content: Partial<PayloadContent> = {};
      for (const [key, value] of Object.entries(responseItem.content)) {
        /** Only include non-private properties */
        if (!privateProperties.includes(key)) {
          content[key] = value;
        }
      }
      return {
        ...responseItem,
        content: content,
      };
    });
  }

  handleStreamItemsMessage(
    component: SNComponent,
    message: ComponentMessage
  ): void {
    const data = message.data as StreamItemsMessageData;
    const types = data.content_types
      .filter((type) => AllowedBatchPermissions.includes(type))
      .sort();
    const requiredPermissions = [
      {
        name: ComponentAction.StreamItems,
        content_types: types.sort(),
      },
    ];
    this.runWithPermissions(component.uuid, requiredPermissions, () => {
      if (!find(this.streamObservers, { identifier: component.uuid })) {
        /* For pushing later as changes come in */
        this.streamObservers.push({
          identifier: component.uuid,
          componentUuid: component.uuid,
          area: component.area,
          originalMessage: message,
          contentTypes: types,
        });
      }
      /* Push immediately now */
      const items: SNItem[] = [];
      for (const contentType of types) {
        extendArray(
          items,
          this.itemManager.nonErroredItemsForContentType(contentType)
        );
      }
      this.sendItemsInReply(component.uuid, items, message);
    });
  }

  handleStreamContextItemMessage(
    component: SNComponent,
    message: ComponentMessage
  ): void {
    const requiredPermissions: ComponentPermission[] = [
      {
        name: ComponentAction.StreamContextItem,
      },
    ];
    this.runWithPermissions(component.uuid, requiredPermissions, () => {
      if (!find(this.contextStreamObservers, { identifier: component.uuid })) {
        this.contextStreamObservers.push({
          identifier: component.uuid,
          componentUuid: component.uuid,
          area: component.area,
          originalMessage: message,
        });
      }
      for (const handler of this.handlersForArea(component.area)) {
        if (handler.contextRequestHandler) {
          const itemInContext = handler.contextRequestHandler(component.uuid);
          if (itemInContext) {
            this.sendContextItemInReply(component.uuid, itemInContext, message);
          }
        }
      }
    });
  }

  isItemIdWithinComponentContextJurisdiction(
    uuid: string,
    component: SNComponent
  ): boolean {
    const itemIdsInJurisdiction = this.itemIdsInContextJurisdictionForComponent(
      component
    );
    return itemIdsInJurisdiction.includes(uuid);
  }

  /* Returns items that given component has context permissions for */
  itemIdsInContextJurisdictionForComponent(component: SNComponent): string[] {
    const itemIds = [];
    for (const handler of this.handlersForArea(component.area)) {
      if (handler.contextRequestHandler) {
        const itemInContext = handler.contextRequestHandler(component.uuid);
        if (itemInContext) {
          itemIds.push(itemInContext.uuid);
        }
      }
    }
    return itemIds;
  }

  handlersForArea(area: ComponentArea): ComponentHandler[] {
    return this.handlers.filter((candidate) => {
      return candidate.areas.includes(area);
    });
  }

  /**
   * Save items is capable of saving existing items, and also creating new ones
   * if they don't exist.
   */
  handleSaveItemsMessage(
    component: SNComponent,
    message: ComponentMessage
  ): void {
    let responsePayloads = message.data.items as ComponentRawPayload[];
    const requiredPermissions = [];
    const itemIdsInContextJurisdiction = this.itemIdsInContextJurisdictionForComponent(
      component
    );
    /* Pending as in needed to be accounted for in permissions. */
    const pendingResponseItems = responsePayloads.slice();
    for (const responseItem of responsePayloads.slice()) {
      if (itemIdsInContextJurisdiction.includes(responseItem.uuid)) {
        requiredPermissions.push({
          name: ComponentAction.StreamContextItem,
        });
        removeFromArray(pendingResponseItems, responseItem);
        /* We break because there can only be one context item */
        break;
      }
    }
    /* Check to see if additional privileges are required */
    if (pendingResponseItems.length > 0) {
      const requiredContentTypes = uniq(
        pendingResponseItems.map((item: any) => {
          return item.content_type;
        })
      ).sort();
      requiredPermissions.push({
        name: ComponentAction.StreamItems,
        content_types: requiredContentTypes,
      } as ComponentPermission);
    }
    this.runWithPermissions(component.uuid, requiredPermissions, async () => {
      responsePayloads = this.responseItemsByRemovingPrivateProperties(
        responsePayloads,
        component,
        true
      );
      /* Filter locked items */
      const uuids = Uuids(responsePayloads);
      const items = this.itemManager.findItems(uuids, true);
      let lockedCount = 0;
      let lockedNoteCount = 0;
      for (const item of items) {
        if (!item) {
          continue;
        }
        if (item.locked) {
          remove(responsePayloads, { uuid: item.uuid });
          lockedCount++;
          if (item.content_type === ContentType.Note) {
            lockedNoteCount++;
          }
        }
      }
      if (lockedNoteCount === 1) {
        this.alertService.alert(
          'The note you are attempting to save is locked and cannot be edited.',
          'Note Locked'
        );
        return;
      } else if (lockedCount > 0) {
        const itemNoun =
          lockedCount === 1
            ? 'item'
            : lockedNoteCount === lockedCount
            ? 'notes'
            : 'items';
        const auxVerb = lockedCount === 1 ? 'is' : 'are';
        this.alertService.alert(
          `${lockedCount} ${itemNoun} you are attempting to save ${auxVerb} locked and cannot be edited.`,
          'Items Locked'
        );
        return;
      }
      const payloads = responsePayloads.map((responseItem: any) => {
        return CreateSourcedPayloadFromObject(
          responseItem,
          PayloadSource.ComponentRetrieved
        );
      });
      for (const payload of payloads) {
        const item = this.itemManager.findItem(payload.uuid);
        if (!item) {
          const template = CreateItemFromPayload(payload);
          await this.itemManager.insertItem(template);
        } else {
          if (payload.content_type !== item.content_type) {
            throw Error('Extension is trying to modify content type of item.');
          }
        }
      }
      await this.itemManager.changeItems(
        uuids,
        (mutator) => {
          const payload = searchArray(payloads, { uuid: mutator.getUuid() })!;
          mutator.mergePayload(payload);
          const responseItem = searchArray(responsePayloads, {
            uuid: mutator.getUuid(),
          })!;
          if (responseItem.clientData) {
            const allComponentData = Copy(
              mutator.getItem().getDomainData(ComponentDataDomain) || {}
            );
            allComponentData[component.getClientDataKey()!] =
              responseItem.clientData;
            mutator.setDomainData(allComponentData, ComponentDataDomain);
          }
        },
        MutationType.UserInteraction,
        PayloadSource.ComponentRetrieved,
        component.uuid
      );
      this.syncService
        .sync()
        .then(() => {
          /* Allow handlers to be notified when a save begins and ends, to update the UI */
          const saveMessage = Object.assign({}, message);
          saveMessage.action = ComponentAction.SaveSuccess;
          this.replyToMessage(component, message, {});
          this.handleMessage(component, saveMessage);
        })
        .catch(() => {
          const saveMessage = Object.assign({}, message);
          saveMessage.action = ComponentAction.SaveError;
          this.replyToMessage(component, message, {
            error: ComponentAction.SaveError,
          });
          this.handleMessage(component, saveMessage);
        });
    });
  }

  handleDuplicateItemMessage(
    component: SNComponent,
    message: ComponentMessage
  ): void {
    const itemParams = message.data.item!;
    const item = this.itemManager.findItem(itemParams.uuid)!;
    const requiredPermissions = [
      {
        name: ComponentAction.StreamItems,
        content_types: [item.content_type!],
      },
    ];
    this.runWithPermissions(component.uuid, requiredPermissions, async () => {
      const duplicate = await this.itemManager.duplicateItem(item.uuid);
      this.syncService.sync();
      this.replyToMessage(component, message, {
        item: this.jsonForItem(duplicate, component),
      });
    });
  }

  handleCreateItemsMessage(
    component: SNComponent,
    message: ComponentMessage
  ): void {
    let responseItems = message.data.item
      ? [message.data.item]
      : message.data.items!;
    const uniqueContentTypes = uniq(
      responseItems.map((item: any) => {
        return item.content_type;
      })
    ) as ContentType[];
    const requiredPermissions: ComponentPermission[] = [
      {
        name: ComponentAction.StreamItems,
        content_types: uniqueContentTypes,
      },
    ];
    this.runWithPermissions(component.uuid, requiredPermissions, async () => {
      responseItems = this.responseItemsByRemovingPrivateProperties(
        responseItems,
        component
      );
      const processedItems = [];
      for (const responseItem of responseItems) {
        if (!responseItem.uuid) {
          responseItem.uuid = await Uuid.GenerateUuid();
        }
        const payload = CreateSourcedPayloadFromObject(
          responseItem,
          PayloadSource.ComponentCreated
        );
        const template = CreateItemFromPayload(payload);
        const item = await this.itemManager.insertItem(template);
        await this.itemManager.changeItem(
          item.uuid,
          (mutator) => {
            if (responseItem.clientData) {
              const allComponentData = Copy(
                item.getDomainData(ComponentDataDomain) || {}
              );
              allComponentData[component.getClientDataKey()!] =
                responseItem.clientData;
              mutator.setDomainData(allComponentData, ComponentDataDomain);
            }
          },
          MutationType.UserInteraction,
          PayloadSource.ComponentCreated,
          component.uuid
        );
        processedItems.push(item);
      }
      this.syncService.sync();
      const reply =
        message.action === ComponentAction.CreateItem
          ? { item: this.jsonForItem(processedItems[0], component) }
          : {
              items: processedItems.map((item) => {
                return this.jsonForItem(item, component);
              }),
            };
      this.replyToMessage(component, message, reply);
    });
  }

  handleDeleteItemsMessage(
    component: SNComponent,
    message: ComponentMessage
  ): void {
    const data = message.data as DeleteItemsMessageData;
    const items = data.items.filter((item) =>
      AllowedBatchPermissions.includes(item.content_type)
    );
    const requiredContentTypes = uniq(
      items.map((item) => item.content_type)
    ).sort() as ContentType[];
    const requiredPermissions: ComponentPermission[] = [
      {
        name: ComponentAction.StreamItems,
        content_types: requiredContentTypes,
      },
    ];
    this.runWithPermissions(component.uuid, requiredPermissions, async () => {
      const itemsData = items;
      const noun = itemsData.length === 1 ? 'item' : 'items';
      let reply = null;
      const didConfirm = await this.alertService.confirm(
        `Are you sure you want to delete ${itemsData.length} ${noun}?`
      );
      if (didConfirm) {
        /* Filter for any components and deactivate before deleting */
        for (const itemData of itemsData) {
          const item = this.itemManager.findItem(itemData.uuid);
          if (!item) {
            this.alertService.alert(
              'The item you are trying to delete cannot be found.'
            );
            continue;
          }
          if (
            [ContentType.Component, ContentType.Theme].includes(
              item.content_type
            )
          ) {
            await this.deactivateComponent(item.uuid);
          }
          await this.itemManager.setItemToBeDeleted(
            item.uuid,
            PayloadSource.ComponentRetrieved
          );
        }
        this.syncService.sync();
        reply = { deleted: true };
      } else {
        /* Rejected by user */
        reply = { deleted: false };
      }
      this.replyToMessage(component, message, reply);
    });
  }

  handleRequestPermissionsMessage(
    component: SNComponent,
    message: ComponentMessage
  ): void {
    this.runWithPermissions(component.uuid, message.data.permissions!, () => {
      this.replyToMessage(component, message, { approved: true });
    });
  }

  handleSetComponentDataMessage(
    component: SNComponent,
    message: ComponentMessage
  ): void {
    /* A component setting its own data does not require special permissions */
    this.runWithPermissions(component.uuid, [], async () => {
      await this.itemManager.changeComponent(component.uuid, (mutator) => {
        mutator.componentData = message.data.componentData;
      });
      this.syncService.sync();
    });
  }

  async handleToggleComponentMessage(
    targetComponent: SNComponent
  ): Promise<void> {
    await this.toggleComponent(targetComponent);
    this.syncService.sync();
  }

  async toggleComponent(component: SNComponent): Promise<void> {
    if (component.area === ComponentArea.Modal) {
      this.openModalComponent(component);
    } else {
      if (component.active) {
        await this.deactivateComponent(component.uuid);
      } else {
        if (component.content_type === ContentType.Theme) {
          const theme = component as SNTheme;
          /* Deactive currently active theme if new theme is not layerable */
          const activeThemes = this.getActiveThemes();
          /* Activate current before deactivating others, so as not to flicker */
          await this.activateComponent(component.uuid);
          if (!theme.isLayerable()) {
            await sleep(10);
            for (const candidate of activeThemes) {
              if (candidate && !candidate.isLayerable()) {
                await this.deactivateComponent(candidate.uuid);
              }
            }
          }
        } else {
          await this.activateComponent(component.uuid);
        }
      }
    }
  }

  handleInstallLocalComponentMessage(
    sourceComponent: SNComponent,
    message: ComponentMessage
  ): void {
    /* Only native extensions have this permission */
    if (!this.isNativeExtension(sourceComponent)) {
      return;
    }
    const targetComponent = this.itemManager.findItem(message.data.uuid!);
    this.desktopManager.installComponent(targetComponent);
  }

  runWithPermissions(
    componentUuid: UuidString,
    requiredPermissions: ComponentPermission[],
    runFunction: () => void
  ): void {
    const component = this.findComponent(componentUuid);
    /* Make copy as not to mutate input values */
    requiredPermissions = Copy(requiredPermissions) as ComponentPermission[];
    const acquiredPermissions = component.permissions;
    for (const required of requiredPermissions.slice()) {
      /* Remove anything we already have */
      const respectiveAcquired = acquiredPermissions.find(
        (candidate) => candidate.name === required.name
      );
      if (!respectiveAcquired) {
        continue;
      }
      /* We now match on name, lets substract from required.content_types anything we have in acquired. */
      const requiredContentTypes = required.content_types;
      if (!requiredContentTypes) {
        /* If this permission does not require any content types (i.e stream-context-item)
          then we can remove this from required since we match by name (respectiveAcquired.name === required.name) */
        filterFromArray(requiredPermissions, required);
        continue;
      }
      for (const acquiredContentType of respectiveAcquired.content_types!) {
        removeFromArray(requiredContentTypes, acquiredContentType);
      }
      if (requiredContentTypes.length === 0) {
        /* We've removed all acquired and end up with zero, means we already have all these permissions */
        filterFromArray(requiredPermissions, required);
      }
    }
    if (requiredPermissions.length > 0) {
      this.promptForPermissions(
        component,
        requiredPermissions,
        async (approved) => {
          if (approved) {
            runFunction();
          }
        }
      );
    } else {
      runFunction();
    }
  }

  promptForPermissions(
    component: SNComponent,
    permissions: ComponentPermission[],
    callback: (approved: boolean) => Promise<void>
  ): void {
    const params: PermissionDialog = {
      component: component,
      permissions: permissions,
      permissionsString: this.permissionsStringForPermissions(
        permissions,
        component
      ),
      actionBlock: callback,
      callback: async (approved: boolean) => {
        const latestComponent = this.findComponent(component.uuid);
        if (approved) {
          this.log('Changing component to expand permissions', component);
          const componentPermissions = Copy(
            latestComponent.permissions
          ) as ComponentPermission[];
          for (const permission of permissions) {
            const matchingPermission = componentPermissions.find(
              (candidate) => candidate.name === permission.name
            );
            if (!matchingPermission) {
              componentPermissions.push(permission);
            } else {
              /* Permission already exists, but content_types may have been expanded */
              const contentTypes = matchingPermission.content_types || [];
              matchingPermission.content_types = uniq(
                contentTypes.concat(permission.content_types!)
              );
            }
          }
          await this.itemManager.changeItem(component.uuid, (m) => {
            const mutator = m as ComponentMutator;
            mutator.permissions = componentPermissions;
          });
          this.syncService.sync();
        }
        this.permissionDialogs = this.permissionDialogs.filter(
          (pendingDialog) => {
            /* Remove self */
            if (pendingDialog === params) {
              pendingDialog.actionBlock && pendingDialog.actionBlock(approved);
              return false;
            }
            const containsObjectSubset = (
              source: ComponentPermission[],
              target: ComponentPermission[]
            ) => {
              return !target.some(
                (val) =>
                  !source.find(
                    (candidate) =>
                      JSON.stringify(candidate) === JSON.stringify(val)
                  )
              );
            };
            if (pendingDialog.component === component) {
              /* remove pending dialogs that are encapsulated by already approved permissions, and run its function */
              if (
                pendingDialog.permissions === permissions ||
                containsObjectSubset(permissions, pendingDialog.permissions)
              ) {
                /* If approved, run the action block. Otherwise, if canceled, cancel any
              pending ones as well, since the user was explicit in their intentions */
                if (approved) {
                  pendingDialog.actionBlock &&
                    pendingDialog.actionBlock(approved);
                }
                return false;
              }
            }
            return true;
          }
        );
        if (this.permissionDialogs.length > 0) {
          this.presentPermissionsDialog(this.permissionDialogs[0]);
        }
      },
    };
    /**
     * Since these calls are asyncronous, multiple dialogs may be requested at the same time.
     * We only want to present one and trigger all callbacks based on one modal result
     */
    const existingDialog = find(this.permissionDialogs, {
      component: component,
    });
    this.permissionDialogs.push(params);
    if (!existingDialog) {
      this.presentPermissionsDialog(params);
    } else {
      this.log('Existing dialog, not presenting.');
    }
  }

  presentPermissionsDialog(_dialog: PermissionDialog): void {
    throw 'Must override SNComponentManager.presentPermissionsDialog';
  }

  openModalComponent(_component: SNComponent): void {
    throw 'Must override SNComponentManager.presentPermissionsDialog';
  }

  public registerHandler(handler: ComponentHandler): () => void {
    this.handlers.push(handler);
    return () => {
      const matching = find(this.handlers, { identifier: handler.identifier });
      if (!matching) {
        this.log('Attempting to deregister non-existing handler');
        return;
      }
      removeFromArray(this.handlers, matching);
    };
  }

  findOrCreateDataForComponent(componentUuid: UuidString): ComponentState {
    let data = this.componentState[componentUuid];
    if (!data) {
      data = {} as ComponentState;
      this.componentState[componentUuid] = data;
    }
    return data;
  }

  setReadonlyStateForComponent(
    component: SNComponent,
    readonly: boolean,
    lockReadonly = false
  ): void {
    const data = this.findOrCreateDataForComponent(component.uuid);
    data.readonly = readonly;
    data.lockReadonly = lockReadonly;
  }

  getReadonlyStateForComponent(component: SNComponent): ComponentState {
    const data = this.findOrCreateDataForComponent(component.uuid);
    return {
      readonly: data.readonly,
      lockReadonly: data.lockReadonly,
    } as ComponentState;
  }

  /** Called by other views when the iframe is ready */
  public async registerComponentWindow(
    component: SNComponent,
    componentWindow: Window
  ): Promise<void> {
    this.log('Register component window', component);
    const data = this.findOrCreateDataForComponent(component.uuid);
    if (data.window === componentWindow) {
      this.log(
        'Web|componentManager',
        'attempting to re-register same component window.'
      );
    }
    this.log('Web|componentManager|registerComponentWindow', component);
    data.window = componentWindow;
    data.sessionKey = await Uuid.GenerateUuid();
    this.sendMessageToComponent(component, {
      action: ComponentAction.ComponentRegistered,
      sessionKey: data.sessionKey,
      componentData: component.componentData,
      data: {
        uuid: component.uuid,
        environment: environmentToString(this.environment),
        platform: platformToString(this.platform),
        activeThemeUrls: this.urlsForActiveThemes(),
      },
    });
    this.postActiveThemesToComponent(component);
    if (this.desktopManager) {
      this.desktopManager.notifyComponentActivation(component);
    }
  }

  async activateComponent(uuid: UuidString): Promise<void> {
    this.log('Activating component', uuid);
    const component = this.findComponent(uuid);
    if (!component.active) {
      await this.itemManager.changeComponent(component.uuid, (mutator) => {
        mutator.active = true;
      });
    }
  }

  /** Clients should call this function whenever a component iframe is destroyed */
  public onComponentIframeDestroyed(uuid: UuidString): void {
    this.deregisterComponent(uuid);
  }

  /**
   * Deregistering means that our local state for this component will be wiped.
   * No synced data will be affected. This differs from `activating` in that activating
   * will mutate the component to change its synced property .active to true.
   */
  private deregisterComponent(uuid: UuidString) {
    this.log('Degregistering component', uuid);
    delete this.componentState[uuid];
    this.streamObservers = this.streamObservers.filter((o) => {
      return o.componentUuid !== uuid;
    });
    this.contextStreamObservers = this.contextStreamObservers.filter((o) => {
      return o.componentUuid !== uuid;
    });

    const component = this.findComponent(uuid);
    if (component?.area === ComponentArea.Themes) {
      this.postActiveThemesToAllComponents();
    }
  }

  async deactivateComponent(uuid: UuidString): Promise<void> {
    this.log('Deactivating component', uuid);
    const component = this.findComponent(uuid);
    if (component?.active) {
      await this.itemManager.changeComponent(component.uuid, (mutator) => {
        mutator.active = false;
      });
    }
    this.findOrCreateDataForComponent(uuid).sessionKey = undefined;
    this.deregisterComponent(uuid);
  }

  async deleteComponent(uuid: UuidString): Promise<void> {
    await this.itemManager.setItemToBeDeleted(uuid);
    this.syncService.sync();
  }

  isComponentActive(component: SNComponent): boolean {
    return component.active;
  }

  allComponentIframes(): HTMLIFrameElement[] {
    if (this.isMobile) {
      /**
       * Retrieving all iframes is typically related to lifecycle management of
       * non-editor components. So this function is not useful to mobile.
       */
      return [];
    }
    return Array.from(document.getElementsByTagName('iframe'));
  }

  iframeForComponent(uuid: UuidString): HTMLIFrameElement | undefined {
    const iframes = this.allComponentIframes();
    for (const frame of iframes) {
      const componentId = frame.dataset.componentId;
      if (componentId === uuid) {
        return frame;
      }
    }
  }

  handleSetSizeEvent(component: SNComponent, data: MessageData): void {
    const setSize = (element: Element, size: any) => {
      const widthString = isString(size.width) ? size.width : `${data.width}px`;
      const heightString = isString(size.height)
        ? size.height
        : `${data.height}px`;
      if (element) {
        element.setAttribute(
          'style',
          `width:${widthString}; height:${heightString};`
        );
      }
    };
    if (
      component.area === ComponentArea.Rooms ||
      component.area === ComponentArea.Modal
    ) {
      const selector =
        component.area === ComponentArea.Rooms ? 'inner' : 'outer';
      const content = document.getElementById(
        `component-content-${selector}-${component.uuid}`
      );
      if (content) {
        setSize(content, data);
      }
    } else {
      const iframe = this.iframeForComponent(component.uuid);
      if (!iframe) {
        return;
      }
      setSize(iframe, data);
      /**
       * On Firefox, resizing a component iframe does not seem to have an effect with
       * editor-stack extensions. Sizing the parent does the trick, however, we can't do
       * this globally, otherwise, areas like the note-tags will not be able to expand
       * outside of the bounds (to display autocomplete, for example).
       */
      if (component.area === ComponentArea.EditorStack) {
        const parent = iframe.parentElement;
        if (parent) {
          setSize(parent, data);
        }
      }
    }
  }

  editorForNote(note: SNNote): SNComponent | undefined {
    const editors = this.componentsForArea(ComponentArea.Editor);
    for (const editor of editors) {
      if (editor.isExplicitlyEnabledForItem(note.uuid)) {
        return editor;
      }
    }
    let defaultEditor;
    /* No editor found for note. Use default editor, if note does not prefer system editor */
    if (this.isMobile) {
      if (!note.mobilePrefersPlainEditor) {
        defaultEditor = this.getDefaultEditor();
      }
    } else {
      if (!note.prefersPlainEditor) {
        defaultEditor = this.getDefaultEditor();
      }
    }
    if (
      defaultEditor &&
      !defaultEditor.isExplicitlyDisabledForItem(note.uuid)
    ) {
      return defaultEditor;
    } else {
      return undefined;
    }
  }

  getDefaultEditor(): SNComponent {
    const editors = this.componentsForArea(ComponentArea.Editor);
    if (this.isMobile) {
      return editors.filter((e) => {
        return e.isMobileDefault;
      })[0];
    } else {
      return editors.filter((e) => e.isDefaultEditor())[0];
    }
  }

  permissionsStringForPermissions(
    permissions: ComponentPermission[],
    component: SNComponent
  ): string {
    let finalString = '';
    const permissionsCount = permissions.length;
    const addSeparator = (index: number, length: number) => {
      if (index > 0) {
        if (index === length - 1) {
          if (length === 2) {
            return ' and ';
          } else {
            return ', and ';
          }
        } else {
          return ', ';
        }
      }
      return '';
    };
    permissions.forEach((permission, index) => {
      if (permission.name === ComponentAction.StreamItems) {
        const types = permission.content_types!.map((type) => {
          const desc = displayStringForContentType(type);
          if (desc) {
            return desc + 's';
          } else {
            return 'items of type ' + type;
          }
        });
        let typesString = '';
        for (let i = 0; i < types.length; i++) {
          const type = types[i];
          typesString += addSeparator(
            i,
            types.length + permissionsCount - index - 1
          );
          typesString += type;
        }
        finalString += addSeparator(index, permissionsCount);
        finalString += typesString;
        if (types.length >= 2 && index < permissionsCount - 1) {
          /* If you have a list of types, and still an additional root-level
             permission coming up, add a comma */
          finalString += ', ';
        }
      } else if (permission.name === ComponentAction.StreamContextItem) {
        const mapping = {
          [ComponentArea.EditorStack]: 'working note',
          [ComponentArea.NoteTags]: 'working note',
          [ComponentArea.Editor]: 'working note',
        };
        finalString += addSeparator(index, permissionsCount);
        finalString += (mapping as any)[component.area];
      }
    });
    return finalString + '.';
  }
}
