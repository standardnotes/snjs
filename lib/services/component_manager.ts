import { SNNote } from './../models/app/note';
import { SNTheme } from './../models/app/theme';
import { SNItem } from '@Models/core/item';
import { SNAlertService } from './alert_service';
import { SNSyncService } from './sync/sync_service';
import { SNModelManager } from './model_manager';
import find from 'lodash/find';
import uniq from 'lodash/uniq';
import remove from 'lodash/remove';
import { PureService } from '@Lib/services/pure_service';
import {
  CreateSourcedPayloadFromObject,
  PayloadSources
} from '@Payloads/index';
import {
  ContentTypes, displayStringForContentType, CreateItemFromPayload
} from '@Models/index';
import { ComponentAreas, SNComponent } from '@Models/app/component';
import { Uuid } from '@Lib/uuid';
import { Copy, isString, extendArray, removeFromArray } from '@Lib/utils';
import { Platforms, Environments, platformToString, environmentToString } from '@Lib/platforms';

const DESKTOP_URL_PREFIX = 'sn://';
const LOCAL_HOST = 'localhost';
const CUSTOM_LOCAL_HOST = 'sn.local';
const ANDROID_LOCAL_HOST = '10.0.2.2';

export enum ComponentActions {
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
  InstallLocalComponent = 'install-local-component',
  ToggleActivateComponent = 'toggle-activate-component',
  RequestPermissions = 'request-permissions',
  PresentConflictResolution = 'present-conflict-resolution',
  DuplicateItem = 'duplicate-item',
  ComponentRegistered = 'component-registered',
  ActivateThemes = 'themes',
  Reply = 'reply',
  SaveSuccess = 'save-success',
  SaveError = 'save-error'
};

/* This domain will be used to save context item client data */
const ClientDataDomain = 'org.standardnotes.sn.components';

type StreamObserver = {
  identifier: string
  component: SNComponent,
  originalMessage: any,
  /** contentTypes is optional in the case of a context stream observer */
  contentTypes?: ContentTypes[]
}

type ComponentHandler = {
  identifier: string
  areas: ComponentAreas[]
  actionHandler?: any,
  contextRequestHandler?: any,
  componentForSessionKeyHandler?: any
  activationHandler?: any
  focusHandler?: any
}

type PermissionDialog = {
  component: SNComponent
  permissions: any[]
  permissionsString: string
  actionBlock: any
  callback: any
}

type ComponentMessage = {
  action: ComponentActions
  sessionKey?: string
  componentData?: any
  data: any
}

type MessageReplyData = {
  approved?: boolean
  deleted?: boolean
  error?: string
  item?: any
  items?: any[]
  themes?: string[]
}

type MessageReply = {
  action: ComponentActions
  original: ComponentMessage
  data: MessageReplyData
}

type ItemMessagePayload = {
  uuid: string
  content_type: ContentTypes
  created_at: Date
  updated_at: Date
  deleted: boolean
  content: any
  clientData: any
  /** isMetadataUpdate implies that the extension should make reference of updated
  * metadata, but not update content values as they may be stale relative to what the
  * extension currently has. Changes are always metadata updates if the mapping source
  * is PayloadSources.RemoteSaved || source === PayloadSources.LocalSaved. */
  isMetadataUpdate: any
};

type Permission = {
  name: ComponentActions
  content_types?: ContentTypes[]
}

/**
 * Responsible for orchestrating component functionality, including editors, themes,
 * and other components. The component manager primarily deals with iframes, and orchestrates
 * sending and receiving messages to and from frames via the postMessage API.
 */
export class SNComponentManager extends PureService {

  private modelManager?: SNModelManager
  private syncService?: SNSyncService
  private alertService?: SNAlertService
  private environment: Environments
  private platform: Platforms
  private timeout: any
  private desktopManager: any

  private removeMappingObserver?: any
  private streamObservers: StreamObserver[] = [];
  private contextStreamObservers: StreamObserver[] = [];
  private activeComponents: SNComponent[] = [];
  private permissionDialogs: PermissionDialog[] = [];
  private handlers: ComponentHandler[] = [];

  constructor(
    modelManager: SNModelManager,
    syncService: SNSyncService,
    alertService: SNAlertService,
    environment: Environments,
    platform: Platforms,
    timeout: any,
  ) {
    super();
    this.timeout = timeout || setTimeout.bind(window);
    this.modelManager = modelManager;
    this.syncService = syncService;
    this.alertService = alertService;
    this.environment = environment;
    this.platform = platform;
    this.configureForGeneralUsage();
    if (environment !== Environments.Mobile) {
      this.configureForNonMobileUsage();
    }
  }

  get isDesktop() {
    return this.environment === Environments.Desktop;
  }

  get isMobile() {
    return this.environment === Environments.Mobile;
  }

  get components() {
    return this.modelManager!.getItems([
      ContentTypes.Component,
      ContentTypes.Theme
    ]) as SNComponent[];
  }

  componentsForArea(area: ComponentAreas) {
    return this.components.filter((component) => {
      return component.area === area;
    });
  }

  /** @override */
  deinit() {
    super.deinit();
    this.streamObservers.length = 0;
    this.contextStreamObservers.length = 0;
    this.activeComponents.length = 0;
    this.permissionDialogs.length = 0;
    this.handlers.length = 0;
    this.modelManager = undefined;
    this.syncService = undefined;
    this.alertService = undefined;
    this.removeMappingObserver();
    this.removeMappingObserver = null;
    if (window) {
      window.removeEventListener('focus', this.detectFocusChange, true);
      window.removeEventListener('blur', this.detectFocusChange, true);
      window.removeEventListener('message', this.onWindowMessage);
    }
  }

  setDesktopManager(desktopManager: any) {
    this.desktopManager = desktopManager;
    this.configureForDesktop();
  }

  configureForGeneralUsage() {
    this.removeMappingObserver = this.modelManager!.addMappingObserver(
      ContentTypes.Any,
      async (allItems, _, __, source, sourceKey) => {
        const syncedComponents = allItems.filter((item) => {
          return (
            item.content_type === ContentTypes.Component ||
            item.content_type === ContentTypes.Theme);
        }) as SNComponent[];
        /**
         * We only want to sync if the item source is Retrieved, not RemoteSaved to avoid 
         * recursion caused by the component being modified and saved after it is updated.
        */
        if (syncedComponents.length > 0 && source !== PayloadSources.RemoteSaved) {
          /* Ensure any component in our data is installed by the system */
          if (this.isDesktop) {
            this.desktopManager.syncComponentsInstallation(syncedComponents);
          }
        }
        for (const component of syncedComponents) {
          const activeComponent = find(this.activeComponents, { uuid: component.uuid });
          if (component.active && !component.deleted && !activeComponent) {
            await this.activateComponent(component);
          } else if (!component.active && activeComponent) {
            await this.deactivateComponent(component);
          }
        }
        /* LocalChanged is not interesting to send to observers. For local changes,
        we wait until the item is set to dirty before notifying observers, where the mapping
        source would be PayloadSources.LocalDirtied */
        if (source !== PayloadSources.LocalChanged) {
          this.notifyStreamObservers(allItems, source, sourceKey);
        }
      }
    );
  }

  notifyStreamObservers(allItems: SNItem[], source?: PayloadSources, sourceKey?: string) {
    for (const observer of this.streamObservers) {
      if (sourceKey && sourceKey === observer.component.uuid) {
        /* Don't notify source of change, as it is the originator, doesn't need duplicate event. */
        continue;
      }
      const relevantItems = allItems.filter((item) => {
        return observer.contentTypes!.indexOf(item.content_type) !== -1;
      });
      if (relevantItems.length === 0) {
        continue;
      }
      const requiredPermissions: Permission[] = [{
        name: ComponentActions.StreamItems,
        content_types: observer.contentTypes!.sort()
      }];
      this.runWithPermissions(observer.component, requiredPermissions, () => {
        this.sendItemsInReply(observer.component, relevantItems, observer.originalMessage);
      });
    }
    const requiredContextPermissions = [{
      name: ComponentActions.StreamContextItem
    }] as Permission[];
    for (const observer of this.contextStreamObservers) {
      if (sourceKey && sourceKey === observer.component.uuid) {
        /* Don't notify source of change, as it is the originator, doesn't need duplicate event. */
        continue;
      }
      for (const handler of this.handlers) {
        if (
          !handler.areas.includes(observer.component.area) &&
          !handler.areas.includes(ComponentAreas.Any)
        ) {
          continue;
        }
        if (handler.contextRequestHandler) {
          const itemInContext = handler.contextRequestHandler(observer.component);
          if (itemInContext) {
            const matchingItem = find(allItems, { uuid: itemInContext.uuid });
            if (matchingItem) {
              if (matchingItem.deleted) {
                continue;
              }
              this.runWithPermissions(
                observer.component,
                requiredContextPermissions,
                () => {
                  this.sendContextItemInReply(
                    observer.component,
                    matchingItem,
                    observer.originalMessage,
                    source
                  );
                });
            }
          }
        }
      }
    }
  }

  isNativeExtension(component: SNComponent) {
    const nativeUrls = [
      (window as any)._extensions_manager_location,
      (window as any)._batch_manager_location
    ];
    const hostedUrl = component.content.hosted_url;
    const localUrl = component.content.local_url
      && component.content.local_url.replace(DESKTOP_URL_PREFIX, '');
    return nativeUrls.includes(hostedUrl) || nativeUrls.includes(localUrl);
  }

  detectFocusChange = () => {
    for (const component of this.activeComponents) {
      if (document.activeElement === this.iframeForComponent(component)) {
        this.timeout(() => {
          this.focusChangedForComponent(component);
        });
        break;
      }
    }
  };

  onWindowMessage = (event: MessageEvent) => {
    this.log('Web app: received message', event);
    /** Make sure this message is for us */
    if (event.data.sessionKey) {
      this.handleMessage(
        this.componentForSessionKey(event.data.sessionKey)!,
        event.data
      );
    }
  }

  configureForNonMobileUsage() {
    window.addEventListener
      ? window.addEventListener('focus', this.detectFocusChange, true)
      : (window as any).attachEvent('onfocusout', this.detectFocusChange);
    window.addEventListener
      ? window.addEventListener('blur', this.detectFocusChange, true)
      : (window as any).attachEvent('onblur', this.detectFocusChange);

    /* On mobile, events listeners are handled by a respective component */
    window.addEventListener('message', this.onWindowMessage);
  }

  configureForDesktop() {
    this.desktopManager.registerUpdateObserver((component: SNComponent) => {
      /* Reload theme if active */
      if (component.active && component.isTheme()) {
        this.postActiveThemesToAllComponents();
      }
    });
  }

  postActiveThemesToAllComponents() {
    for (const component of this.components) {
      /* Skip over components that are themes themselves,
        or components that are not active, or components that don't have a window */
      if (component.isTheme() || !component.active || !component.window) {
        continue;
      }
      this.postActiveThemesToComponent(component);
    }
  }

  getActiveThemes() {
    return this.componentsForArea(ComponentAreas.Themes).filter((theme) => {
      return theme.active;
    }) as SNTheme[];
  }

  urlsForActiveThemes() {
    const themes = this.getActiveThemes();
    return themes.map((theme) => {
      return this.urlForComponent(theme);
    });
  }

  postActiveThemesToComponent(component: SNComponent) {
    const urls = this.urlsForActiveThemes();
    const data: MessageReplyData = {
      themes: urls
    };
    const message: ComponentMessage = {
      action: ComponentActions.ActivateThemes,
      data: data
    }
    this.sendMessageToComponent(
      component,
      message
    );
  }

  contextItemDidChangeInArea(area: ComponentAreas) {
    for (const handler of this.handlers) {
      if (
        handler.areas.includes(area) === false &&
        !handler.areas.includes(ComponentAreas.Any)
      ) {
        continue;
      }
      const observers = this.contextStreamObservers.filter((observer) => {
        return observer.component.area === area;
      });
      for (const observer of observers) {
        if (handler.contextRequestHandler) {
          const itemInContext = handler.contextRequestHandler(observer.component);
          if (itemInContext) {
            this.sendContextItemInReply(
              observer.component,
              itemInContext,
              observer.originalMessage
            );
          }
        }
      }
    }
  }

  setComponentHidden(component: SNComponent, hidden: boolean) {
    /* A hidden component will not receive messages. However, when a component is unhidden, 
     * we need to send it any items it may have registered streaming for. */
    if (hidden) {
      component.hidden = true;
    } else if (component.hidden) {
      component.hidden = false;
      const contextObserver = find(this.contextStreamObservers, { identifier: component.uuid });
      if (contextObserver) {
        this.handleStreamContextItemMessage(component, contextObserver.originalMessage);
      }
      const streamObserver = find(this.streamObservers, { identifier: component.uuid });
      if (streamObserver) {
        this.handleStreamItemsMessage(component, streamObserver.originalMessage);
      }
    }
  }

  jsonForItem(item: SNItem, component: SNComponent, source?: PayloadSources) {
    const isMetadatUpdate =
      source === PayloadSources.RemoteSaved ||
      source === PayloadSources.LocalSaved;
    const params: ItemMessagePayload = {
      uuid: item.uuid,
      content_type: item.content_type,
      created_at: item.created_at,
      updated_at: item.updated_at,
      deleted: item.deleted,
      isMetadataUpdate: isMetadatUpdate,
      content: item.collapseContent(),
      clientData: item.getDomainDataItem(
        component.getClientDataKey(),
        ClientDataDomain
      ) || {}
    };
    this.removePrivatePropertiesFromResponseItems(
      [params],
      component
    );
    return params;
  }

  sendItemsInReply(
    component: SNComponent,
    items: SNItem[],
    message: ComponentMessage,
    source?: PayloadSources
  ) {
    this.log('Web|componentManager|sendItemsInReply', component, items, message);
    const responseData: MessageReplyData = {};
    const mapped = items.map((item) => {
      return this.jsonForItem(item, component, source);
    });
    responseData.items = mapped;
    this.replyToMessage(component, message, responseData);
  }

  sendContextItemInReply(
    component: SNComponent,
    item: SNItem,
    originalMessage: ComponentMessage,
    source?: PayloadSources
  ) {
    this.log('Web|componentManager|sendContextItemInReply', component, item, originalMessage);
    const response: MessageReplyData = {
      item: this.jsonForItem(item, component, source)
    };
    this.replyToMessage(component, originalMessage, response);
  }

  replyToMessage(
    component: SNComponent,
    originalMessage: ComponentMessage,
    replyData: MessageReplyData
  ) {
    const reply: MessageReply = {
      action: ComponentActions.Reply,
      original: originalMessage,
      data: replyData
    };
    this.sendMessageToComponent(component, reply);
  }

  sendMessageToComponent(component: SNComponent, message: ComponentMessage | MessageReply) {
    const permissibleActionsWhileHidden = [
      ComponentActions.ComponentRegistered,
      ComponentActions.ActivateThemes
    ];
    if (component.hidden && !permissibleActionsWhileHidden.includes(message.action)) {
      this.log('Component disabled for current item, ignoring messages.', component.name);
      return;
    }
    this.log('Web|sendMessageToComponent', component, message);
    let origin = this.urlForComponent(component);
    if (!origin.startsWith('http') && !origin.startsWith('file')) {
      /* Native extension running in web, prefix current host */
      origin = window.location.href + origin;
    }
    if (!component.window) {
      this.alertService!.alert(
        `Standard Notes is trying to communicate with ${component.name}, 
        but an error is occurring. Please restart this extension and try again.`
      );
    }
    /* Mobile messaging requires json */
    component.window!.postMessage(
      this.isMobile ? JSON.stringify(message) : message,
      origin
    );
  }

  urlForComponent(component: SNComponent) {
    /* offlineOnly is available only on desktop, and not on web or mobile. */
    if (component.offlineOnly && !this.isDesktop) {
      return null;
    }
    if (component.offlineOnly || (this.isDesktop && component.local_url)) {
      return component.local_url
        && component.local_url.replace(
          DESKTOP_URL_PREFIX,
          this.desktopManager.getExtServerHost()
        );
    } else {
      let url = component.hosted_url || component.legacy_url;
      if (this.isMobile) {
        const localReplacement = this.platform === Platforms.Ios ? LOCAL_HOST : ANDROID_LOCAL_HOST;
        url = url.replace(LOCAL_HOST, localReplacement).replace(CUSTOM_LOCAL_HOST, localReplacement);
      }
      return url;
    }
  }

  componentForUrl(url: string) {
    return this.components.filter((component) => {
      return component.hosted_url === url || component.legacy_url === url;
    })[0];
  }

  componentForSessionKey(key: string): SNComponent | undefined {
    let component = find(this.components, { sessionKey: key }) as SNComponent;
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

  handleMessage(component: SNComponent, message: ComponentMessage) {
    if (!component) {
      this.log('Component not defined for message, returning', message);
      this.alertService!.alert(
        'An extension is trying to communicate with Standard Notes,' +
        'but there is an error establishing a bridge. Please restart the app and try again.'
      );
      return;
    }
    const readwriteActions = [
      ComponentActions.SaveItems,
      ComponentActions.AssociateItem,
      ComponentActions.DeassociateItem,
      ComponentActions.CreateItem,
      ComponentActions.CreateItems,
      ComponentActions.DeleteItems,
      ComponentActions.SetComponentData
    ];
    if (component.readonly && readwriteActions.includes(message.action)) {
      this.alertService!.alert(
        `The extension ${component.name} is trying to save, but it is in a locked state and cannot accept changes.`
      );
      return;
    }
    if (message.action === ComponentActions.StreamItems) {
      this.handleStreamItemsMessage(component, message);
    } else if (message.action === ComponentActions.StreamContextItem) {
      this.handleStreamContextItemMessage(component, message);
    } else if (message.action === ComponentActions.SetComponentData) {
      this.handleSetComponentDataMessage(component, message);
    } else if (message.action === ComponentActions.DeleteItems) {
      this.handleDeleteItemsMessage(component, message);
    } else if (
      message.action === ComponentActions.CreateItems ||
      message.action === ComponentActions.CreateItem
    ) {
      this.handleCreateItemsMessage(component, message);
    } else if (message.action === ComponentActions.SaveItems) {
      this.handleSaveItemsMessage(component, message);
    } else if (message.action === ComponentActions.ToggleActivateComponent) {
      const componentToToggle = this.modelManager!.findItem(message.data.uuid) as SNComponent;
      this.handleToggleComponentMessage(componentToToggle, message);
    } else if (message.action === ComponentActions.RequestPermissions) {
      this.handleRequestPermissionsMessage(component, message);
    } else if (message.action === ComponentActions.InstallLocalComponent) {
      this.handleInstallLocalComponentMessage(component, message);
    } else if (message.action === ComponentActions.DuplicateItem) {
      this.handleDuplicateItemMessage(component, message);
    }
    for (const handler of this.handlers) {
      if (handler.actionHandler && (
        handler.areas.includes(component.area) ||
        handler.areas.includes(ComponentAreas.Any)
      )) {
        this.timeout(() => {
          handler.actionHandler(component, message.action, message.data);
        });
      }
    }
  }

  removePrivatePropertiesFromResponseItems(
    responseItems: any[],
    component: SNComponent,
    includeUrls = false
  ) {
    if (component) {
      /* System extensions can bypass this step */
      if (this.isNativeExtension(component)) {
        return;
      }
    }
    /* Don't allow component to overwrite these properties. */
    let privateContentProperties = ['autoupdateDisabled', 'permissions', 'active'];
    if (includeUrls) {
      privateContentProperties = privateContentProperties.concat([
        'url', 'hosted_url', 'local_url'
      ]);
    }
    for (const responseItem of responseItems) {
      for (const prop of privateContentProperties) {
        delete responseItem.content[prop];
      }
    }
  }

  handleStreamItemsMessage(component: SNComponent, message: ComponentMessage) {
    const requiredPermissions = [
      {
        name: ComponentActions.StreamItems,
        content_types: message.data.content_types.sort()
      }
    ];
    this.runWithPermissions(component, requiredPermissions, () => {
      if (!find(this.streamObservers, { identifier: component.uuid })) {
        /* For pushing laster as changes come in */
        this.streamObservers.push({
          identifier: component.uuid,
          component: component,
          originalMessage: message,
          contentTypes: message.data.content_types
        });
      }
      /* Push immediately now */
      const items: SNItem[] = [];
      for (const contentType of message.data.content_types) {
        extendArray(
          items,
          items.concat(this.modelManager!.validItemsForContentType(contentType))
        );
      }
      this.sendItemsInReply(component, items, message);
    });
  }

  handleStreamContextItemMessage(component: SNComponent, message: ComponentMessage) {
    const requiredPermissions: Permission[] = [
      {
        name: ComponentActions.StreamContextItem
      }
    ];
    this.runWithPermissions(component, requiredPermissions, () => {
      if (!find(this.contextStreamObservers, { identifier: component.uuid })) {
        this.contextStreamObservers.push({
          identifier: component.uuid,
          component: component,
          originalMessage: message
        });
      }
      for (const handler of this.handlersForArea(component.area)) {
        if (handler.contextRequestHandler) {
          const itemInContext = handler.contextRequestHandler(component);
          if (itemInContext) {
            this.sendContextItemInReply(component, itemInContext, message);
          }
        }
      }
    });
  }

  isItemIdWithinComponentContextJurisdiction(uuid: string, component: SNComponent) {
    const itemIdsInJurisdiction = this.itemIdsInContextJurisdictionForComponent(component);
    return itemIdsInJurisdiction.includes(uuid);
  }

  /* Returns items that given component has context permissions for */
  itemIdsInContextJurisdictionForComponent(component: SNComponent) {
    const itemIds = [];
    for (const handler of this.handlersForArea(component.area)) {
      if (handler.contextRequestHandler) {
        const itemInContext = handler.contextRequestHandler(component);
        if (itemInContext) {
          itemIds.push(itemInContext.uuid);
        }
      }
    }
    return itemIds;
  }

  handlersForArea(area: ComponentAreas) {
    return this.handlers.filter((candidate) => {
      return candidate.areas.includes(area);
    });
  }

  async handleSaveItemsMessage(component: SNComponent, message: ComponentMessage) {
    const responseItems = message.data.items;
    const requiredPermissions = [];
    const itemIdsInContextJurisdiction = this.itemIdsInContextJurisdictionForComponent(component);
    /* Pending as in needed to be accounted for in permissions. */
    const pendingResponseItems = responseItems.slice();
    for (const responseItem of responseItems.slice()) {
      if (itemIdsInContextJurisdiction.includes(responseItem.uuid)) {
        requiredPermissions.push({
          name: ComponentActions.StreamContextItem
        });
        removeFromArray(pendingResponseItems, responseItem);
        /* We break because there can only be one context item */
        break;
      }
    }
    /* Check to see if additional privileges are required */
    if (pendingResponseItems.length > 0) {
      const requiredContentTypes = uniq(pendingResponseItems.map((item: any) => {
        return item.content_type;
      })).sort();
      requiredPermissions.push({
        name: ComponentActions.StreamItems,
        content_types: requiredContentTypes
      } as Permission);
    }
    this.runWithPermissions(component, requiredPermissions, async () => {
      this.removePrivatePropertiesFromResponseItems(
        responseItems,
        component,
        true
      );

      /* Filter locked items */
      const ids = responseItems.map((item: any) => { return item.uuid; });
      const items = this.modelManager!.findItems(ids);
      let lockedCount = 0;
      for (const item of items) {
        if (item.locked) {
          remove(responseItems, { uuid: item.uuid });
          lockedCount++;
        }
      }
      if (lockedCount > 0) {
        const itemNoun = lockedCount === 1 ? 'item' : 'items';
        const auxVerb = lockedCount === 1 ? 'is' : 'are';
        this.alertService!.alert(
          `${lockedCount} ${itemNoun} you are attempting to save ${auxVerb} locked and cannot be edited.`,
          'Items Locked',
        );
      }
      const payloads = responseItems.map((responseItem: any) => {
        return CreateSourcedPayloadFromObject(
          responseItem,
          PayloadSources.ComponentRetrieved
        );
      });
      const localItems = await this.modelManager!.mapPayloadsToLocalItems(
        payloads,
        PayloadSources.ComponentRetrieved,
        component.uuid
      );
      for (const responseItem of responseItems) {
        const item = find(localItems, { uuid: responseItem.uuid });
        if (!item) {
          // An item this extension is trying to save was possibly removed locally, notify user
          this.alertService!.alert(
            `The extension ${component.name} is trying to save an item with type ` +
            `${responseItem.content_type}, but that item does not exist .` +
            `Please restart this extension and try again.`
          );
          continue;
        }
        if (!item.locked) {
          if (responseItem.clientData) {
            item.setDomainDataItem(
              component.getClientDataKey(),
              responseItem.clientData,
              ClientDataDomain
            );
          }
          await this.modelManager!.setItemDirty(
            item,
            true,
            true,
            PayloadSources.ComponentRetrieved,
            component.uuid
          );
        }
      }
      this.syncService!.sync().then(() => {
        /* Allow handlers to be notified when a save begins and ends, to update the UI */
        const saveMessage = Object.assign({}, message);
        saveMessage.action = ComponentActions.SaveSuccess;
        this.replyToMessage(component, message, {});
        this.handleMessage(component, saveMessage);
      }).catch(() => {
        const saveMessage = Object.assign({}, message);
        saveMessage.action = ComponentActions.SaveError;
        this.replyToMessage(component, message, { error: ComponentActions.SaveError });
        this.handleMessage(component, saveMessage);
      });
    });
  }

  handleDuplicateItemMessage(component: SNComponent, message: ComponentMessage) {
    const itemParams = message.data.item;
    const item = this.modelManager!.findItem(itemParams.uuid);
    const requiredPermissions = [
      {
        name: ComponentActions.StreamItems,
        content_types: [item.content_type]
      }
    ];
    this.runWithPermissions(component, requiredPermissions, async () => {
      const duplicate = await this.modelManager!.duplicateItem(item);
      this.syncService!.sync();
      this.replyToMessage(
        component,
        message,
        { item: this.jsonForItem(duplicate, component) }
      );
    });
  }

  handleCreateItemsMessage(component: SNComponent, message: ComponentMessage) {
    const responseItems = message.data.item ? [message.data.item] : message.data.items;
    const uniqueContentTypes = uniq(
      responseItems.map((item: any) => { return item.content_type; })
    ) as ContentTypes[];
    const requiredPermissions: Permission[] = [
      {
        name: ComponentActions.StreamItems,
        content_types: uniqueContentTypes
      }
    ];
    this.runWithPermissions(component, requiredPermissions, async () => {
      this.removePrivatePropertiesFromResponseItems(responseItems, component);
      const processedItems = [];
      for (const responseItem of responseItems) {
        const payload = CreateSourcedPayloadFromObject(
          responseItem,
          PayloadSources.RemoteRetrieved
        );
        const item = CreateItemFromPayload(payload);
        if (responseItem.clientData) {
          item.setDomainDataItem(
            component.getClientDataKey(),
            responseItem.clientData,
            ClientDataDomain
          );
        }
        this.modelManager!.addItem(item);
        await this.modelManager!.resolveReferencesForItem(item, true);
        await this.modelManager!.setItemDirty(item, true);
        processedItems.push(item);
      }
      this.syncService!.sync();
      const reply = message.action === ComponentActions.CreateItem
        ? { item: this.jsonForItem(processedItems[0], component) }
        : { items: processedItems.map((item) => { return this.jsonForItem(item, component); }) };
      this.replyToMessage(component, message, reply);
    });
  }

  handleDeleteItemsMessage(component: SNComponent, message: ComponentMessage) {
    const requiredContentTypes = uniq(
      message.data.items.map((item: any) => { return item.content_type; })
    ).sort() as ContentTypes[];
    const requiredPermissions: Permission[] = [
      {
        name: ComponentActions.StreamItems,
        content_types: requiredContentTypes
      }
    ];
    this.runWithPermissions(component, requiredPermissions, async () => {
      const itemsData = message.data.items;
      const noun = itemsData.length === 1 ? 'item' : 'items';
      let reply = null;
      let didConfirm = true;
      await this.alertService!.confirm(
        `Are you sure you want to delete ${itemsData.length} ${noun}?`
      ).catch(() => {
        didConfirm = false;
      });
      if (didConfirm) {
        /* Filter for any components and deactivate before deleting */
        for (const itemData of itemsData) {
          const model = this.modelManager!.findItem(itemData.uuid);
          if (!model) {
            this.alertService!.alert('The item you are trying to delete cannot be found.');
            continue;
          }
          if ([ContentTypes.Component, ContentTypes.Theme].includes(model.content_type)) {
            await this.deactivateComponent(model as SNComponent, true);
          }
          await this.modelManager!.setItemToBeDeleted(model);
          /* Currently extensions are not notified of association until a full server sync completes.
             We manually notify observers. */
          this.modelManager!.notifyMappingObservers([model], PayloadSources.RemoteSaved);
        }
        this.syncService!.sync();
        reply = { deleted: true };
      } else {
        /* Rejected by user */
        reply = { deleted: false };
      }
      this.replyToMessage(component, message, reply);
    });
  }

  handleRequestPermissionsMessage(component: SNComponent, message: ComponentMessage) {
    this.runWithPermissions(component, message.data.permissions, () => {
      this.replyToMessage(component, message, { approved: true });
    });
  }

  handleSetComponentDataMessage(component: SNComponent, message: ComponentMessage) {
    /* A component setting its own data does not require special permissions */
    this.runWithPermissions(component, [], async () => {
      component.componentData = message.data.componentData;
      await this.modelManager!.setItemDirty(component, true);
      this.syncService!.sync();
    });
  }

  handleToggleComponentMessage(targetComponent: SNComponent, message: ComponentMessage) {
    this.toggleComponent(targetComponent);
  }

  async toggleComponent(component: SNComponent) {
    if (component.area === ComponentAreas.Modal) {
      this.openModalComponent(component);
    } else {
      if (component.active) {
        await this.deactivateComponent(component);
      } else {
        if (component.content_type === ContentTypes.Theme) {
          const theme = component as SNTheme;
          /* Deactive currently active theme if new theme is not layerable */
          const activeThemes = this.getActiveThemes();
          /* Activate current before deactivating others, so as not to flicker */
          await this.activateComponent(component);
          if (!theme.isLayerable()) {
            setTimeout(async () => {
              for (const candidate of activeThemes) {
                if (candidate && !candidate.isLayerable()) {
                  await this.deactivateComponent(candidate);
                }
              }
            }, 10);
          }
        } else {
          await this.activateComponent(component);
        }
      }
    }
  }

  handleInstallLocalComponentMessage(
    sourceComponent: SNComponent,
    message: ComponentMessage
  ) {
    /* Only native extensions have this permission */
    if (!this.isNativeExtension(sourceComponent)) {
      return;
    }
    const targetComponent = this.modelManager!.findItem(message.data.uuid);
    this.desktopManager.installComponent(targetComponent);
  }

  runWithPermissions(
    component: SNComponent,
    requiredPermissions: Permission[],
    runFunction: () => void
  ) {
    if (!component.permissions) {
      component.permissions = [];
    }
    /* Make copy as not to mutate input values */
    requiredPermissions = Copy(requiredPermissions) as Permission[];
    const acquiredPermissions = component.permissions;
    for (const required of requiredPermissions.slice()) {
      /* Remove anything we already have */
      const respectiveAcquired = acquiredPermissions.find((candidate) => candidate.name === required.name);
      if (!respectiveAcquired) {
        continue;
      }
      /* We now match on name, lets substract from required.content_types anything we have in acquired. */
      const requiredContentTypes = required.content_types;
      if (!requiredContentTypes) {
        /* If this permission does not require any content types (i.e stream-context-item)
          then we can remove this from required since we match by name (respectiveAcquired.name === required.name) */
        removeFromArray(requiredPermissions, required);
        continue;
      }
      for (const acquiredContentType of respectiveAcquired.content_types) {
        removeFromArray(requiredContentTypes, acquiredContentType);
      }
      if (requiredContentTypes.length === 0) {
        /* We've removed all acquired and end up with zero, means we already have all these permissions */
        removeFromArray(requiredPermissions, required);
      }
    }
    if (requiredPermissions.length > 0) {
      this.promptForPermissions(component, requiredPermissions, async (approved) => {
        if (approved) {
          runFunction();
        }
      });
    } else {
      runFunction();
    }
  }

  promptForPermissions(
    component: SNComponent,
    permissions: Permission[],
    callback: (approved: boolean) => Promise<void>
  ) {
    const params: PermissionDialog = {
      component: component,
      permissions: permissions,
      permissionsString: this.permissionsStringForPermissions(permissions, component),
      actionBlock: callback,
      callback: async (approved: boolean) => {
        if (approved) {
          for (const permission of permissions) {
            const matchingPermission = component.permissions
              .find((candidate) => candidate.name === permission.name);
            if (!matchingPermission) {
              component.permissions.push(permission);
            } else {
              /* Permission already exists, but content_types may have been expanded */
              const contentTypes = matchingPermission.content_types || [];
              matchingPermission.content_types = uniq(contentTypes.concat(permission.content_types));
            }
          }
          await this.modelManager!.setItemDirty(component, true);
          this.syncService!.sync();
        }
        this.permissionDialogs = this.permissionDialogs.filter((pendingDialog) => {
          /* Remove self */
          if (pendingDialog === params) {
            pendingDialog.actionBlock && pendingDialog.actionBlock(approved);
            return false;
          }
          const containsObjectSubset = (
            source: Permission[],
            target: Permission[]
          ) => {
            return !target.some(
              val => !source.find((candidate) => JSON.stringify(candidate) === JSON.stringify(val))
            );
          };
          if (pendingDialog.component === component) {
            /* remove pending dialogs that are encapsulated by already approved permissions, and run its function */
            if (pendingDialog.permissions === permissions || containsObjectSubset(
              permissions,
              pendingDialog.permissions
            )) {
              /* If approved, run the action block. Otherwise, if canceled, cancel any 
              pending ones as well, since the user was explicit in their intentions */
              if (approved) {
                pendingDialog.actionBlock && pendingDialog.actionBlock(approved);
              }
              return false;
            }
          }
          return true;
        });
        if (this.permissionDialogs.length > 0) {
          this.presentPermissionsDialog(this.permissionDialogs[0]);
        }
      }

    };
    /** 
     * Since these calls are asyncronous, multiple dialogs may be requested at the same time. 
     * We only want to present one and trigger all callbacks based on one modal result
     */
    const existingDialog = find(this.permissionDialogs, { component: component });
    this.permissionDialogs.push(params);
    if (!existingDialog) {
      this.presentPermissionsDialog(params);
    } else {
      this.log('Existing dialog, not presenting.');
    }
  }

  presentPermissionsDialog(dialog: PermissionDialog) {
    throw 'Must override SNComponentManager.presentPermissionsDialog';
  }

  openModalComponent(component: SNComponent) {
    throw 'Must override SNComponentManager.presentPermissionsDialog';
  }

  public registerHandler(handler: ComponentHandler) {
    this.handlers.push(handler);
    return () => {
      const matching = find(
        this.handlers,
        { identifier: handler.identifier }
      );
      if (!matching) {
        this.log('Attempting to deregister non-existing handler');
        return;
      }
      removeFromArray(this.handlers, matching);
    };
  }

  /** Called by other views when the iframe is ready */
  async registerComponentWindow(component: SNComponent, componentWindow: Window) {
    if (component.window === componentWindow) {
      this.log('Web|componentManager', 'attempting to re-register same component window.');
    }
    this.log('Web|componentManager|registerComponentWindow', component);
    component.window = componentWindow;
    component.sessionKey = await Uuid.GenerateUuid();
    this.sendMessageToComponent(component, {
      action: ComponentActions.ComponentRegistered,
      sessionKey: component.sessionKey,
      componentData: component.componentData,
      data: {
        uuid: component.uuid,
        environment: environmentToString(this.environment),
        platform: platformToString(this.platform),
        activeThemeUrls: this.urlsForActiveThemes()
      }
    });
    this.postActiveThemesToComponent(component);
    if (this.desktopManager) {
      this.desktopManager.notifyComponentActivation(component);
    }
  }

  async activateComponent(component: SNComponent, dontSync = false) {
    const didChange = component.active !== true;
    component.active = true;
    if (!this.activeComponents.includes(component)) {
      this.activeComponents.push(component);
    }
    for (const handler of this.handlers) {
      if (
        handler.areas.includes(component.area) ||
        handler.areas.includes(ComponentAreas.Any)
      ) {
        handler.activationHandler && handler.activationHandler(component);
      }
    }
    if (didChange && !dontSync) {
      await this.modelManager!.setItemDirty(component, true);
      this.syncService!.sync();
    }
    if (component.area === ComponentAreas.Themes) {
      this.postActiveThemesToAllComponents();
    }
  }

  async deactivateComponent(component: SNComponent, dontSync = false) {
    const didChange = component.active !== false;
    component.active = false;
    component.sessionKey = undefined;
    removeFromArray(this.activeComponents, component);
    for (const handler of this.handlers) {
      if (
        handler.areas.includes(component.area) ||
        handler.areas.includes(ComponentAreas.Any)
      ) {
        handler.activationHandler && handler.activationHandler(component);
      }
    }
    if (didChange && !dontSync) {
      await this.modelManager!.setItemDirty(component, true);
      this.syncService!.sync();
    }
    this.streamObservers = this.streamObservers.filter((o) => {
      return o.component !== component;
    });
    this.contextStreamObservers = this.contextStreamObservers.filter((o) => {
      return o.component !== component;
    });
    if (component.area === ComponentAreas.Themes) {
      this.postActiveThemesToAllComponents();
    }
  }

  async reloadComponent(component: SNComponent) {
    /* Do soft deactivate */
    component.active = false;
    for (const handler of this.handlers) {
      if (
        handler.areas.includes(component.area) ||
        handler.areas.includes(ComponentAreas.Any)
      ) {
        handler.activationHandler && handler.activationHandler(component);
      }
    }
    this.streamObservers = this.streamObservers.filter((o) => {
      return o.component !== component;
    });
    this.contextStreamObservers = this.contextStreamObservers.filter((o) => {
      return o.component !== component;
    });
    if (component.area === ComponentAreas.Themes) {
      this.postActiveThemesToAllComponents();
    }
    /* Do soft activate */
    return new Promise((resolve, reject) => {
      this.timeout(() => {
        component.active = true;
        for (const handler of this.handlers) {
          if (
            handler.areas.includes(component.area) ||
            handler.areas.includes(ComponentAreas.Any)
          ) {
            handler.activationHandler && handler.activationHandler(component);
            resolve();
          }
        }
        if (!this.activeComponents.includes(component)) {
          this.activeComponents.push(component);
        }
        if (component.area === ComponentAreas.Themes) {
          this.postActiveThemesToAllComponents();
        }
        /* Resolve again in case first resolve in for loop isn't reached.
          Should be no effect if resolved twice, only first will be used. */
        resolve();
      });
    });
  }

  async deleteComponent(component: SNComponent) {
    await this.modelManager!.setItemToBeDeleted(component);
    this.syncService!.sync();
  }

  isComponentActive(component: SNComponent) {
    return component.active;
  }

  iframeForComponent(component: SNComponent) {
    for (const frame of Array.from(document.getElementsByTagName('iframe'))) {
      const componentId = frame.dataset.componentId;
      if (componentId === component.uuid) {
        return frame;
      }
    }
  }

  focusChangedForComponent(component: SNComponent) {
    const focused = document.activeElement === this.iframeForComponent(component);
    for (const handler of this.handlers) {
      /* Notify all handlers, and not just ones that match this component type */
      handler.focusHandler && handler.focusHandler(component, focused);
    }
  }

  handleSetSizeEvent(component: SNComponent, data: any) {
    const setSize = (element: Element, size: any) => {
      const widthString = isString(size.width) ? size.width : `${data.width}px`;
      const heightString = isString(size.height) ? size.height : `${data.height}px`;
      if (element) {
        element.setAttribute('style', `width:${widthString}; height:${heightString};`);
      }
    };
    if (component.area === ComponentAreas.Rooms || component.area === ComponentAreas.Modal) {
      const selector = component.area === ComponentAreas.Rooms ? 'inner' : 'outer';
      const content = document.getElementById(`component-content-${selector}-${component.uuid}`);
      if (content) {
        setSize(content, data);
      }
    } else {
      const iframe = this.iframeForComponent(component);
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
      if (component.area === ComponentAreas.EditorStack) {
        const parent = iframe.parentElement;
        if (parent) {
          setSize(parent, data);
        }
      }
    }
  }

  editorForNote(note: SNNote) {
    const editors = this.componentsForArea(ComponentAreas.Editor);
    for (const editor of editors) {
      if (editor.isExplicitlyEnabledForItem(note)) {
        return editor;
      }
    }
    /* No editor found for note. Use default editor, if note does not prefer system editor */
    if (this.isMobile) {
      if (!note.content.mobilePrefersPlainEditor) {
        return this.getDefaultEditor();
      }
    } else {
      if (!note.getAppDataItem('prefersPlainEditor')) {
        return editors.filter((e) => { return e.isDefaultEditor(); })[0];
      }
    }
  }

  getDefaultEditor(): SNComponent {
    throw 'Must override'
  }

  permissionsStringForPermissions(permissions: Permission[], component: SNComponent) {
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
      if (permission.name === ComponentActions.StreamItems) {
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
          typesString += addSeparator(i, types.length + permissionsCount - index - 1);
          typesString += type;
        }
        finalString += addSeparator(index, permissionsCount);
        finalString += typesString;
        if (types.length >= 2 && index < permissionsCount - 1) {
          /* If you have a list of types, and still an additional root-level 
             permission coming up, add a comma */
          finalString += ', ';
        }
      } else if (permission.name === ComponentActions.StreamContextItem) {
        const mapping = {
          [ComponentAreas.EditorStack]: 'working note',
          [ComponentAreas.NoteTags]: 'working note',
          [ComponentAreas.Editor]: 'working note'
        };
        finalString += addSeparator(index, permissionsCount);
        finalString += (mapping as any)[component.area];
      }
    });
    return finalString + '.';
  }
}
