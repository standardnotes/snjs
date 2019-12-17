import find from 'lodash/find';
import pull from 'lodash/pull';
import uniq from 'lodash/uniq';
import remove from 'lodash/remove';

import { cryptoManager } from '@Crypto/manager';
import { SFModelManager} from '@Services/modelManager';

export class SNComponentManager {

  /*
    @param {string} environment: one of [web, desktop, mobile]
    @param {string} platform: one of [ios, android, linux-${environment}, mac-${environment}, windows-${environment}]
  */
  constructor({modelManager, syncManager, desktopManager, nativeExtManager,
    alertManager, $uiRunner, $timeout, environment, platform}) {
    /* This domain will be used to save context item client data */
    SNComponentManager.ClientDataDomain = "org.standardnotes.sn.components";

    // Some actions need to be run on the ui thread (desktop/web only)
    this.$uiRunner = $uiRunner || ((fn) => {fn()});
    this.$timeout = $timeout || setTimeout.bind(window);

    this.modelManager = modelManager;
    this.syncManager = syncManager;
    this.desktopManager = desktopManager;
    this.nativeExtManager = nativeExtManager;
    this.alertManager = alertManager;

    this.streamObservers = [];
    this.contextStreamObservers = [];
    this.activeComponents = [];

    this.environment = environment;
    this.platform = platform;
    this.isDesktop = this.environment == "desktop";
    this.isMobile = this.environment == "mobile";

    if(environment != "mobile") {
      this.configureForNonMobileUsage();
    }

    this.configureForGeneralUsage();

    // this.loggingEnabled = true;

    this.permissionDialogs = [];

    this.handlers = [];
  }

  configureForGeneralUsage() {
    this.modelManager.addItemSyncObserver("component-manager", "*", (allItems, validItems, deletedItems, source, sourceKey) => {
      let syncedComponents = allItems.filter((item) => {
        return item.content_type === "SN|Component" || item.content_type == "SN|Theme"
      });

      /* We only want to sync if the item source is Retrieved, not MappingSourceRemoteSaved to avoid
        recursion caused by the component being modified and saved after it is updated.
      */
      if(syncedComponents.length > 0 && source != SFModelManager.MappingSourceRemoteSaved) {
        // Ensure any component in our data is installed by the system
        if(this.isDesktop) {
          this.desktopManager.syncComponentsInstallation(syncedComponents);
        }
      }

      for(var component of syncedComponents) {
        var activeComponent = find(this.activeComponents, {uuid: component.uuid});
        if(component.active && !component.deleted && !activeComponent) {
          this.activateComponent(component);
        } else if(!component.active && activeComponent) {
          this.deactivateComponent(component);
        }
      }

      for(let observer of this.streamObservers) {
        if(sourceKey && sourceKey == observer.component.uuid) {
          // Don't notify source of change, as it is the originator, doesn't need duplicate event.
          continue;
        }

        let relevantItems = allItems.filter((item) => {
          return observer.contentTypes.indexOf(item.content_type) !== -1;
        })

        if(relevantItems.length == 0) {
          continue;
        }

        let requiredPermissions = [{
          name: "stream-items",
          content_types: observer.contentTypes.sort()
        }];

        this.runWithPermissions(observer.component, requiredPermissions, () => {
          this.sendItemsInReply(observer.component, relevantItems, observer.originalMessage);
        })
      }

      let requiredContextPermissions = [{
        name: "stream-context-item"
      }];

      for(let observer of this.contextStreamObservers) {
        if(sourceKey && sourceKey == observer.component.uuid) {
          // Don't notify source of change, as it is the originator, doesn't need duplicate event.
          continue;
        }

        for(let handler of this.handlers) {
          if(!handler.areas.includes(observer.component.area) && !handler.areas.includes("*")) {
            continue;
          }
          if(handler.contextRequestHandler) {
            var itemInContext = handler.contextRequestHandler(observer.component);
            if(itemInContext) {
              var matchingItem = find(allItems, {uuid: itemInContext.uuid});
              if(matchingItem) {
                this.runWithPermissions(observer.component, requiredContextPermissions, () => {
                  this.sendContextItemInReply(observer.component, matchingItem, observer.originalMessage, source);
                })
              }
            }
          }
        }
      }
    });
  }

  configureForNonMobileUsage() {
    const detectFocusChange = (event) => {
      for(var component of this.activeComponents) {
        if(document.activeElement == this.iframeForComponent(component)) {
          this.$timeout(() => {
            this.focusChangedForComponent(component);
          })
          break;
        }
      }
    }

    window.addEventListener ? window.addEventListener('focus', detectFocusChange, true) : window.attachEvent('onfocusout', detectFocusChange);
    window.addEventListener ? window.addEventListener('blur', detectFocusChange, true) : window.attachEvent('onblur', detectFocusChange);

    this.desktopManager.registerUpdateObserver((component) => {
      // Reload theme if active
      if(component.active && component.isTheme()) {
        this.postActiveThemesToAllComponents();
      }
    })

    // On mobile, events listeners are handled by a respective component
    window.addEventListener("message", (event) => {
      if(this.loggingEnabled) {
        console.log("Web app: received message", event);
      }

      // Make sure this message is for us
      if(event.data.sessionKey) {
        this.handleMessage(this.componentForSessionKey(event.data.sessionKey), event.data);
      }
    }, false);
  }

  postActiveThemesToAllComponents() {
    for(let component of this.components) {
      // Skip over components that are themes themselves,
      // or components that are not active, or components that don't have a window
      if(component.isTheme() || !component.active || !component.window) {
        continue;
      }

      this.postActiveThemesToComponent(component);
    }
  }

  getActiveThemes() {
    return this.componentsForArea("themes").filter((theme) => {return theme.active});
  }

  urlsForActiveThemes() {
    let themes = this.getActiveThemes();
    return themes.map((theme) => {
      return this.urlForComponent(theme);
    })
  }

  postActiveThemesToComponent(component) {
    let urls = this.urlsForActiveThemes();
    let data = { themes: urls }

    this.sendMessageToComponent(component, {action: "themes", data: data})
  }

  contextItemDidChangeInArea(area) {
    for(let handler of this.handlers) {
      if(handler.areas.includes(area) === false && !handler.areas.includes("*")) {
        continue;
      }
      var observers = this.contextStreamObservers.filter((observer) => {
        return observer.component.area === area;
      })

      for(let observer of observers) {
        if(handler.contextRequestHandler) {
          var itemInContext = handler.contextRequestHandler(observer.component);
          if(itemInContext) {
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
    if(hidden) {
      component.hidden = true;
    } else if(component.hidden) {
      // Only enter this condition if component is hidden to make this note have double side effects.
      component.hidden = false;

      // streamContextItem
      let contextObserver = find(this.contextStreamObservers, {identifier: component.uuid});
      if(contextObserver) {
        this.handleStreamContextItemMessage(component, contextObserver.originalMessage);
      }

      // streamItems
      let streamObserver = find(this.streamObservers, {identifier: component.uuid});
      if(streamObserver) {
        this.handleStreamItemsMessage(component, streamObserver.originalMessage);
      }
    }
  }

  jsonForItem(item, component, source) {
    var params = {uuid: item.uuid, content_type: item.content_type, created_at: item.created_at, updated_at: item.updated_at, deleted: item.deleted};
    params.content = item.createContentJSONFromProperties();
    params.clientData = item.getDomainDataItem(component.getClientDataKey(), SNComponentManager.ClientDataDomain) || {};

    // isMetadataUpdate implies that the extension should make reference of updated metadata,
    // but not update content values as they may be stale relative to what the extension currently has
    // Changes are always metadata updates if the mapping source is SFModelManager.MappingSourceRemoteSaved || source == SFModelManager.MappingSourceLocalSaved.
    //
    if(source && (source == SFModelManager.MappingSourceRemoteSaved || source == SFModelManager.MappingSourceLocalSaved)) {
      params.isMetadataUpdate = true;
    }

    this.removePrivatePropertiesFromResponseItems([params], component, {type: "outgoing"});
    return params;
  }

  sendItemsInReply(component, items, message, source) {
    if(this.loggingEnabled) {console.log("Web|componentManager|sendItemsInReply", component, items, message)};
    let response = {items: {}};
    let mapped = items.map((item) => {
      return this.jsonForItem(item, component, source);
    });

    response.items = mapped;
    this.replyToMessage(component, message, response);
  }

  sendContextItemInReply(component, item, originalMessage, source) {
    if(this.loggingEnabled) {console.log("Web|componentManager|sendContextItemInReply", component, item, originalMessage)};
    let response = {item: this.jsonForItem(item, component, source)};
    this.replyToMessage(component, originalMessage, response);
  }

  replyToMessage(component, originalMessage, replyData) {
    var reply = {
      action: "reply",
      original: originalMessage,
      data: replyData
    }

    this.sendMessageToComponent(component, reply);
  }

  sendMessageToComponent(component, message) {
    let permissibleActionsWhileHidden = ["component-registered", "themes"];
    if(component.hidden && !permissibleActionsWhileHidden.includes(message.action)) {
      if(this.loggingEnabled) {
        console.log("Component disabled for current item, not sending any messages.", component.name);
      }
      return;
    }

    if(this.loggingEnabled) {
      console.log("Web|sendMessageToComponent", component, message);
    }

    let origin = this.urlForComponent(component);
    if(!origin.startsWith("http") && !origin.startsWith("file")) {
      // Native extension running in web, prefix current host
      origin = window.location.href + origin;
    }

    if(!component.window) {
      this.alertManager.alert({text: `Standard Notes is trying to communicate with ${component.name}, but an error is occurring. Please restart this extension and try again.`})
    }

    // Mobile messaging requires json
    if(this.isMobile) {
      message = JSON.stringify(message);
    }

    component.window.postMessage(message, origin);
  }

  get components() {
    return this.modelManager.allItemsMatchingTypes(["SN|Component", "SN|Theme"]);
  }

  componentsForArea(area) {
    return this.components.filter((component) => {
      return component.area === area;
    })
  }

  urlForComponent(component) {
    // offlineOnly is available only on desktop, and not on web or mobile.
    if(component.offlineOnly && !this.isDesktop) {
      return null;
    }

    if(component.offlineOnly || (this.isDesktop && component.local_url)) {
      return component.local_url && component.local_url.replace("sn://", this.desktopManager.getExtServerHost());
    } else {
      let url = component.hosted_url || component.legacy_url;
      if(this.isMobile) {
        let localReplacement = this.platform == "ios" ? "localhost" : "10.0.2.2";
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
    let component = find(this.components, {sessionKey: key});
    if(!component) {
      for(let handler of this.handlers) {
        if(handler.componentForSessionKeyHandler) {
          component = handler.componentForSessionKeyHandler(key);
          if(component) {
            break;
          }
        }
      }
    }
    return component;
  }

  handleMessage(component, message) {

    if(!component) {
      console.log("Component not defined for message, returning", message);
      this.alertManager.alert({text: "An extension is trying to communicate with Standard Notes, but there is an error establishing a bridge. Please restart the app and try again."});
      return;
    }

    // Actions that won't succeeed with readonly mode
    let readwriteActions = [
      "save-items",
      "associate-item",
      "deassociate-item",
      "create-item",
      "create-items",
      "delete-items",
      "set-component-data"
    ];

    if(component.readonly && readwriteActions.includes(message.action)) {
      // A component can be marked readonly if changes should not be saved.
      // Particullary used for revision preview windows where the notes should not be savable.
      this.alertManager.alert({text: `The extension ${component.name} is trying to save, but it is in a locked state and cannot accept changes.`});
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

    if(message.action === "stream-items") {
      this.handleStreamItemsMessage(component, message);
    } else if(message.action === "stream-context-item") {
      this.handleStreamContextItemMessage(component, message);
    } else if(message.action === "set-component-data") {
      this.handleSetComponentDataMessage(component, message);
    } else if(message.action === "delete-items") {
      this.handleDeleteItemsMessage(component, message);
    } else if(message.action === "create-items" || message.action === "create-item") {
      this.handleCreateItemsMessage(component, message);
    } else if(message.action === "save-items") {
      this.handleSaveItemsMessage(component, message);
    } else if(message.action === "toggle-activate-component") {
      let componentToToggle = this.modelManager.findItem(message.data.uuid);
      this.handleToggleComponentMessage(component, componentToToggle, message);
    } else if(message.action === "request-permissions") {
      this.handleRequestPermissionsMessage(component, message);
    } else if(message.action === "install-local-component") {
      this.handleInstallLocalComponentMessage(component, message);
    } else if(message.action === "duplicate-item") {
      this.handleDuplicateItemMessage(component, message);
    }

    // Notify observers
    for(let handler of this.handlers) {
      if(handler.actionHandler && (handler.areas.includes(component.area) || handler.areas.includes("*"))) {
        this.$timeout(() => {
          handler.actionHandler(component, message.action, message.data);
        })
      }
    }
  }

  removePrivatePropertiesFromResponseItems(responseItems, component, options = {}) {
    // can be 'incoming' or 'outgoing'. We want to remove updated_at if incoming, but keep it if outgoing
    if(options.type == "incoming") {
      let privateTopLevelProperties = ["updated_at"];
      // Maintaining our own updated_at value is imperative for sync to work properly, we ignore any incoming value.
      for(let responseItem of responseItems) {
        if(typeof responseItem.setDirty === 'function') {
          console.error("Attempting to pass object. Use JSON.");
          continue;
        }
        for(let privateProperty of privateTopLevelProperties) {
          delete responseItem[privateProperty];
        }
      }
    }

    if(component) {
      // System extensions can bypass this step
      if(this.nativeExtManager && this.nativeExtManager.isSystemExtension(component)) {
        return;
      }
    }
    // Don't allow component to overwrite these properties.
    let privateContentProperties = ["autoupdateDisabled", "permissions", "active"];
    if(options) {
      if(options.includeUrls) { privateContentProperties = privateContentProperties.concat(["url", "hosted_url", "local_url"])}
    }
    for(let responseItem of responseItems) {
      // Do not pass in actual items here, otherwise that would be destructive.
      // Instead, generic JS/JSON objects should be passed.
      if(typeof responseItem.setDirty === 'function') {
        console.error("Attempting to pass object. Use JSON.");
        continue;
      }

      for(var prop of privateContentProperties) {
        delete responseItem.content[prop];
      }
    }
  }

  handleStreamItemsMessage(component, message) {
    let requiredPermissions = [
      {
        name: "stream-items",
        content_types: message.data.content_types.sort()
      }
    ];

    this.runWithPermissions(component, requiredPermissions, () => {
      if(!find(this.streamObservers, {identifier: component.uuid})) {
        // for pushing laster as changes come in
        this.streamObservers.push({
          identifier: component.uuid,
          component: component,
          originalMessage: message,
          contentTypes: message.data.content_types
        })
      }

      // push immediately now
      var items = [];
      for(var contentType of message.data.content_types) {
        items = items.concat(this.modelManager.validItemsForContentType(contentType));
      }
      this.sendItemsInReply(component, items, message);
    });
  }

  handleStreamContextItemMessage(component, message) {

    var requiredPermissions = [
      {
        name: "stream-context-item"
      }
    ];

    this.runWithPermissions(component, requiredPermissions, () => {
      if(!find(this.contextStreamObservers, {identifier: component.uuid})) {
        // for pushing laster as changes come in
        this.contextStreamObservers.push({
          identifier: component.uuid,
          component: component,
          originalMessage: message
        })
      }

      // push immediately now
      for(let handler of this.handlersForArea(component.area)) {
        if(handler.contextRequestHandler) {
          var itemInContext = handler.contextRequestHandler(component);
          if(itemInContext) {
            this.sendContextItemInReply(component, itemInContext, message);
          }
        }
      }
    })
  }

  isItemIdWithinComponentContextJurisdiction(uuid, component) {
    let itemIdsInJurisdiction = this.itemIdsInContextJurisdictionForComponent(component);
    return itemIdsInJurisdiction.includes(uuid);
  }

  /* Returns items that given component has context permissions for */
  itemIdsInContextJurisdictionForComponent(component) {
    let itemIds = [];
    for(let handler of this.handlersForArea(component.area)) {
      if(handler.contextRequestHandler) {
        var itemInContext = handler.contextRequestHandler(component);
        if(itemInContext) {
          itemIds.push(itemInContext.uuid);
        }
      }
    }

    return itemIds;
  }

  handlersForArea(area) {
    return this.handlers.filter((candidate) => {return candidate.areas.includes(area)});
  }

  async handleSaveItemsMessage(component, message) {
    let responseItems = message.data.items;
    let requiredPermissions = [];

    let itemIdsInContextJurisdiction = this.itemIdsInContextJurisdictionForComponent(component);

    // Pending as in needed to be accounted for in permissions.
    let pendingResponseItems = responseItems.slice();

    for(let responseItem of responseItems.slice()) {
      if(itemIdsInContextJurisdiction.includes(responseItem.uuid)) {
        requiredPermissions.push({
          name: "stream-context-item"
        });
        pull(pendingResponseItems, responseItem);
        // We break because there can only be one context item
        break;
      }
    }

    // Check to see if additional privileges are required
    if(pendingResponseItems.length > 0) {
      let requiredContentTypes = uniq(pendingResponseItems.map((i) => {return i.content_type})).sort();
      requiredPermissions.push({
        name: "stream-items",
        content_types: requiredContentTypes
      });
    }

    this.runWithPermissions(component, requiredPermissions, async () => {

      this.removePrivatePropertiesFromResponseItems(responseItems, component, {includeUrls: true, type: "incoming"});

      /*
      We map the items here because modelManager is what updates the UI. If you were to instead get the items directly,
      this would update them server side via sync, but would never make its way back to the UI.
      */

      // Filter locked items
      let ids = responseItems.map((i) => {return i.uuid});
      let items = this.modelManager.findItems(ids);
      let lockedCount = 0;
      for(let item of items) {
        if(item.locked) {
          remove(responseItems, {uuid: item.uuid});
          lockedCount++;
        }
      }

      if(lockedCount > 0) {
        let itemNoun = lockedCount == 1 ? "item" : "items";
        let auxVerb = lockedCount == 1 ? "is" : "are";
        this.alertManager.alert({title: 'Items Locked', text: `${lockedCount} ${itemNoun} you are attempting to save ${auxVerb} locked and cannot be edited.`});
      }

      let localItems = await this.modelManager.mapResponseItemsToLocalModels(responseItems, SFModelManager.MappingSourceComponentRetrieved, component.uuid);

      for(let responseItem of responseItems) {
        let item = find(localItems, {uuid: responseItem.uuid});
        if(!item) {
          // An item this extension is trying to save was possibly removed locally, notify user
          this.alertManager.alert({text: `The extension ${component.name} is trying to save an item with type ${responseItem.content_type}, but that item does not exist. Please restart this extension and try again.`});
          continue;
        }

        if(!item.locked) {
          if(responseItem.clientData) {
            item.setDomainDataItem(component.getClientDataKey(), responseItem.clientData, SNComponentManager.ClientDataDomain);
          }
          this.modelManager.setItemDirty(item, true, true, SFModelManager.MappingSourceComponentRetrieved, component.uuid);
        }
      }

      this.syncManager.sync().then((response) => {
        // Allow handlers to be notified when a save begins and ends, to update the UI
        let saveMessage = Object.assign({}, message);
        saveMessage.action = response && response.error ? "save-error" : "save-success";
        this.replyToMessage(component, message, {error: response && response.error})
        this.handleMessage(component, saveMessage);
      });
    });
  }

  handleDuplicateItemMessage(component, message) {
    var itemParams = message.data.item;
    var item = this.modelManager.findItem(itemParams.uuid);
    var requiredPermissions = [
      {
        name: "stream-items",
        content_types: [item.content_type]
      }
    ];

    this.runWithPermissions(component, requiredPermissions, () => {
      var duplicate = this.modelManager.duplicateItemAndAdd(item);
      this.syncManager.sync();

      this.replyToMessage(component, message, {item: this.jsonForItem(duplicate, component)});
    });
  }

  handleCreateItemsMessage(component, message) {
    var responseItems = message.data.item ? [message.data.item] : message.data.items;
    let uniqueContentTypes = uniq(responseItems.map((item) => {return item.content_type}));
    var requiredPermissions = [
      {
        name: "stream-items",
        content_types: uniqueContentTypes
      }
    ];

    this.runWithPermissions(component, requiredPermissions, () => {
      this.removePrivatePropertiesFromResponseItems(responseItems, component, {type: "incoming"});
      var processedItems = [];
      for(let responseItem of responseItems) {
        var item = this.modelManager.createItem(responseItem);
        if(responseItem.clientData) {
          item.setDomainDataItem(component.getClientDataKey(), responseItem.clientData, SNComponentManager.ClientDataDomain);
        }
        this.modelManager.addItem(item);
        this.modelManager.resolveReferencesForItem(item, true);
        this.modelManager.setItemDirty(item, true);
        processedItems.push(item);
      }

      this.syncManager.sync();

      // "create-item" or "create-items" are possible messages handled here
      let reply =
        message.action == "create-item" ?
          {item: this.jsonForItem(processedItems[0], component)}
        :
          {items: processedItems.map((item) => {return this.jsonForItem(item, component)})}

      this.replyToMessage(component, message, reply)
    });
  }

  handleDeleteItemsMessage(component, message) {
    var requiredContentTypes = uniq(message.data.items.map((i) => {return i.content_type})).sort();
    var requiredPermissions = [
      {
        name: "stream-items",
        content_types: requiredContentTypes
      }
    ];

    this.runWithPermissions(component, requiredPermissions, async () => {
      var itemsData = message.data.items;
      var noun = itemsData.length == 1 ? "item" : "items";
      var reply = null;

      let didConfirm = true;
      await this.alertManager.confirm({text: `Are you sure you want to delete ${itemsData.length} ${noun}?`})
      .catch(() => {
        didConfirm = false;
      })

      if(didConfirm) {
        // Filter for any components and deactivate before deleting
        for(var itemData of itemsData) {
          var model = this.modelManager.findItem(itemData.uuid);
          if(!model) {
            this.alertManager.alert({text: `The item you are trying to delete cannot be found.`})
            continue;
          }
          if(["SN|Component", "SN|Theme"].includes(model.content_type)) {
            this.deactivateComponent(model, true);
          }
          this.modelManager.setItemToBeDeleted(model);
          // Currently extensions are not notified of association until a full server sync completes.
          // We manually notify observers.
          this.modelManager.notifySyncObserversOfModels([model], SFModelManager.MappingSourceRemoteSaved);
        }

        this.syncManager.sync();
        reply = {deleted: true};
      } else {
        // Rejected by user
        reply = {deleted: false};
      }

      this.replyToMessage(component, message, reply)
    });
  }

  handleRequestPermissionsMessage(component, message) {
    this.runWithPermissions(component, message.data.permissions, () => {
      this.replyToMessage(component, message, {approved: true});
    });
  }

  handleSetComponentDataMessage(component, message) {
    // A component setting its own data does not require special permissions
    this.runWithPermissions(component, [], () => {
      component.componentData = message.data.componentData;
      this.modelManager.setItemDirty(component, true);
      this.syncManager.sync();
    });
  }

  handleToggleComponentMessage(sourceComponent, targetComponent, message) {
    this.toggleComponent(targetComponent);
  }

  toggleComponent(component) {
    if(component.area == "modal") {
      this.openModalComponent(component);
    } else {
      if(component.active) {
        this.deactivateComponent(component);
      } else {
        if(component.content_type == "SN|Theme") {
          // Deactive currently active theme if new theme is not layerable
          var activeThemes = this.getActiveThemes();

          // Activate current before deactivating others, so as not to flicker
          this.activateComponent(component);

          if(!component.isLayerable()) {
            setTimeout(() => {
              for(var theme of activeThemes) {
                if(theme && !theme.isLayerable()) {
                  this.deactivateComponent(theme);
                }
              }
            }, 10);
          }
        } else {
          this.activateComponent(component);
        }
      }
    }
  }

  handleInstallLocalComponentMessage(sourceComponent, message) {
    // Only extensions manager has this permission
    if(this.nativeExtManager && !this.nativeExtManager.isSystemExtension(sourceComponent)) {
      return;
    }

    let targetComponent = this.modelManager.findItem(message.data.uuid);
    this.desktopManager.installComponent(targetComponent);
  }

  runWithPermissions(component, requiredPermissions, runFunction) {
    if(!component.permissions) {
      component.permissions = [];
    }

    // Make copy as not to mutate input values
    requiredPermissions = JSON.parse(JSON.stringify(requiredPermissions));

    var acquiredPermissions = component.permissions;

    for(let required of requiredPermissions.slice()) {
      // Remove anything we already have
      let respectiveAcquired = acquiredPermissions.find((candidate) => candidate.name == required.name);
      if(!respectiveAcquired) {
        continue;
      }

      // We now match on name, lets substract from required.content_types anything we have in acquired.
      let requiredContentTypes = required.content_types;

      if(!requiredContentTypes) {
        // If this permission does not require any content types (i.e stream-context-item)
        // then we can remove this from required since we match by name (respectiveAcquired.name == required.name)
        pull(requiredPermissions, required);
        continue;
      }

      for(let acquiredContentType of respectiveAcquired.content_types) {
        // console.log("Removing content_type", acquiredContentType, "from", requiredContentTypes);
        pull(requiredContentTypes, acquiredContentType);
      }

      if(requiredContentTypes.length == 0)  {
        // We've removed all acquired and end up with zero, means we already have all these permissions
        pull(requiredPermissions, required);
      }
    }

    if(requiredPermissions.length > 0) {
      this.promptForPermissions(component, requiredPermissions, (approved) => {
        if(approved) {
          runFunction();
        }
      });
    } else {
      runFunction();
    }
  }

  promptForPermissions(component, permissions, callback) {
    var params = {};
    params.component = component;
    params.permissions = permissions;
    params.permissionsString = this.permissionsStringForPermissions(permissions, component);
    params.actionBlock = callback;

    params.callback = (approved) => {
      if(approved) {
        for(let permission of permissions) {
          let matchingPermission = component.permissions.find((candidate) => candidate.name == permission.name);
          if(!matchingPermission) {
            component.permissions.push(permission);
          } else {
            // Permission already exists, but content_types may have been expanded
            let contentTypes = matchingPermission.content_types || [];
            matchingPermission.content_types = uniq(contentTypes.concat(permission.content_types));
          }
        }
        this.modelManager.setItemDirty(component, true);
        this.syncManager.sync();
      }

      this.permissionDialogs = this.permissionDialogs.filter((pendingDialog) => {
        // Remove self
        if(pendingDialog == params) {
          pendingDialog.actionBlock && pendingDialog.actionBlock(approved);
          return false;
        }

        const containsObjectSubset = function(source, target) {
          return !target.some(val => !source.find((candidate) => JSON.stringify(candidate) === JSON.stringify(val)));
        }

        if(pendingDialog.component == component) {
          // remove pending dialogs that are encapsulated by already approved permissions, and run its function
          if(pendingDialog.permissions == permissions || containsObjectSubset(permissions, pendingDialog.permissions)) {
            // If approved, run the action block. Otherwise, if canceled, cancel any pending ones as well, since the user was
            // explicit in their intentions
            if(approved) {
              pendingDialog.actionBlock && pendingDialog.actionBlock(approved);
            }
            return false;
          }
        }
        return true;
      })

      if(this.permissionDialogs.length > 0) {
        this.presentPermissionsDialog(this.permissionDialogs[0]);
      }
    };

    // since these calls are asyncronous, multiple dialogs may be requested at the same time. We only want to present one and trigger all callbacks based on one modal result
    var existingDialog = find(this.permissionDialogs, {component: component});

    this.permissionDialogs.push(params);

    if(!existingDialog) {
      this.presentPermissionsDialog(params);
    } else {
      console.log("Existing dialog, not presenting.");
    }
  }

  presentPermissionsDialog(dialog) {
    console.error("Must override");
  }

  openModalComponent(component) {
    console.error("Must override");
  }

  registerHandler(handler) {
    this.handlers.push(handler);
  }

  deregisterHandler(identifier) {
    var handler = find(this.handlers, {identifier: identifier});
    if(!handler) {
      console.log("Attempting to deregister non-existing handler");
      return;
    }
    this.handlers.splice(this.handlers.indexOf(handler), 1);
  }

  // Called by other views when the iframe is ready
  async registerComponentWindow(component, componentWindow) {
    if(component.window === componentWindow) {
      if(this.loggingEnabled) {
        console.log("Web|componentManager", "attempting to re-register same component window.")
      }
    }

    if(this.loggingEnabled) {
      console.log("Web|componentManager|registerComponentWindow", component);
    }
    component.window = componentWindow;
    component.sessionKey = await cryptoManager.crypto.generateUUID();
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

    if(this.desktopManager) {
      this.desktopManager.notifyComponentActivation(component);
    }
  }

  activateComponent(component, dontSync = false) {
    var didChange = component.active != true;

    component.active = true;
    for(let handler of this.handlers) {
      if(handler.areas.includes(component.area) || handler.areas.includes("*")) {
        // We want to run the handler in a $timeout so the UI updates, but we also don't want it to run asyncronously
        // so that the steps below this one are run before the handler. So we run in a waitTimeout.
        // Update 12/18: We were using this.waitTimeout previously, however, that caused the iframe.onload callback to never be called
        // for some reason for iframes on desktop inside the revision-preview-modal. So we'll use safeApply instead. I'm not quite sure
        // where the original "so the UI updates" comment applies to, but we'll have to keep an eye out to see if this causes problems somewhere else.
        this.$uiRunner(() => {
          handler.activationHandler && handler.activationHandler(component);
        })
      }
    }

    if(didChange && !dontSync) {
      this.modelManager.setItemDirty(component, true);
      this.syncManager.sync();
    }

    if(!this.activeComponents.includes(component)) {
      this.activeComponents.push(component);
    }

    if(component.area == "themes") {
      this.postActiveThemesToAllComponents();
    }
  }

  deactivateComponent(component, dontSync = false) {
    var didChange = component.active != false;
    component.active = false;
    component.sessionKey = null;

    for(let handler of this.handlers) {
      if(handler.areas.includes(component.area) || handler.areas.includes("*")) {
        // See comment in activateComponent regarding safeApply and awaitTimeout
        this.$uiRunner(() => {
          handler.activationHandler && handler.activationHandler(component);
        })
      }
    }

    if(didChange && !dontSync) {
      this.modelManager.setItemDirty(component, true);
      this.syncManager.sync();
    }

    pull(this.activeComponents, component);

    this.streamObservers = this.streamObservers.filter((o) => {
      return o.component !== component;
    })

    this.contextStreamObservers = this.contextStreamObservers.filter((o) => {
      return o.component !== component;
    })

    if(component.area == "themes") {
      this.postActiveThemesToAllComponents();
    }
  }

  async reloadComponent(component) {
    //
    // Do soft deactivate
    //
    component.active = false;

    for(let handler of this.handlers) {
      if(handler.areas.includes(component.area) || handler.areas.includes("*")) {
        // See comment in activateComponent regarding safeApply and awaitTimeout
        this.$uiRunner(() => {
          handler.activationHandler && handler.activationHandler(component);
        })
      }
    }

    this.streamObservers = this.streamObservers.filter((o) => {
      return o.component !== component;
    })

    this.contextStreamObservers = this.contextStreamObservers.filter((o) => {
      return o.component !== component;
    })

    if(component.area == "themes") {
      this.postActiveThemesToAllComponents();
    }

    //
    // Do soft activate
    //

    return new Promise((resolve, reject) => {
      this.$timeout(() => {
        component.active = true;
        for(var handler of this.handlers) {
          if(handler.areas.includes(component.area) || handler.areas.includes("*")) {
            // See comment in activateComponent regarding safeApply and awaitTimeout
            this.$uiRunner(() => {
              handler.activationHandler && handler.activationHandler(component);
              resolve();
            })
          }
        }

        if(!this.activeComponents.includes(component)) {
          this.activeComponents.push(component);
        }

        if(component.area == "themes") {
          this.postActiveThemesToAllComponents();
        }
        // Resolve again in case first resolve in for loop isn't reached.
        // Should be no effect if resolved twice, only first will be used.
        resolve();
      })
    })
  }

  deleteComponent(component) {
    this.modelManager.setItemToBeDeleted(component);
    this.syncManager.sync();
  }

  isComponentActive(component) {
    return component.active;
  }

  iframeForComponent(component) {
    for(var frame of Array.from(document.getElementsByTagName("iframe"))) {
      var componentId = frame.dataset.componentId;
      if(componentId === component.uuid) {
        return frame;
      }
    }
  }

  focusChangedForComponent(component) {
    let focused = document.activeElement == this.iframeForComponent(component);
    for(var handler of this.handlers) {
      // Notify all handlers, and not just ones that match this component type
      handler.focusHandler && handler.focusHandler(component, focused);
    }
  }

  handleSetSizeEvent(component, data) {
    var setSize = (element, size) => {
      var widthString = typeof size.width === 'string' ? size.width : `${data.width}px`;
      var heightString = typeof size.height === 'string' ? size.height : `${data.height}px`;
      if(element) {
        element.setAttribute("style", `width:${widthString}; height:${heightString};`);
      }
    }

    if(component.area == "rooms" || component.area == "modal") {
      var selector = component.area == "rooms" ? "inner" : "outer";
      var content = document.getElementById(`component-content-${selector}-${component.uuid}`);
      if(content) {
        setSize(content, data);
      }
    } else {
      var iframe = this.iframeForComponent(component);
      if(!iframe) {
        return;
      }

      setSize(iframe, data);

      // On Firefox, resizing a component iframe does not seem to have an effect with editor-stack extensions.
      // Sizing the parent does the trick, however, we can't do this globally, otherwise, areas like the note-tags will
      // not be able to expand outside of the bounds (to display autocomplete, for example).
      if(component.area == "editor-stack") {
        let parent = iframe.parentElement;
        if(parent) {
          setSize(parent, data);
        }
      }

      // content object in this case is === to the iframe object above. This is probably
      // legacy code from when we would size content and container individually, which we no longer do.
      // var content = document.getElementById(`component-iframe-${component.uuid}`);
      // console.log("content === iframe", content == iframe);
      // if(content) {
      //   setSize(content, data);
      // }
    }
  }

  editorForNote(note) {
    let editors = this.componentsForArea("editor-editor");
    for(var editor of editors) {
      if(editor.isExplicitlyEnabledForItem(note)) {
        return editor;
      }
    }

    // No editor found for note. Use default editor, if note does not prefer system editor
    if(this.isMobile) {
      if(!note.content.mobilePrefersPlainEditor) {
        return this.getDefaultEditor();
      }
    } else {
      if(!note.getAppDataItem("prefersPlainEditor")) {
        return editors.filter((e) => {return e.isDefaultEditor()})[0];
      }
    }
  }

  permissionsStringForPermissions(permissions, component) {
    var finalString = "";
    let permissionsCount = permissions.length;

    let addSeparator = (index, length) => {
      if(index > 0) {
        if(index == length - 1) {
          if(length == 2) {
            return " and ";
          } else {
            return ", and "
          }
        } else {
          return ", ";
        }
      }

      return "";
    }

    permissions.forEach((permission, index) => {
      if(permission.name === "stream-items") {
        var types = permission.content_types.map((type) => {
          var desc = this.modelManager.humanReadableDisplayForContentType(type);
          if(desc) {
            return desc + "s";
          } else {
            return "items of type " + type;
          }
        })
        var typesString = "";

        for(var i = 0;i < types.length;i++) {
          var type = types[i];
          typesString += addSeparator(i, types.length + permissionsCount - index - 1);
          typesString += type;
        }

        finalString += addSeparator(index, permissionsCount);

        finalString += typesString;

        if(types.length >= 2 && index < permissionsCount - 1) {
          // If you have a list of types, and still an additional root-level permission coming up, add a comma
          finalString += ", ";
        }
      } else if(permission.name === "stream-context-item") {
        var mapping = {
          "editor-stack" : "working note",
          "note-tags" : "working note",
          "editor-editor": "working note"
        }

        finalString += addSeparator(index, permissionsCount, true);

        finalString += mapping[component.area];
      }
    })

    return finalString + ".";
  }
}
