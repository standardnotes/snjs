import find from 'lodash/find';
import pull from 'lodash/pull';
import uniq from 'lodash/uniq';
import remove from 'lodash/remove';
import { PureService } from '@Lib/services/pure_service';
import {
  CreateMaxPayloadFromAnyObject,
  CreateSourcedPayloadFromObject,
  PayloadSources
} from '@Payloads';
import {
  ContentTypes, displayStringForContentType, CreateItemFromPayload
} from '@Models';
import { Uuid } from '@Lib/uuid';
import { Environments } from '../platforms';

const DESKTOP_URL_PREFIX = 'sn://';

export class SNComponentManager extends PureService {
  constructor({
    modelManager,
    syncService,
    alertService,
    timeout,
    environment,
    platform
  }) {
    super();
    /* This domain will be used to save context item client data */
    SNComponentManager.ClientDataDomain = "org.standardnotes.sn.components";

    this.timeout = timeout || setTimeout.bind(window);
    this.modelManager = modelManager;
    this.syncService = syncService;
    this.alertService = alertService;
    this.environment = environment;
    this.platform = platform;
    this.isDesktop = this.environment === Environments.Desktop;
    this.isMobile = this.environment === Environments.Mobile;
    this.streamObservers = [];
    this.contextStreamObservers = [];
    this.activeComponents = [];
    this.permissionDialogs = [];
    this.handlers = [];

    this.configureForGeneralUsage();
    if (environment !== Environments.Mobile) {
      this.configureForNonMobileUsage();
    }
  }

  setDesktopManager(desktopManager) {
    this.desktopManager = desktopManager;
    this.configureForDesktop();
  }

  configureForGeneralUsage() {
    this.modelManager.addMappingObserver("*", async (allItems, validItems, deletedItems, source, sourceKey) => {
      const syncedComponents = allItems.filter((item) => {
        return item.content_type === ContentTypes.Component || item.content_type === ContentTypes.Theme;
      });

      /* We only want to sync if the item source is Retrieved, not PayloadSourceRemoteSaved to avoid
        recursion caused by the component being modified and saved after it is updated.
      */
      if (syncedComponents.length > 0 && source !== PayloadSources.RemoteSaved) {
        // Ensure any component in our data is installed by the system
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

      for (const observer of this.streamObservers) {
        if (sourceKey && sourceKey === observer.component.uuid) {
          // Don't notify source of change, as it is the originator, doesn't need duplicate event.
          continue;
        }

        const relevantItems = allItems.filter((item) => {
          return observer.contentTypes.indexOf(item.content_type) !== -1;
        });

        if (relevantItems.length === 0) {
          continue;
        }

        const requiredPermissions = [{
          name: "stream-items",
          content_types: observer.contentTypes.sort()
        }];

        this.runWithPermissions(observer.component, requiredPermissions, () => {
          this.sendItemsInReply(observer.component, relevantItems, observer.originalMessage);
        });
      }

      const requiredContextPermissions = [{
        name: "stream-context-item"
      }];

      for (const observer of this.contextStreamObservers) {
        if (sourceKey && sourceKey === observer.component.uuid) {
          // Don't notify source of change, as it is the originator, doesn't need duplicate event.
          continue;
        }

        for (const handler of this.handlers) {
          if (!handler.areas.includes(observer.component.area) && !handler.areas.includes("*")) {
            continue;
          }
          if (handler.contextRequestHandler) {
            const itemInContext = handler.contextRequestHandler(observer.component);
            if (itemInContext) {
              const matchingItem = find(allItems, { uuid: itemInContext.uuid });
              if (matchingItem) {
                this.runWithPermissions(observer.component, requiredContextPermissions, () => {
                  this.sendContextItemInReply(observer.component, matchingItem, observer.originalMessage, source);
                });
              }
            }
          }
        }
      }
    });
  }

  isNativeExtension(component) {
    const nativeUrls = [
      window._extensions_manager_location,
      window._batch_manager_location
    ];
    const hostedUrl = component.content.hosted_url;
    const localUrl = component.content.local_url 
      && component.content.local_url.replace(DESKTOP_URL_PREFIX, '');
    return nativeUrls.includes(hostedUrl) || nativeUrls.includes(localUrl);
  }

  /** @override */
  async deinit() {
    super.deinit();
    if (window) {
      window.removeEventListener('focus', this.detectFocusChange, true);
      window.removeEventListener('blur', this.detectFocusChange, true);
      window.removeEventListener('message', this.onWindowMessage);
    }
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

  onWindowMessage = (event) => {
    this.log('Web app: received message', event);
    /* Make sure this message is for us */
    if (event.data.sessionKey) {
      this.handleMessage(
        this.componentForSessionKey(event.data.sessionKey),
        event.data
      );
    }
  }

  configureForNonMobileUsage() {
    window.addEventListener
      ? window.addEventListener('focus', this.detectFocusChange, true)
      : window.attachEvent('onfocusout', this.detectFocusChange);
    window.addEventListener
      ? window.addEventListener('blur', this.detectFocusChange, true)
      : window.attachEvent('onblur', this.detectFocusChange);

    /* On mobile, events listeners are handled by a respective component */
    window.addEventListener('message', this.onWindowMessage);
  }

  configureForDesktop() {
    this.desktopManager.registerUpdateObserver((component) => {
      // Reload theme if active
      if (component.active && component.isTheme()) {
        this.postActiveThemesToAllComponents();
      }
    });
  }

  postActiveThemesToAllComponents() {
    for (const component of this.components) {
      // Skip over components that are themes themselves,
      // or components that are not active, or components that don't have a window
      if (component.isTheme() || !component.active || !component.window) {
        continue;
      }

      this.postActiveThemesToComponent(component);
    }
  }

  getActiveThemes() {
    return this.componentsForArea("themes").filter((theme) => {
      return theme.active;
    });
  }

  urlsForActiveThemes() {
    const themes = this.getActiveThemes();
    return themes.map((theme) => {
      return this.urlForComponent(theme);
    });
  }

  postActiveThemesToComponent(component) {
    const urls = this.urlsForActiveThemes();
    const data = { themes: urls };

    this.sendMessageToComponent(component, { action: "themes", data: data });
  }

  contextItemDidChangeInArea(area) {
    for (const handler of this.handlers) {
      if (handler.areas.includes(area) === false && !handler.areas.includes("*")) {
        continue;
      }
      const observers = this.contextStreamObservers.filter((observer) => {
        return observer.component.area === area;
      });

      for (const observer of observers) {
        if (handler.contextRequestHandler) {
          const itemInContext = handler.contextRequestHandler(observer.component);
          if (itemInContext) {
            this.sendContextItemInReply(observer.component, itemInContext, observer.originalMessage);
          }
        }
      }
    }
  }

  setComponentHidden(component, hidden) {
    /*
      A hidden component will not receive messages.
      However, when a component is unhidden, we need to send it any items it may have
      registered streaming for.
    */
    if (hidden) {
      component.hidden = true;
    } else if (component.hidden) {
      // Only enter this condition if component is hidden to make this note have double side effects.
      component.hidden = false;

      // streamContextItem
      const contextObserver = find(this.contextStreamObservers, { identifier: component.uuid });
      if (contextObserver) {
        this.handleStreamContextItemMessage(component, contextObserver.originalMessage);
      }

      // streamItems
      const streamObserver = find(this.streamObservers, { identifier: component.uuid });
      if (streamObserver) {
        this.handleStreamItemsMessage(component, streamObserver.originalMessage);
      }
    }
  }

  jsonForItem(item, component, source) {
    const params = { uuid: item.uuid, content_type: item.content_type, created_at: item.created_at, updated_at: item.updated_at, deleted: item.deleted };
    params.content = item.collapseContent();
    params.clientData = item.getDomainDataItem(component.getClientDataKey(), SNComponentManager.ClientDataDomain) || {};

    // isMetadataUpdate implies that the extension should make reference of updated metadata,
    // but not update content values as they may be stale relative to what the extension currently has
    // Changes are always metadata updates if the mapping source is PayloadSources.RemoteSaved || source === PayloadSources.LocalSaved.
    //
    if (source && (source === PayloadSources.RemoteSaved || source === PayloadSources.LocalSaved)) {
      params.isMetadataUpdate = true;
    }

    this.removePrivatePropertiesFromResponseItems([params], component, { type: "outgoing" });
    return params;
  }

  sendItemsInReply(component, items, message, source) {
    this.log("Web|componentManager|sendItemsInReply", component, items, message);
    const response = { items: {} };
    const mapped = items.map((item) => {
      return this.jsonForItem(item, component, source);
    });

    response.items = mapped;
    this.replyToMessage(component, message, response);
  }

  sendContextItemInReply(component, item, originalMessage, source) {
    this.log("Web|componentManager|sendContextItemInReply", component, item, originalMessage);
    const response = { item: this.jsonForItem(item, component, source) };
    this.replyToMessage(component, originalMessage, response);
  }

  replyToMessage(component, originalMessage, replyData) {
    const reply = {
      action: "reply",
      original: originalMessage,
      data: replyData
    };

    this.sendMessageToComponent(component, reply);
  }

  sendMessageToComponent(component, message) {
    const permissibleActionsWhileHidden = ["component-registered", "themes"];
    if (component.hidden && !permissibleActionsWhileHidden.includes(message.action)) {
      this.log("Component disabled for current item, not sending any messages.", component.name);
      return;
    }

    this.log("Web|sendMessageToComponent", component, message);

    let origin = this.urlForComponent(component);
    if (!origin.startsWith("http") && !origin.startsWith("file")) {
      // Native extension running in web, prefix current host
      origin = window.location.href + origin;
    }

    if (!component.window) {
      this.alertService.alert({
        text: `Standard Notes is trying to communicate with ${component.name}, but an error is occurring. Please restart this extension and try again.`
      });
    }

    // Mobile messaging requires json
    if (this.isMobile) {
      message = JSON.stringify(message);
    }

    component.window.postMessage(message, origin);
  }

  get components() {
    return this.modelManager.getItems([
      ContentTypes.Component,
      ContentTypes.Theme
    ]);
  }

  componentsForArea(area) {
    return this.components.filter((component) => {
      return component.area === area;
    });
  }

  urlForComponent(component) {
    // offlineOnly is available only on desktop, and not on web or mobile.
    if (component.offlineOnly && !this.isDesktop) {
      return null;
    }

    if (component.offlineOnly || (this.isDesktop && component.local_url)) {
      return component.local_url 
        && component.local_url.replace(DESKTOP_URL_PREFIX, this.desktopManager.getExtServerHost());
    } else {
      let url = component.hosted_url || component.legacy_url;
      if (this.isMobile) {
        const localReplacement = this.platform === "ios" ? "localhost" : "10.0.2.2";
        url = url.replace("localhost", localReplacement).replace("sn.local", localReplacement);
      }
      return url;
    }
  }

  componentForUrl(url) {
    return this.components.filter((component) => {
      return component.hosted_url === url || component.legacy_url === url;
    })[0];
  }

  componentForSessionKey(key) {
    let component = find(this.components, { sessionKey: key });
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

  handleMessage(component, message) {
    if (!component) {
      this.log("Component not defined for message, returning", message);
      this.alertService.alert({ text: "An extension is trying to communicate with Standard Notes, but there is an error establishing a bridge. Please restart the app and try again." });
      return;
    }

    // Actions that won't succeeed with readonly mode
    const readwriteActions = [
      "save-items",
      "associate-item",
      "deassociate-item",
      "create-item",
      "create-items",
      "delete-items",
      "set-component-data"
    ];

    if (component.readonly && readwriteActions.includes(message.action)) {
      // A component can be marked readonly if changes should not be saved.
      // Particullary used for revision preview windows where the notes should not be savable.
      this.alertService.alert({ text: `The extension ${component.name} is trying to save, but it is in a locked state and cannot accept changes.` });
      return;
    }

    /**
    Possible Messages:
      set-size
      stream-items
      stream-context-item
      save-items
      select-item
      associate-item
      deassociate-item
      clear-selection
      create-item
      create-items
      delete-items
      set-component-data
      install-local-component
      toggle-activate-component
      request-permissions
      present-conflict-resolution
    */

    if (message.action === "stream-items") {
      this.handleStreamItemsMessage(component, message);
    } else if (message.action === "stream-context-item") {
      this.handleStreamContextItemMessage(component, message);
    } else if (message.action === "set-component-data") {
      this.handleSetComponentDataMessage(component, message);
    } else if (message.action === "delete-items") {
      this.handleDeleteItemsMessage(component, message);
    } else if (message.action === "create-items" || message.action === "create-item") {
      this.handleCreateItemsMessage(component, message);
    } else if (message.action === "save-items") {
      this.handleSaveItemsMessage(component, message);
    } else if (message.action === "toggle-activate-component") {
      const componentToToggle = this.modelManager.findItem(message.data.uuid);
      this.handleToggleComponentMessage(component, componentToToggle, message);
    } else if (message.action === "request-permissions") {
      this.handleRequestPermissionsMessage(component, message);
    } else if (message.action === "install-local-component") {
      this.handleInstallLocalComponentMessage(component, message);
    } else if (message.action === "duplicate-item") {
      this.handleDuplicateItemMessage(component, message);
    }

    // Notify observers
    for (const handler of this.handlers) {
      if (handler.actionHandler && (handler.areas.includes(component.area) || handler.areas.includes("*"))) {
        this.timeout(() => {
          handler.actionHandler(component, message.action, message.data);
        });
      }
    }
  }

  removePrivatePropertiesFromResponseItems(responseItems, component, options = {}) {
    // can be 'incoming' or 'outgoing'. We want to remove updated_at if incoming, but keep it if outgoing
    if (options.type === "incoming") {
      const privateTopLevelProperties = ["updated_at"];
      // Maintaining our own updated_at value is imperative for sync to work properly, we ignore any incoming value.
      for (const responseItem of responseItems) {
        if (responseItem.isItem) {
          console.error("Attempting to pass object. Use JSON.");
          continue;
        }
        for (const privateProperty of privateTopLevelProperties) {
          delete responseItem[privateProperty];
        }
      }
    }

    if (component) {
      // System extensions can bypass this step
      if (this.isNativeExtension(component)) {
        return;
      }
    }
    // Don't allow component to overwrite these properties.
    let privateContentProperties = ["autoupdateDisabled", "permissions", "active"];
    if (options) {
      if (options.includeUrls) {
        privateContentProperties = privateContentProperties.concat(["url", "hosted_url", "local_url"]);
      }
    }
    for (const responseItem of responseItems) {
      // Do not pass in actual items here, otherwise that would be destructive.
      // Instead, generic JS/JSON objects should be passed.
      if (responseItem.isItem) {
        console.error("Attempting to pass object. Use JSON.");
        continue;
      }

      for (const prop of privateContentProperties) {
        delete responseItem.content[prop];
      }
    }
  }

  handleStreamItemsMessage(component, message) {
    const requiredPermissions = [
      {
        name: "stream-items",
        content_types: message.data.content_types.sort()
      }
    ];

    this.runWithPermissions(component, requiredPermissions, () => {
      if (!find(this.streamObservers, { identifier: component.uuid })) {
        // for pushing laster as changes come in
        this.streamObservers.push({
          identifier: component.uuid,
          component: component,
          originalMessage: message,
          contentTypes: message.data.content_types
        });
      }

      // push immediately now
      let items = [];
      for (const contentType of message.data.content_types) {
        items = items.concat(this.modelManager.validItemsForContentType(contentType));
      }
      this.sendItemsInReply(component, items, message);
    });
  }

  handleStreamContextItemMessage(component, message) {

    const requiredPermissions = [
      {
        name: "stream-context-item"
      }
    ];

    this.runWithPermissions(component, requiredPermissions, () => {
      if (!find(this.contextStreamObservers, { identifier: component.uuid })) {
        // for pushing laster as changes come in
        this.contextStreamObservers.push({
          identifier: component.uuid,
          component: component,
          originalMessage: message
        });
      }

      // push immediately now
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

  isItemIdWithinComponentContextJurisdiction(uuid, component) {
    const itemIdsInJurisdiction = this.itemIdsInContextJurisdictionForComponent(component);
    return itemIdsInJurisdiction.includes(uuid);
  }

  /* Returns items that given component has context permissions for */
  itemIdsInContextJurisdictionForComponent(component) {
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

  handlersForArea(area) {
    return this.handlers.filter((candidate) => {
      return candidate.areas.includes(area);
    });
  }

  async handleSaveItemsMessage(component, message) {
    const responseItems = message.data.items;
    const requiredPermissions = [];

    const itemIdsInContextJurisdiction = this.itemIdsInContextJurisdictionForComponent(component);

    // Pending as in needed to be accounted for in permissions.
    const pendingResponseItems = responseItems.slice();

    for (const responseItem of responseItems.slice()) {
      if (itemIdsInContextJurisdiction.includes(responseItem.uuid)) {
        requiredPermissions.push({
          name: "stream-context-item"
        });
        pull(pendingResponseItems, responseItem);
        // We break because there can only be one context item
        break;
      }
    }

    // Check to see if additional privileges are required
    if (pendingResponseItems.length > 0) {
      const requiredContentTypes = uniq(pendingResponseItems.map((i) => { return i.content_type; })).sort();
      requiredPermissions.push({
        name: "stream-items",
        content_types: requiredContentTypes
      });
    }

    this.runWithPermissions(component, requiredPermissions, async () => {

      this.removePrivatePropertiesFromResponseItems(
        responseItems,
        component,
        { includeUrls: true, type: "incoming" }
      );

      /*
      We map the items here because modelManager is what updates the UI. If you were to instead get the items directly,
      this would update them server side via sync, but would never make its way back to the UI.
      */

      // Filter locked items
      const ids = responseItems.map((i) => { return i.uuid; });
      const items = this.modelManager.findItems(ids);
      let lockedCount = 0;
      for (const item of items) {
        if (item.locked) {
          remove(responseItems, { uuid: item.uuid });
          lockedCount++;
        }
      }

      if (lockedCount > 0) {
        const itemNoun = lockedCount === 1 ? "item" : "items";
        const auxVerb = lockedCount === 1 ? "is" : "are";
        this.alertService.alert({
          title: 'Items Locked',
          text: `${lockedCount} ${itemNoun} you are attempting to save ${auxVerb} locked and cannot be edited.`
        });
      }

      const payloads = responseItems.map((responseItem) => {
        return CreateMaxPayloadFromAnyObject({ object: responseItem });
      });

      const localItems = await this.modelManager.mapPayloadsToLocalItems({
        paylods: payloads,
        source: PayloadSources.ComponentRetrieved,
        sourceKey: component.uuid
      });

      for (const responseItem of responseItems) {
        const item = find(localItems, { uuid: responseItem.uuid });
        if (!item) {
          // An item this extension is trying to save was possibly removed locally, notify user
          this.alertService.alert({
            text: `The extension ${component.name} is trying to save an item with type ${responseItem.content_type}, but that item does not exist. Please restart this extension and try again.`
          });
          continue;
        }

        if (!item.locked) {
          if (responseItem.clientData) {
            item.setDomainDataItem(
              component.getClientDataKey(),
              responseItem.clientData,
              SNComponentManager.ClientDataDomain
            );
          }
          await this.modelManager.setItemDirty(
            item,
            true,
            true,
            PayloadSources.ComponentRetrieved,
            component.uuid
          );
        }
      }

      this.syncService.sync().then((response) => {
        // Allow handlers to be notified when a save begins and ends, to update the UI
        const saveMessage = Object.assign({}, message);
        saveMessage.action = response && response.error ? "save-error" : "save-success";
        this.replyToMessage(component, message, { error: response && response.error });
        this.handleMessage(component, saveMessage);
      });
    });
  }

  handleDuplicateItemMessage(component, message) {
    const itemParams = message.data.item;
    const item = this.modelManager.findItem(itemParams.uuid);
    const requiredPermissions = [
      {
        name: "stream-items",
        content_types: [item.content_type]
      }
    ];

    this.runWithPermissions(component, requiredPermissions, async () => {
      const duplicate = await this.modelManager.duplicateItem({ item });
      this.syncService.sync();

      this.replyToMessage(component, message, { item: this.jsonForItem(duplicate, component) });
    });
  }

  handleCreateItemsMessage(component, message) {
    const responseItems = message.data.item ? [message.data.item] : message.data.items;
    const uniqueContentTypes = uniq(responseItems.map((item) => { return item.content_type; }));
    const requiredPermissions = [
      {
        name: "stream-items",
        content_types: uniqueContentTypes
      }
    ];

    this.runWithPermissions(component, requiredPermissions, async () => {
      this.removePrivatePropertiesFromResponseItems(responseItems, component, { type: "incoming" });
      const processedItems = [];
      for (const responseItem of responseItems) {
        const payload = CreateSourcedPayloadFromObject({
          object: responseItem,
          source: PayloadSources.RemoteRetrieved
        });
        const item = CreateItemFromPayload(payload);
        if (responseItem.clientData) {
          item.setDomainDataItem(
            component.getClientDataKey(),
            responseItem.clientData,
            SNComponentManager.ClientDataDomain
          );
        }
        this.modelManager.addItem(item);
        await this.modelManager.resolveReferencesForItem(item, true);
        await this.modelManager.setItemDirty(item, true);
        processedItems.push(item);
      }

      this.syncService.sync();

      // "create-item" or "create-items" are possible messages handled here
      const reply =
        message.action === "create-item" ?
          { item: this.jsonForItem(processedItems[0], component) }
          :
          { items: processedItems.map((item) => { return this.jsonForItem(item, component); }) };

      this.replyToMessage(component, message, reply);
    });
  }

  handleDeleteItemsMessage(component, message) {
    const requiredContentTypes = uniq(message.data.items.map((i) => { return i.content_type; })).sort();
    const requiredPermissions = [
      {
        name: "stream-items",
        content_types: requiredContentTypes
      }
    ];

    this.runWithPermissions(component, requiredPermissions, async () => {
      const itemsData = message.data.items;
      const noun = itemsData.length === 1 ? "item" : "items";
      let reply = null;

      let didConfirm = true;
      await this.alertService.confirm({ text: `Are you sure you want to delete ${itemsData.length} ${noun}?` })
        .catch(() => {
          didConfirm = false;
        });

      if (didConfirm) {
        // Filter for any components and deactivate before deleting
        for (const itemData of itemsData) {
          const model = this.modelManager.findItem(itemData.uuid);
          if (!model) {
            this.alertService.alert({ text: `The item you are trying to delete cannot be found.` });
            continue;
          }
          if ([ContentTypes.Component, ContentTypes.Theme].includes(model.content_type)) {
            await this.deactivateComponent(model, true);
          }
          await this.modelManager.setItemToBeDeleted(model);
          // Currently extensions are not notified of association until a full server sync completes.
          // We manually notify observers.
          this.modelManager.notifyMappingObservers([model], PayloadSources.RemoteSaved);
        }

        this.syncService.sync();
        reply = { deleted: true };
      } else {
        // Rejected by user
        reply = { deleted: false };
      }

      this.replyToMessage(component, message, reply);
    });
  }

  handleRequestPermissionsMessage(component, message) {
    this.runWithPermissions(component, message.data.permissions, () => {
      this.replyToMessage(component, message, { approved: true });
    });
  }

  handleSetComponentDataMessage(component, message) {
    // A component setting its own data does not require special permissions
    this.runWithPermissions(component, [], async () => {
      component.componentData = message.data.componentData;
      await this.modelManager.setItemDirty(component, true);
      this.syncService.sync();
    });
  }

  handleToggleComponentMessage(sourceComponent, targetComponent, message) {
    this.toggleComponent(targetComponent);
  }

  async toggleComponent(component) {
    if (component.area === 'modal') {
      this.openModalComponent(component);
    } else {
      if (component.active) {
        await this.deactivateComponent(component);
      } else {
        if (component.content_type === ContentTypes.Theme) {
          // Deactive currently active theme if new theme is not layerable
          const activeThemes = this.getActiveThemes();

          // Activate current before deactivating others, so as not to flicker
          await this.activateComponent(component);

          if (!component.isLayerable()) {
            setTimeout(async () => {
              for (const theme of activeThemes) {
                if (theme && !theme.isLayerable()) {
                  await this.deactivateComponent(theme);
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

  handleInstallLocalComponentMessage(sourceComponent, message) {
    // Only extensions manager has this permission
    if (!this.isNativeExtension(sourceComponent)) {
      return;
    }

    const targetComponent = this.modelManager.findItem(message.data.uuid);
    this.desktopManager.installComponent(targetComponent);
  }

  runWithPermissions(component, requiredPermissions, runFunction) {
    if (!component.permissions) {
      component.permissions = [];
    }

    // Make copy as not to mutate input values
    requiredPermissions = JSON.parse(JSON.stringify(requiredPermissions));

    const acquiredPermissions = component.permissions;

    for (const required of requiredPermissions.slice()) {
      // Remove anything we already have
      const respectiveAcquired = acquiredPermissions.find((candidate) => candidate.name === required.name);
      if (!respectiveAcquired) {
        continue;
      }

      // We now match on name, lets substract from required.content_types anything we have in acquired.
      const requiredContentTypes = required.content_types;

      if (!requiredContentTypes) {
        // If this permission does not require any content types (i.e stream-context-item)
        // then we can remove this from required since we match by name (respectiveAcquired.name === required.name)
        pull(requiredPermissions, required);
        continue;
      }

      for (const acquiredContentType of respectiveAcquired.content_types) {
        pull(requiredContentTypes, acquiredContentType);
      }

      if (requiredContentTypes.length === 0) {
        // We've removed all acquired and end up with zero, means we already have all these permissions
        pull(requiredPermissions, required);
      }
    }

    if (requiredPermissions.length > 0) {
      this.promptForPermissions(component, requiredPermissions, (approved) => {
        if (approved) {
          runFunction();
        }
      });
    } else {
      runFunction();
    }
  }

  promptForPermissions(component, permissions, callback) {
    const params = {};
    params.component = component;
    params.permissions = permissions;
    params.permissionsString = this.permissionsStringForPermissions(permissions, component);
    params.actionBlock = callback;

    params.callback = async (approved) => {
      if (approved) {
        for (const permission of permissions) {
          const matchingPermission = component.permissions.find((candidate) => candidate.name === permission.name);
          if (!matchingPermission) {
            component.permissions.push(permission);
          } else {
            // Permission already exists, but content_types may have been expanded
            const contentTypes = matchingPermission.content_types || [];
            matchingPermission.content_types = uniq(contentTypes.concat(permission.content_types));
          }
        }
        await this.modelManager.setItemDirty(component, true);
        this.syncService.sync();
      }

      this.permissionDialogs = this.permissionDialogs.filter((pendingDialog) => {
        // Remove self
        if (pendingDialog === params) {
          pendingDialog.actionBlock && pendingDialog.actionBlock(approved);
          return false;
        }

        const containsObjectSubset = function (source, target) {
          return !target.some(val => !source.find((candidate) => JSON.stringify(candidate) === JSON.stringify(val)));
        };

        if (pendingDialog.component === component) {
          // remove pending dialogs that are encapsulated by already approved permissions, and run its function
          if (pendingDialog.permissions === permissions || containsObjectSubset(permissions, pendingDialog.permissions)) {
            // If approved, run the action block. Otherwise, if canceled, cancel any pending ones as well, since the user was
            // explicit in their intentions
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
    };

    // since these calls are asyncronous, multiple dialogs may be requested at the same time. We only want to present one and trigger all callbacks based on one modal result
    const existingDialog = find(this.permissionDialogs, { component: component });

    this.permissionDialogs.push(params);

    if (!existingDialog) {
      this.presentPermissionsDialog(params);
    } else {
      this.log("Existing dialog, not presenting.");
    }
  }

  presentPermissionsDialog(dialog) {
    throw 'Must override SNComponentManager.presentPermissionsDialog';
  }

  openModalComponent(component) {
    throw 'Must override SNComponentManager.presentPermissionsDialog';
  }

  registerHandler(handler) {
    this.handlers.push(handler);
  }

  deregisterHandler(identifier) {
    const handler = find(this.handlers, { identifier: identifier });
    if (!handler) {
      this.log("Attempting to deregister non-existing handler");
      return;
    }
    this.handlers.splice(this.handlers.indexOf(handler), 1);
  }

  // Called by other views when the iframe is ready
  async registerComponentWindow(component, componentWindow) {
    if (component.window === componentWindow) {
      this.log("Web|componentManager", "attempting to re-register same component window.");
    }

    this.log("Web|componentManager|registerComponentWindow", component);
    component.window = componentWindow;
    component.sessionKey = await Uuid.GenerateUuid();
    this.sendMessageToComponent(component, {
      action: "component-registered",
      sessionKey: component.sessionKey,
      componentData: component.componentData,
      data: {
        uuid: component.uuid,
        environment: this.environment,
        platform: this.platform,
        activeThemeUrls: this.urlsForActiveThemes()
      }
    });

    this.postActiveThemesToComponent(component);

    if (this.desktopManager) {
      this.desktopManager.notifyComponentActivation(component);
    }
  }

  async activateComponent(component, dontSync = false) {
    const didChange = component.active !== true;

    component.active = true;
    for (const handler of this.handlers) {
      if (handler.areas.includes(component.area) || handler.areas.includes("*")) {
        handler.activationHandler && handler.activationHandler(component);
      }
    }

    if (didChange && !dontSync) {
      await this.modelManager.setItemDirty(component, true);
      this.syncService.sync();
    }

    if (!this.activeComponents.includes(component)) {
      this.activeComponents.push(component);
    }

    if (component.area === "themes") {
      this.postActiveThemesToAllComponents();
    }
  }

  async deactivateComponent(component, dontSync = false) {
    const didChange = component.active !== false;
    component.active = false;
    component.sessionKey = null;

    for (const handler of this.handlers) {
      if (handler.areas.includes(component.area) || handler.areas.includes("*")) {
        handler.activationHandler && handler.activationHandler(component);
      }
    }

    if (didChange && !dontSync) {
      await this.modelManager.setItemDirty(component, true);
      this.syncService.sync();
    }

    pull(this.activeComponents, component);

    this.streamObservers = this.streamObservers.filter((o) => {
      return o.component !== component;
    });

    this.contextStreamObservers = this.contextStreamObservers.filter((o) => {
      return o.component !== component;
    });

    if (component.area === "themes") {
      this.postActiveThemesToAllComponents();
    }
  }

  async reloadComponent(component) {
    //
    // Do soft deactivate
    //
    component.active = false;

    for (const handler of this.handlers) {
      if (handler.areas.includes(component.area) || handler.areas.includes("*")) {
        handler.activationHandler && handler.activationHandler(component);
      }
    }

    this.streamObservers = this.streamObservers.filter((o) => {
      return o.component !== component;
    });

    this.contextStreamObservers = this.contextStreamObservers.filter((o) => {
      return o.component !== component;
    });

    if (component.area === "themes") {
      this.postActiveThemesToAllComponents();
    }

    //
    // Do soft activate
    //

    return new Promise((resolve, reject) => {
      this.timeout(() => {
        component.active = true;
        for (const handler of this.handlers) {
          if (handler.areas.includes(component.area) || handler.areas.includes("*")) {
            handler.activationHandler && handler.activationHandler(component);
            resolve();
          }
        }

        if (!this.activeComponents.includes(component)) {
          this.activeComponents.push(component);
        }

        if (component.area === "themes") {
          this.postActiveThemesToAllComponents();
        }
        // Resolve again in case first resolve in for loop isn't reached.
        // Should be no effect if resolved twice, only first will be used.
        resolve();
      });
    });
  }

  async deleteComponent(component) {
    await this.modelManager.setItemToBeDeleted(component);
    this.syncService.sync();
  }

  isComponentActive(component) {
    return component.active;
  }

  iframeForComponent(component) {
    for (const frame of Array.from(document.getElementsByTagName("iframe"))) {
      const componentId = frame.dataset.componentId;
      if (componentId === component.uuid) {
        return frame;
      }
    }
  }

  focusChangedForComponent(component) {
    const focused = document.activeElement === this.iframeForComponent(component);
    for (const handler of this.handlers) {
      // Notify all handlers, and not just ones that match this component type
      handler.focusHandler && handler.focusHandler(component, focused);
    }
  }

  handleSetSizeEvent(component, data) {
    const setSize = (element, size) => {
      const widthString = typeof size.width === 'string' ? size.width : `${data.width}px`;
      const heightString = typeof size.height === 'string' ? size.height : `${data.height}px`;
      if (element) {
        element.setAttribute("style", `width:${widthString}; height:${heightString};`);
      }
    };

    if (component.area === "rooms" || component.area === "modal") {
      const selector = component.area === "rooms" ? "inner" : "outer";
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

      // On Firefox, resizing a component iframe does not seem to have an effect with editor-stack extensions.
      // Sizing the parent does the trick, however, we can't do this globally, otherwise, areas like the note-tags will
      // not be able to expand outside of the bounds (to display autocomplete, for example).
      if (component.area === "editor-stack") {
        const parent = iframe.parentElement;
        if (parent) {
          setSize(parent, data);
        }
      }

      // content object in this case is === to the iframe object above. This is probably
      // legacy code from when we would size content and container individually, which we no longer do.
      // const content = document.getElementById(`component-iframe-${component.uuid}`);
      // if(content) {
      //   setSize(content, data);
      // }
    }
  }

  editorForNote(note) {
    const editors = this.componentsForArea("editor-editor");
    for (const editor of editors) {
      if (editor.isExplicitlyEnabledForItem(note)) {
        return editor;
      }
    }

    // No editor found for note. Use default editor, if note does not prefer system editor
    if (this.isMobile) {
      if (!note.content.mobilePrefersPlainEditor) {
        return this.getDefaultEditor();
      }
    } else {
      if (!note.getAppDataItem("prefersPlainEditor")) {
        return editors.filter((e) => { return e.isDefaultEditor(); })[0];
      }
    }
  }

  permissionsStringForPermissions(permissions, component) {
    let finalString = "";
    const permissionsCount = permissions.length;

    const addSeparator = (index, length) => {
      if (index > 0) {
        if (index === length - 1) {
          if (length === 2) {
            return " and ";
          } else {
            return ", and ";
          }
        } else {
          return ", ";
        }
      }

      return "";
    };

    permissions.forEach((permission, index) => {
      if (permission.name === "stream-items") {
        const types = permission.content_types.map((type) => {
          const desc = displayStringForContentType(type);
          if (desc) {
            return desc + "s";
          } else {
            return "items of type " + type;
          }
        });
        let typesString = "";
        for (let i = 0; i < types.length; i++) {
          const type = types[i];
          typesString += addSeparator(i, types.length + permissionsCount - index - 1);
          typesString += type;
        }

        finalString += addSeparator(index, permissionsCount);
        finalString += typesString;

        if (types.length >= 2 && index < permissionsCount - 1) {
          // If you have a list of types, and still an additional root-level permission coming up, add a comma
          finalString += ", ";
        }
      } else if (permission.name === "stream-context-item") {
        const mapping = {
          "editor-stack": "working note",
          "note-tags": "working note",
          "editor-editor": "working note"
        };

        finalString += addSeparator(index, permissionsCount, true);
        finalString += mapping[component.area];
      }
    });

    return finalString + ".";
  }
}
