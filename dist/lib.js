export class SFAlertManager {

  async alert(params) {
    return new Promise((resolve, reject) => {
      window.alert(params.text);
      resolve();
    })
  }

  async confirm(params) {
    return new Promise((resolve, reject) => {
      if(window.confirm(params.text)) {
        resolve();
      } else {
        reject();
      }
    });
  }

}
;export class SFAuthManager {

  constructor(storageManager, httpManager, alertManager, timeout) {
    SFAuthManager.DidSignOutEvent = "DidSignOutEvent";
    SFAuthManager.WillSignInEvent = "WillSignInEvent";
    SFAuthManager.DidSignInEvent = "DidSignInEvent";

    this.httpManager = httpManager;
    this.storageManager = storageManager;
    this.alertManager = alertManager || new SFAlertManager();
    this.$timeout = timeout || setTimeout.bind(window);

    this.eventHandlers = [];
  }

  addEventHandler(handler) {
    this.eventHandlers.push(handler);
    return handler;
  }

  removeEventHandler(handler) {
    _.pull(this.eventHandlers, handler);
  }

  notifyEvent(event, data) {
    for(var handler of this.eventHandlers) {
      handler(event, data || {});
    }
  }

  async saveKeys(keys) {
    this._keys = keys;
    await this.storageManager.setItem("mk", keys.mk);
    await this.storageManager.setItem("ak", keys.ak);
  }

  async signout(clearAllData) {
    this._keys = null;
    this._authParams = null;
    if(clearAllData) {
      return this.storageManager.clearAllData().then(() => {
        this.notifyEvent(SFAuthManager.DidSignOutEvent);
      })
    } else {
      this.notifyEvent(SFAuthManager.DidSignOutEvent);
    }
  }

  async keys() {
    if(!this._keys) {
      var mk = await this.storageManager.getItem("mk");
      if(!mk) {
        return null;
      }
      this._keys = {mk: mk, ak: await this.storageManager.getItem("ak")};
    }
    return this._keys;
  }

  async getAuthParams() {
    if(!this._authParams) {
      var data = await this.storageManager.getItem("auth_params");
      this._authParams = JSON.parse(data);
    }

    if(this._authParams && !this._authParams.version) {
      this._authParams.version = await this.defaultProtocolVersion();
    }

    return this._authParams;
  }

  async defaultProtocolVersion() {
    var keys = await this.keys();
    if(keys && keys.ak) {
      // If there's no version stored, and there's an ak, it has to be 002. Newer versions would have thier version stored in authParams.
      return "002";
    } else {
      return "001";
    }
  }

  async protocolVersion() {
    var authParams = await this.getAuthParams();
    if(authParams && authParams.version) {
      return authParams.version;
    }

    return this.defaultProtocolVersion();
  }

  async getAuthParamsForEmail(url, email, extraParams) {
    let params =  _.merge({email: email}, extraParams);
    params['api'] = SFHttpManager.getApiVersion();
    return new Promise((resolve, reject) => {
      var requestUrl = url + "/auth/params";
      this.httpManager.getAbsolute(requestUrl, params, (response) => {
        resolve(response);
      }, (response) => {
        console.error("Error getting auth params", response);
        if(typeof response !== 'object') {
          response = {error: {message: "A server error occurred while trying to sign in. Please try again."}};
        }
        resolve(response);
      })
    })
  }

  lock() {
    this.locked = true;
  }

  unlock() {
    this.locked = false;
  }

  isLocked() {
    return this.locked == true;
  }

  unlockAndResolve(resolve, param) {
    this.unlock();
    resolve(param);
  }

  async login(url, email, password, strictSignin, extraParams) {
    return new Promise(async (resolve, reject) => {

      let existingKeys = await this.keys();
      if(existingKeys != null) {
        resolve({error : {message: "Cannot log in because already signed in."}});
        return;
      }

      if(this.isLocked()) {
        resolve({error : {message: "Login already in progress."}});
        return;
      }

      this.lock();

      this.notifyEvent(SFAuthManager.WillSignInEvent);

      let authParams = await this.getAuthParamsForEmail(url, email, extraParams);

      // SF3 requires a unique identifier in the auth params
      authParams.identifier = email;

      if(authParams.error) {
        this.unlockAndResolve(resolve, authParams);
        return;
      }

      if(!authParams || !authParams.pw_cost) {
        this.unlockAndResolve(resolve, {error : {message: "Invalid email or password."}});
        return;
      }

      if(!SNJS.supportedVersions().includes(authParams.version)) {
        var message;
        if(SNJS.isVersionNewerThanLibraryVersion(authParams.version)) {
          // The user has a new account type, but is signing in to an older client.
          message = "This version of the application does not support your newer account type. Please upgrade to the latest version of Standard Notes to sign in.";
        } else {
          // The user has a very old account type, which is no longer supported by this client
          message = "The protocol version associated with your account is outdated and no longer supported by this application. Please visit standardnotes.org/help/security for more information.";
        }
        this.unlockAndResolve(resolve, {error: {message: message}});
        return;
      }

      if(SNJS.isProtocolVersionOutdated(authParams.version)) {
        let message = `The encryption version for your account, ${authParams.version}, is outdated and requires upgrade. You may proceed with login, but are advised to perform a security update using the web or desktop application. Please visit standardnotes.org/help/security for more information.`
        var abort = false;
        await this.alertManager.confirm({
          title: "Update Needed",
          text: message,
          confirmButtonText: "Sign In",
        }).catch(() => {
          this.unlockAndResolve(resolve, {error: {}});
          abort = true;
        })
        if(abort) {
          return;
        }
      }

      if(!SNJS.supportsPasswordDerivationCost(authParams.pw_cost)) {
        let message = "Your account was created on a platform with higher security capabilities than this browser supports. " +
        "If we attempted to generate your login keys here, it would take hours. " +
        "Please use a browser with more up to date security capabilities, like Google Chrome or Firefox, to log in."
        this.unlockAndResolve(resolve, {error: {message: message}});
        return;
      }

      var minimum = SNJS.costMinimumForVersion(authParams.version);
      if(authParams.pw_cost < minimum) {
        let message = "Unable to login due to insecure password parameters. Please visit standardnotes.org/help/security for more information.";
        this.unlockAndResolve(resolve, {error: {message: message}});
        return;
      }

      if(strictSignin) {
        // Refuse sign in if authParams.version is anything but the latest version
        var latestVersion = SNJS.version();
        if(authParams.version !== latestVersion) {
          let message = `Strict sign in refused server sign in parameters. The latest security version is ${latestVersion}, but your account is reported to have version ${authParams.version}. If you'd like to proceed with sign in anyway, please disable strict sign in and try again.`;
          this.unlockAndResolve(resolve, {error: {message: message}});
          return;
        }
      }

      let keys = await SNJS.crypto.computeEncryptionKeysForUser(password, authParams);

      var requestUrl = url + "/auth/sign_in";
      var params = _.merge({password: keys.pw, email: email}, extraParams);

      params['api'] = SFHttpManager.getApiVersion();

      this.httpManager.postAbsolute(requestUrl, params, async (response) => {
        await this.handleAuthResponse(response, email, url, authParams, keys);
        this.notifyEvent(SFAuthManager.DidSignInEvent);
        this.$timeout(() => this.unlockAndResolve(resolve, response));
      }, (response) => {
        console.error("Error logging in", response);
        if(typeof response !== 'object') {
          response = {error: {message: "A server error occurred while trying to sign in. Please try again."}};
        }
        this.$timeout(() => this.unlockAndResolve(resolve, response));
      });
    });
  }

  register(url, email, password) {
    return new Promise(async (resolve, reject) => {

      if(this.isLocked()) {
        resolve({error : {message: "Register already in progress."}});
        return;
      }

      const MinPasswordLength = 8;

      if(password.length < MinPasswordLength) {
        let message = `Your password must be at least ${MinPasswordLength} characters in length. For your security, please choose a longer password or, ideally, a passphrase, and try again.`;
        resolve({error: {message: message}});
        return;
      }

      this.lock();

      let results = await SNJS.crypto.generateInitialKeysAndAuthParamsForUser(email, password);
      let keys = results.keys;
      let authParams = results.authParams;

      var requestUrl = url + "/auth";
      var params = _.merge({password: keys.pw, email: email}, authParams);
      params['api'] = SFHttpManager.getApiVersion();

      this.httpManager.postAbsolute(requestUrl, params, async (response) => {
        await this.handleAuthResponse(response, email, url, authParams, keys);
        this.unlockAndResolve(resolve, response);
      }, (response) => {
        console.error("Registration error", response);
        if(typeof response !== 'object') {
          response = {error: {message: "A server error occurred while trying to register. Please try again."}};
        }
        this.unlockAndResolve(resolve, response);
      })
    });
  }

  async changePassword(url, email, current_server_pw, newKeys, newAuthParams) {
    return new Promise(async (resolve, reject) => {

      if(this.isLocked()) {
        resolve({error : {message: "Change password already in progress."}});
        return;
      }

      this.lock();

      let newServerPw = newKeys.pw;

      var requestUrl = url + "/auth/change_pw";
      var params = _.merge({new_password: newServerPw, current_password: current_server_pw}, newAuthParams);
      params['api'] = SFHttpManager.getApiVersion();

      this.httpManager.postAuthenticatedAbsolute(requestUrl, params, async (response) => {
        await this.handleAuthResponse(response, email, null, newAuthParams, newKeys);
        this.unlockAndResolve(resolve, response);
      }, (response) => {
        if(typeof response !== 'object') {
          response = {error: {message: "Something went wrong while changing your password. Your password was not changed. Please try again."}}
        }
        this.unlockAndResolve(resolve, response);
      })
    });
  }

  async handleAuthResponse(response, email, url, authParams, keys) {
    if(url) { await this.storageManager.setItem("server", url);}
    this._authParams = authParams;
    await this.storageManager.setItem("auth_params", JSON.stringify(authParams));
    await this.storageManager.setItem("jwt", response.token);
    return this.saveKeys(keys);
  }
}
;export class SNComponentManager {

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
        var activeComponent = _.find(this.activeComponents, {uuid: component.uuid});
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
              var matchingItem = _.find(allItems, {uuid: itemInContext.uuid});
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
      let contextObserver = _.find(this.contextStreamObservers, {identifier: component.uuid});
      if(contextObserver) {
        this.handleStreamContextItemMessage(component, contextObserver.originalMessage);
      }

      // streamItems
      let streamObserver = _.find(this.streamObservers, {identifier: component.uuid});
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
    let component = _.find(this.components, {sessionKey: key});
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
      if(!_.find(this.streamObservers, {identifier: component.uuid})) {
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
      if(!_.find(this.contextStreamObservers, {identifier: component.uuid})) {
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
        _.pull(pendingResponseItems, responseItem);
        // We break because there can only be one context item
        break;
      }
    }

    // Check to see if additional privileges are required
    if(pendingResponseItems.length > 0) {
      let requiredContentTypes = _.uniq(pendingResponseItems.map((i) => {return i.content_type})).sort();
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
          _.remove(responseItems, {uuid: item.uuid});
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
        let item = _.find(localItems, {uuid: responseItem.uuid});
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
    let uniqueContentTypes = _.uniq(responseItems.map((item) => {return item.content_type}));
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
    var requiredContentTypes = _.uniq(message.data.items.map((i) => {return i.content_type})).sort();
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
        _.pull(requiredPermissions, required);
        continue;
      }

      for(let acquiredContentType of respectiveAcquired.content_types) {
        // console.log("Removing content_type", acquiredContentType, "from", requiredContentTypes);
        _.pull(requiredContentTypes, acquiredContentType);
      }

      if(requiredContentTypes.length == 0)  {
        // We've removed all acquired and end up with zero, means we already have all these permissions
        _.pull(requiredPermissions, required);
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
            matchingPermission.content_types = _.uniq(contentTypes.concat(permission.content_types));
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
    var existingDialog = _.find(this.permissionDialogs, {component: component});

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
    var handler = _.find(this.handlers, {identifier: identifier});
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
    component.sessionKey = await SNJS.crypto.generateUUID();
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

    _.pull(this.activeComponents, component);

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
;var globalScope = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null);

export class SFHttpManager {

  static getApiVersion() {
    // Applicable only to Standard Notes requests. Requests to external acitons should not use this.
    // syncManager and authManager must include this API version as part of its request params.
    return "20190520";
  }

  constructor(timeout, apiVersion) {
    // calling callbacks in a $timeout allows UI to update
    this.$timeout = timeout || setTimeout.bind(globalScope);
  }

  setJWTRequestHandler(handler) {
    this.jwtRequestHandler = handler;
  }

  async setAuthHeadersForRequest(request) {
    var token = await this.jwtRequestHandler();
    if(token) {
      request.setRequestHeader('Authorization', 'Bearer ' + token);
    }
  }

  async postAbsolute(url, params, onsuccess, onerror) {
    return this.httpRequest("post", url, params, onsuccess, onerror);
  }

  async postAuthenticatedAbsolute(url, params, onsuccess, onerror) {
    return this.httpRequest("post", url, params, onsuccess, onerror, true);
  }

  async patchAbsolute(url, params, onsuccess, onerror) {
    return this.httpRequest("patch", url, params, onsuccess, onerror);
  }

  async getAbsolute(url, params, onsuccess, onerror) {
    return this.httpRequest("get", url, params, onsuccess, onerror);
  }

  async httpRequest(verb, url, params, onsuccess, onerror, authenticated = false) {
    return new Promise(async (resolve, reject) => {
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = () => {
          if (xmlhttp.readyState == 4) {
            var response = xmlhttp.responseText;
            if(response) {
              try {
                response = JSON.parse(response);
              } catch(e) {}
            }

           if(xmlhttp.status >= 200 && xmlhttp.status <= 299){
             this.$timeout(function(){
               onsuccess(response);
               resolve(response);
             })
           } else {
             console.error("Request error:", response);
             this.$timeout(function(){
               onerror(response, xmlhttp.status)
               reject(response);
             })
           }
         }
        }

        if(verb == "get" && Object.keys(params).length > 0) {
          url = this.urlForUrlAndParams(url, params);
        }

        xmlhttp.open(verb, url, true);
        xmlhttp.setRequestHeader('Content-type', 'application/json');

        if(authenticated) {
          await this.setAuthHeadersForRequest(xmlhttp);
        }

        if(verb == "post" || verb == "patch") {
          xmlhttp.send(JSON.stringify(params));
        } else {
          xmlhttp.send();
        }
    })
  }

  urlForUrlAndParams(url, params) {
    let keyValueString = Object.keys(params).map((key) => {
      return key + "=" + encodeURIComponent(params[key])
    }).join("&");

    if(url.includes("?")) {
      return url + "&" + keyValueString;
    } else {
      return url + "?" + keyValueString;
    }
  }

}
;export class SFMigrationManager {

  constructor(modelManager, syncManager, storageManager, authManager) {
    this.modelManager = modelManager;
    this.syncManager = syncManager;
    this.storageManager = storageManager;

    this.completionHandlers = [];

    this.loadMigrations();

    // The syncManager used to dispatch a param called 'initialSync' in the 'sync:completed' event
    // to let us know of the first sync completion after login.
    // however it was removed as it was deemed to be unreliable (returned wrong value when a single sync request repeats on completion for pagination)
    // We'll now use authManager's events instead
    let didReceiveSignInEvent = false;
    let signInHandler = authManager.addEventHandler((event) => {
      if(event == SFAuthManager.DidSignInEvent) {
        didReceiveSignInEvent = true;
      }
    })

    this.receivedLocalDataEvent = syncManager.initialDataLoaded();

    this.syncManager.addEventHandler(async (event, data) => {
      let dataLoadedEvent = event == "local-data-loaded";
      let syncCompleteEvent = event == "sync:completed";

      if(dataLoadedEvent || syncCompleteEvent) {
        if(dataLoadedEvent) {
          this.receivedLocalDataEvent = true;
        } else if(syncCompleteEvent) {
          this.receivedSyncCompletedEvent = true;
        }

        // We want to run pending migrations only after local data has been loaded, and a sync has been completed.
        if(this.receivedLocalDataEvent && this.receivedSyncCompletedEvent) {
          // Only perform these steps on the first succcessful sync after sign in
          if(didReceiveSignInEvent) {
            // Reset our collected state about sign in
            didReceiveSignInEvent = false;
            authManager.removeEventHandler(signInHandler);

            // If initial online sync, clear any completed migrations that occurred while offline,
            // so they can run again now that we have updated user items. Only clear migrations that
            // don't have `runOnlyOnce` set
            var completedList = (await this.getCompletedMigrations()).slice();
            for(var migrationName of completedList) {
              let migration = await this.migrationForEncodedName(migrationName);
              if(!migration.runOnlyOnce) {
                _.pull(this._completed, migrationName);
              }
            }
          }
          this.runPendingMigrations();
        }
      }
    })
  }

  addCompletionHandler(handler) {
    this.completionHandlers.push(handler);
  }

  removeCompletionHandler(handler) {
    _.pull(this.completionHandlers, handler);
  }

  async migrationForEncodedName(name) {
    let decoded = await this.decode(name);
    return this.migrations.find((migration) => {
      return migration.name == decoded;
    })
  }

  loadMigrations() {
    this.migrations = this.registeredMigrations();
  }

  registeredMigrations() {
    // Subclasses should return an array of migrations here.
    // Migrations should have a unique `name`, `content_type`,
    // and `handler`, which is a function that accepts an array of matching items to migration.
  }

  async runPendingMigrations() {
    var pending = await this.getPendingMigrations();

    // run in pre loop, keeping in mind that a migration may be run twice: when offline then again when signing in.
    // we need to reset the items to a new array.
    for(var migration of pending) {
      migration.items = [];
    }

    for(var item of this.modelManager.allNondummyItems) {
      for(var migration of pending) {
        if(item.content_type == migration.content_type) {
          migration.items.push(item);
        }
      }
    }

    for(var migration of pending) {
      if((migration.items && migration.items.length > 0) || migration.customHandler) {
        await this.runMigration(migration, migration.items);
      } else {
        this.markMigrationCompleted(migration);
      }
    }

    for(var handler of this.completionHandlers) {
      handler();
    }
  }

  async encode(text) {
    return window.btoa(text);
  }

  async decode(text) {
    return window.atob(text);
  }

  async getCompletedMigrations() {
    if(!this._completed) {
      var rawCompleted = await this.storageManager.getItem("migrations");
      if(rawCompleted) {
        this._completed = JSON.parse(rawCompleted);
      } else {
        this._completed = [];
      }
    }
    return this._completed;
  }

  async getPendingMigrations() {
    var completed = await this.getCompletedMigrations();
    let pending = [];
    for(var migration of this.migrations) {
      // if the name is not found in completed, then it is pending.
      if(completed.indexOf(await this.encode(migration.name)) == -1) {
        pending.push(migration);
      }
    }
    return pending;
  }

  async markMigrationCompleted(migration) {
    var completed = await this.getCompletedMigrations();
    completed.push(await this.encode(migration.name));
    this.storageManager.setItem("migrations", JSON.stringify(completed));
    migration.running = false;
  }

  async runMigration(migration, items) {
    // To protect against running more than once, especially if it's a long-running migration,
    // we'll add this flag, and clear it on completion.
    if(migration.running) {
      return;
    }

    console.log("Running migration:", migration.name);

    migration.running = true;
    if(migration.customHandler) {
      return migration.customHandler().then(() => {
        this.markMigrationCompleted(migration);
      })
    } else {
      return migration.handler(items).then(() => {
        this.markMigrationCompleted(migration);
      })
    }
  }
}
;export class SFModelManager {

  constructor(timeout) {
    SFModelManager.MappingSourceRemoteRetrieved = "MappingSourceRemoteRetrieved";
    SFModelManager.MappingSourceRemoteSaved = "MappingSourceRemoteSaved";
    SFModelManager.MappingSourceLocalSaved = "MappingSourceLocalSaved";
    SFModelManager.MappingSourceLocalRetrieved = "MappingSourceLocalRetrieved";
    SFModelManager.MappingSourceLocalDirtied = "MappingSourceLocalDirtied";
    SFModelManager.MappingSourceComponentRetrieved = "MappingSourceComponentRetrieved";
    SFModelManager.MappingSourceDesktopInstalled = "MappingSourceDesktopInstalled"; // When a component is installed by the desktop and some of its values change
    SFModelManager.MappingSourceRemoteActionRetrieved = "MappingSourceRemoteActionRetrieved"; /* aciton-based Extensions like note history */
    SFModelManager.MappingSourceFileImport = "MappingSourceFileImport";

    SFModelManager.isMappingSourceRetrieved = (source) => {
      return [
        SFModelManager.MappingSourceRemoteRetrieved,
        SFModelManager.MappingSourceComponentRetrieved,
        SFModelManager.MappingSourceRemoteActionRetrieved
      ].includes(source);
    }

    this.$timeout = timeout || setTimeout.bind(window);

    this.itemSyncObservers = [];
    this.items = [];
    this.itemsHash = {};
    this.missedReferences = {};
    this.uuidChangeObservers = [];
  }

  handleSignout() {
    this.items.length = 0;
    this.itemsHash = {};
    this.missedReferences = {};
  }

  addModelUuidChangeObserver(id, callback) {
    this.uuidChangeObservers.push({id: id, callback: callback});
  }

  notifyObserversOfUuidChange(oldItem, newItem) {
    for(let observer of this.uuidChangeObservers) {
      try {
        observer.callback(oldItem, newItem);
      } catch (e) {
        console.error("Notify observers of uuid change exception:", e);
      }
    }
  }

  async alternateUUIDForItem(item) {
    // We need to clone this item and give it a new uuid, then delete item with old uuid from db (you can't modify uuid's in our indexeddb setup)
    let newItem = this.createItem(item);
    newItem.uuid = await SNJS.crypto.generateUUID();

    // Update uuids of relationships
    newItem.informReferencesOfUUIDChange(item.uuid, newItem.uuid);
    this.informModelsOfUUIDChangeForItem(newItem, item.uuid, newItem.uuid);

    // the new item should inherit the original's relationships
    for(let referencingObject of item.referencingObjects) {
      referencingObject.setIsNoLongerBeingReferencedBy(item);
      item.setIsNoLongerBeingReferencedBy(referencingObject);
      referencingObject.addItemAsRelationship(newItem);
    }

    this.setItemsDirty(item.referencingObjects, true);

    // Used to set up referencingObjects for new item (so that other items can now properly reference this new item)
    this.resolveReferencesForItem(newItem);

    if(this.loggingEnabled) {
      console.log(item.uuid, "-->", newItem.uuid);
    }

    // Set to deleted, then run through mapping function so that observers can be notified
    item.deleted = true;
    item.content.references = [];
    // Don't set dirty, because we don't need to sync old item. alternating uuid only occurs in two cases:
    // signing in and merging offline data, or when a uuid-conflict occurs. In both cases, the original item never
    // saves to a server, so doesn't need to be synced.
    // informModelsOfUUIDChangeForItem may set this object to dirty, but we want to undo that here, so that the item gets deleted
    // right away through the mapping function.
    this.setItemDirty(item, false, false, SFModelManager.MappingSourceLocalSaved);
    await this.mapResponseItemsToLocalModels([item], SFModelManager.MappingSourceLocalSaved);

    // add new item
    this.addItem(newItem);
    this.setItemDirty(newItem, true, true, SFModelManager.MappingSourceLocalSaved);

    this.notifyObserversOfUuidChange(item, newItem);

    return newItem;
  }

  informModelsOfUUIDChangeForItem(newItem, oldUUID, newUUID) {
    // some models that only have one-way relationships might be interested to hear that an item has changed its uuid
    // for example, editors have a one way relationship with notes. When a note changes its UUID, it has no way to inform the editor
    // to update its relationships

    for(let model of this.items) {
      model.potentialItemOfInterestHasChangedItsUUID(newItem, oldUUID, newUUID);
    }
  }

  didSyncModelsOffline(items) {
    this.notifySyncObserversOfModels(items, SFModelManager.MappingSourceLocalSaved);
  }

  async mapResponseItemsToLocalModels(items, source, sourceKey) {
    return this.mapResponseItemsToLocalModelsWithOptions({items, source, sourceKey});
  }

  async mapResponseItemsToLocalModelsOmittingFields(items, omitFields, source, sourceKey) {
    return this.mapResponseItemsToLocalModelsWithOptions({items, omitFields, source, sourceKey});
  }

  async mapResponseItemsToLocalModelsWithOptions({items, omitFields, source, sourceKey, options}) {
    let models = [], processedObjects = [], modelsToNotifyObserversOf = [];

    // first loop should add and process items
    for(let json_obj of items) {
      if(!json_obj) {
        continue;
      }

      // content is missing if it has been sucessfullly decrypted but no content
      let isMissingContent = !json_obj.content && !json_obj.errorDecrypting;
      let isCorrupt = !json_obj.content_type || !json_obj.uuid;
      if((isCorrupt || isMissingContent) && !json_obj.deleted) {
        // An item that is not deleted should never have empty content
        console.error("Server response item is corrupt:", json_obj);
        continue;
      }

      // Lodash's _.omit, which was previously used, seems to cause unexpected behavior
      // when json_obj is an ES6 item class. So we instead manually omit each key.
      if(Array.isArray(omitFields)) {
        for(let key of omitFields) {
          delete json_obj[key];
        }
      }

      let item = this.findItem(json_obj.uuid);

      if(item) {
        item.updateFromJSON(json_obj);
        // If an item goes through mapping, it can no longer be a dummy.
        item.dummy = false;
      }

      let contentType = json_obj["content_type"] || (item && item.content_type);
      let unknownContentType = this.acceptableContentTypes && !this.acceptableContentTypes.includes(contentType);
      if(unknownContentType) {
        continue;
      }

      let isDirtyItemPendingDelete = false;
      if(json_obj.deleted == true) {
        if(json_obj.dirty) {
          // Item was marked as deleted but not yet synced (in offline scenario)
          // We need to create this item as usual, but just not add it to individual arrays
          // i.e add to this.items but not this.notes (so that it can be retrieved with getDirtyItems)
          isDirtyItemPendingDelete = true;
        } else {
          if(item) {
            // We still want to return this item to the caller so they know it was handled.
            models.push(item);

            modelsToNotifyObserversOf.push(item);
            this.removeItemLocally(item);
          }
          continue;
        }
      }

      if(!item) {
        item = this.createItem(json_obj);
      }

      this.addItem(item, isDirtyItemPendingDelete);

      // Observers do not need to handle items that errored while decrypting.
      if(!item.errorDecrypting) {
        modelsToNotifyObserversOf.push(item);
      }

      models.push(item);
      processedObjects.push(json_obj);
    }

    // second loop should process references
    for(let [index, json_obj] of processedObjects.entries()) {
      let model = models[index];
      if(json_obj.content) {
        this.resolveReferencesForItem(model);
      }

      model.didFinishSyncing();
    }

    let missedRefs = this.popMissedReferenceStructsForObjects(processedObjects);
    for(let ref of missedRefs) {
      let model = models.find((candidate) => candidate.uuid == ref.reference_uuid);
      // Model should 100% be defined here, but let's not be too overconfident
      if(model) {
        let itemWaitingForTheValueInThisCurrentLoop = ref.for_item;
        itemWaitingForTheValueInThisCurrentLoop.addItemAsRelationship(model);
      }
    }

    await this.notifySyncObserversOfModels(modelsToNotifyObserversOf, source, sourceKey);

    return models;
  }

  missedReferenceBuildKey(referenceId, objectId) {
    return `${referenceId}:${objectId}`
  }

  popMissedReferenceStructsForObjects(objects) {
    if(!objects || objects.length == 0) {
      return [];
    }

    let results = [];
    let toDelete = [];
    let uuids = objects.map((item) => item.uuid);
    let genericUuidLength = uuids[0].length;

    let keys = Object.keys(this.missedReferences);
    for(let candidateKey of keys) {
      /*
      We used to do string.split to get at the UUID, but surprisingly,
      the performance of this was about 20x worse then just getting the substring.

      let matches = candidateKey.split(":")[0] == object.uuid;
      */
      let matches = uuids.includes(candidateKey.substring(0, genericUuidLength));
      if(matches) {
        results.push(this.missedReferences[candidateKey]);
        toDelete.push(candidateKey);
      }
    }

    // remove from hash
    for(let key of toDelete) {
      delete this.missedReferences[key];
    }

    return results;
  }

  resolveReferencesForItem(item, markReferencesDirty = false) {

    if(item.errorDecrypting) {
      return;
    }

    let contentObject = item.contentObject;

    // If another client removes an item's references, this client won't pick up the removal unless
    // we remove everything not present in the current list of references
    item.updateLocalRelationships();

    if(!contentObject.references) {
      return;
    }

    let references = contentObject.references.slice(); // make copy, references will be modified in array

    let referencesIds = references.map((ref) => {return ref.uuid});
    let includeBlanks = true;
    let referencesObjectResults = this.findItems(referencesIds, includeBlanks);

    for(let [index, referencedItem] of referencesObjectResults.entries()) {
      if(referencedItem) {
        item.addItemAsRelationship(referencedItem);
        if(markReferencesDirty) {
          this.setItemDirty(referencedItem, true);
        }
      } else {
        let missingRefId = referencesIds[index];
        // Allows mapper to check when missing reference makes it through the loop,
        // and then runs resolveReferencesForItem again for the original item.
        let mappingKey = this.missedReferenceBuildKey(missingRefId, item.uuid);
        if(!this.missedReferences[mappingKey]) {
          let missedRef = {reference_uuid: missingRefId, for_item: item};
          this.missedReferences[mappingKey] = missedRef;
        }
      }
    }
  }

  /* Note that this function is public, and can also be called manually (desktopManager uses it) */
  async notifySyncObserversOfModels(models, source, sourceKey) {
    // Make sure `let` is used in the for loops instead of `var`, as we will be using a timeout below.
    let observers = this.itemSyncObservers.sort((a, b) => {
      // sort by priority
      return a.priority < b.priority ? -1 : 1;
    });
    for(let observer of observers) {
      let allRelevantItems = observer.types.includes("*") ? models : models.filter((item) => {return observer.types.includes(item.content_type)});
      let validItems = [], deletedItems = [];
      for(let item of allRelevantItems) {
        if(item.deleted) {
          deletedItems.push(item);
        } else {
          validItems.push(item);
        }
      }

      if(allRelevantItems.length > 0) {
        await this._callSyncObserverCallbackWithTimeout(observer, allRelevantItems, validItems, deletedItems, source, sourceKey);
      }
    }
  }

  /*
    Rather than running this inline in a for loop, which causes problems and requires all variables to be declared with `let`,
    we'll do it here so it's more explicit and less confusing.
   */
  async _callSyncObserverCallbackWithTimeout(observer, allRelevantItems, validItems, deletedItems, source, sourceKey) {
    return new Promise((resolve, reject) => {
      this.$timeout(() => {
        try {
          observer.callback(allRelevantItems, validItems, deletedItems, source, sourceKey);
        } catch (e) {
          console.error("Sync observer exception", e);
        } finally {
          resolve();
        }
      })
    })
  }

  // When a client sets an item as dirty, it means its values has changed, and everyone should know about it.
  // Particularly extensions. For example, if you edit the title of a note, extensions won't be notified until the save sync completes.
  // With this, they'll be notified immediately.
  setItemDirty(item, dirty = true, updateClientDate, source, sourceKey) {
    this.setItemsDirty([item], dirty, updateClientDate, source, sourceKey);
  }

  setItemsDirty(items, dirty = true, updateClientDate, source, sourceKey) {
    for(let item of items) {
      item.setDirty(dirty, updateClientDate);
    }
    this.notifySyncObserversOfModels(items, source || SFModelManager.MappingSourceLocalDirtied, sourceKey);
  }

  createItem(json_obj) {
    let itemClass = SFModelManager.ContentTypeClassMapping && SFModelManager.ContentTypeClassMapping[json_obj.content_type];
    if(!itemClass) {
      itemClass = SFItem;
    }

    let item = new itemClass(json_obj);
    return item;
  }

  /*
    Be sure itemResponse is a generic Javascript object, and not an Item.
    An Item needs to collapse its properties into its content object before it can be duplicated.
    Note: the reason we need this function is specificallty for the call to resolveReferencesForItem.
    This method creates but does not add the item to the global inventory. It's used by syncManager
    to check if this prospective duplicate item is identical to another item, including the references.
   */
  async createDuplicateItemFromResponseItem(itemResponse) {
    if(typeof itemResponse.setDirty === 'function') {
      // You should never pass in objects here, as we will modify the itemResponse's uuid below (update: we now make a copy of input value).
      console.error("Attempting to create conflicted copy of non-response item.");
      return null;
    }
    // Make a copy so we don't modify input value.
    let itemResponseCopy = JSON.parse(JSON.stringify(itemResponse));
    itemResponseCopy.uuid = await SNJS.crypto.generateUUID();
    let duplicate = this.createItem(itemResponseCopy);
    return duplicate;
  }

  duplicateItemAndAddAsConflict(duplicateOf) {
    return this.duplicateItemWithCustomContentAndAddAsConflict({content: duplicateOf.content, duplicateOf});
  }

  duplicateItemWithCustomContentAndAddAsConflict({content, duplicateOf}) {
    let copy = this.duplicateItemWithCustomContent({content, duplicateOf});
    this.addDuplicatedItemAsConflict({duplicate: copy, duplicateOf});
    return copy;
  }

  addDuplicatedItemAsConflict({duplicate, duplicateOf}) {
    this.addDuplicatedItem(duplicate, duplicateOf);
    duplicate.content.conflict_of = duplicateOf.uuid;
  }

  duplicateItemWithCustomContent({content, duplicateOf}) {
    let copy = new duplicateOf.constructor({content});
    copy.created_at = duplicateOf.created_at;
    if(!copy.content_type) {
      copy.content_type = duplicateOf.content_type;
    }
    return copy;
  }

  duplicateItemAndAdd(item) {
    let copy = this.duplicateItemWithoutAdding(item);
    this.addDuplicatedItem(copy, item);
    return copy;
  }

  duplicateItemWithoutAdding(item) {
    let copy = new item.constructor({content: item.content});
    copy.created_at = item.created_at;
    if(!copy.content_type) {
      copy.content_type = item.content_type;
    }
    return copy;
  }

  addDuplicatedItem(duplicate, original) {
    this.addItem(duplicate);
    // the duplicate should inherit the original's relationships
    for(let referencingObject of original.referencingObjects) {
      referencingObject.addItemAsRelationship(duplicate);
      this.setItemDirty(referencingObject, true);
    }
    this.resolveReferencesForItem(duplicate);
    this.setItemDirty(duplicate, true);
  }


  addItem(item, globalOnly = false) {
    this.addItems([item], globalOnly);
  }

  addItems(items, globalOnly = false) {
    items.forEach((item) => {
      if(!this.itemsHash[item.uuid]) {
        this.itemsHash[item.uuid] = item;
        this.items.push(item);
      }
    });
  }

  /* Notifies observers when an item has been synced or mapped from a remote response */
  addItemSyncObserver(id, types, callback) {
    this.addItemSyncObserverWithPriority({id, types, callback, priority: 1})
  }

  addItemSyncObserverWithPriority({id, priority, types, callback}) {
    if(!Array.isArray(types)) {
      types = [types];
    }
    this.itemSyncObservers.push({id, types, priority, callback});
  }

  removeItemSyncObserver(id) {
    _.remove(this.itemSyncObservers, _.find(this.itemSyncObservers, {id: id}));
  }

  getDirtyItems() {
    return this.items.filter((item) => {
      // An item that has an error decrypting can be synced only if it is being deleted.
      // Otherwise, we don't want to send corrupt content up to the server.
      return item.dirty == true && !item.dummy && (!item.errorDecrypting || item.deleted);
    })
  }

  clearDirtyItems(items) {
    for(let item of items) {
      item.setDirty(false);
    }
  }

  removeAndDirtyAllRelationshipsForItem(item) {
    // Handle direct relationships
    // An item with errorDecrypting will not have valid content field
    if(!item.errorDecrypting) {
      for(let reference of item.content.references) {
        let relationship = this.findItem(reference.uuid);
        if(relationship) {
          item.removeItemAsRelationship(relationship);
          if(relationship.hasRelationshipWithItem(item)) {
            relationship.removeItemAsRelationship(item);
            this.setItemDirty(relationship, true);
          }
        }
      }
    }

    // Handle indirect relationships
    for(let object of item.referencingObjects) {
      object.removeItemAsRelationship(item);
      this.setItemDirty(object, true);
    }

    item.referencingObjects = [];
  }

  /* Used when changing encryption key */
  setAllItemsDirty() {
    let relevantItems = this.allItems;
    this.setItemsDirty(relevantItems, true);
  }

  setItemToBeDeleted(item) {
    item.deleted = true;

    if(!item.dummy) {
      this.setItemDirty(item, true);
    }

    this.removeAndDirtyAllRelationshipsForItem(item);
  }

  async removeItemLocally(item) {
    _.remove(this.items, {uuid: item.uuid});

    delete this.itemsHash[item.uuid]

    item.isBeingRemovedLocally();
  }

  /* Searching */

  get allItems() {
    return this.items.slice();
  }

  get allNondummyItems() {
    return this.items.filter(function(item){
      return !item.dummy;
    })
  }

  allItemsMatchingTypes(contentTypes) {
    return this.allItems.filter(function(item){
      return (_.includes(contentTypes, item.content_type) || _.includes(contentTypes, "*")) && !item.dummy;
    })
  }

  invalidItems() {
    return this.allItems.filter((item) => {
      return item.errorDecrypting;
    });
  }

  validItemsForContentType(contentType) {
    return this.allItems.filter((item) => {
      return item.content_type == contentType && !item.errorDecrypting;
    });
  }

  findItem(itemId) {
    return this.itemsHash[itemId];
  }

  findItems(ids, includeBlanks = false) {
    let results = [];
    for(let id of ids) {
      let item = this.itemsHash[id];
      if(item || includeBlanks) {
        results.push(item);
      }
    }
    return results;
  }

  itemsMatchingPredicate(predicate) {
    return this.itemsMatchingPredicates([predicate]);
  }

  itemsMatchingPredicates(predicates) {
    return this.filterItemsWithPredicates(this.allItems, predicates);
  }

  filterItemsWithPredicates(items, predicates) {
    let results = items.filter((item) => {
      for(let predicate of predicates)  {
        if(!item.satisfiesPredicate(predicate)) {
          return false;
        }
      }
      return true;
    })

    return results;
  }


  /*
  Archives
  */

  async importItems(externalItems) {
    let itemsToBeMapped = [];
    // Get local values before doing any processing. This way, if a note change below modifies a tag,
    // and the tag is going to be iterated on in the same loop, then we don't want this change to be compared
    // to the local value.
    let localValues = {};
    for(let itemData of externalItems) {
      let localItem = this.findItem(itemData.uuid);
      if(!localItem) {
        localValues[itemData.uuid] = {};
        continue;
      }
      let frozenValue = this.duplicateItemWithoutAdding(localItem);
      localValues[itemData.uuid] = {frozenValue, itemRef: localItem};
    }

    for(let itemData of externalItems) {
      let {frozenValue, itemRef} = localValues[itemData.uuid];
      if(frozenValue && !itemRef.errorDecrypting) {
        // if the item already exists, check to see if it's different from the import data.
        // If it's the same, do nothing, otherwise, create a copy.
        let duplicate = await this.createDuplicateItemFromResponseItem(itemData);
        if(!itemData.deleted && !frozenValue.isItemContentEqualWith(duplicate)) {
          // Data differs
          this.addDuplicatedItemAsConflict({duplicate, duplicateOf: itemRef});
          itemsToBeMapped.push(duplicate);
        }
      } else {
        // it doesn't exist, push it into items to be mapped
        itemsToBeMapped.push(itemData);
        if(itemRef && itemRef.errorDecrypting) {
          itemRef.errorDecrypting = false;
        }
      }
    }

    let items = await this.mapResponseItemsToLocalModels(itemsToBeMapped, SFModelManager.MappingSourceFileImport);
    for(let item of items) {
      this.setItemDirty(item, true, false);
      item.deleted = false;
    }

    return items;
  }

  async getAllItemsJSONData(keys, authParams, returnNullIfEmpty) {
    return this.getJSONDataForItems(this.allItems, keys, authParams, returnNullIfEmpty);
  }

  async getJSONDataForItems(items, keys, authParams, returnNullIfEmpty) {
    return Promise.all(items.map((item) => {
      let itemParams = new SFItemParams(item, keys, authParams);
      return itemParams.paramsForExportFile();
    })).then((items) => {
      if(returnNullIfEmpty && items.length == 0) {
        return null;
      }

      let data = {items: items}

      if(keys) {
        // auth params are only needed when encrypted with a standard notes key
        data["auth_params"] = authParams;
      }

      return JSON.stringify(data, null, 2 /* pretty print */);
    })
  }

  async computeDataIntegrityHash() {
    try {
      let items = this.allNondummyItems.sort((a, b) => {
        return b.updated_at - a.updated_at;
      })
      let dates = items.map((item) => item.updatedAtTimestamp());
      let string = dates.join(",");
      let hash = await SNJS.crypto.sha256(string);
      return hash;
    } catch (e) {
      console.error("Error computing data integrity hash", e);
      return null;
    }
  }
}
;export class SFPrivilegesManager {

  constructor(modelManager, syncManager, singletonManager) {
    this.modelManager = modelManager;
    this.syncManager = syncManager;
    this.singletonManager = singletonManager;

    this.loadPrivileges();

    SFPrivilegesManager.CredentialAccountPassword = "CredentialAccountPassword";
    SFPrivilegesManager.CredentialLocalPasscode = "CredentialLocalPasscode";

    SFPrivilegesManager.ActionManageExtensions = "ActionManageExtensions";
    SFPrivilegesManager.ActionManageBackups = "ActionManageBackups";
    SFPrivilegesManager.ActionViewProtectedNotes = "ActionViewProtectedNotes";
    SFPrivilegesManager.ActionManagePrivileges = "ActionManagePrivileges";
    SFPrivilegesManager.ActionManagePasscode = "ActionManagePasscode";
    SFPrivilegesManager.ActionDeleteNote = "ActionDeleteNote";

    SFPrivilegesManager.SessionExpiresAtKey = "SessionExpiresAtKey";
    SFPrivilegesManager.SessionLengthKey = "SessionLengthKey";

    SFPrivilegesManager.SessionLengthNone = 0;
    SFPrivilegesManager.SessionLengthFiveMinutes = 300;
    SFPrivilegesManager.SessionLengthOneHour = 3600;
    SFPrivilegesManager.SessionLengthOneWeek = 604800;

    this.availableActions = [
      SFPrivilegesManager.ActionViewProtectedNotes,
      SFPrivilegesManager.ActionDeleteNote,
      SFPrivilegesManager.ActionManagePasscode,
      SFPrivilegesManager.ActionManageBackups,
      SFPrivilegesManager.ActionManageExtensions,
      SFPrivilegesManager.ActionManagePrivileges,
    ]

    this.availableCredentials = [
      SFPrivilegesManager.CredentialAccountPassword,
      SFPrivilegesManager.CredentialLocalPasscode
    ];

    this.sessionLengths = [
      SFPrivilegesManager.SessionLengthNone,
      SFPrivilegesManager.SessionLengthFiveMinutes,
      SFPrivilegesManager.SessionLengthOneHour,
      SFPrivilegesManager.SessionLengthOneWeek,
      SFPrivilegesManager.SessionLengthIndefinite
    ]
  }

  /*
  async delegate.isOffline()
  async delegate.hasLocalPasscode()
  async delegate.saveToStorage(key, value)
  async delegate.getFromStorage(key)
  async delegate.verifyAccountPassword
  async delegate.verifyLocalPasscode
  */
  setDelegate(delegate) {
    this.delegate = delegate;
  }

  getAvailableActions() {
    return this.availableActions;
  }

  getAvailableCredentials() {
    return this.availableCredentials;
  }

  async netCredentialsForAction(action) {
    let credentials = (await this.getPrivileges()).getCredentialsForAction(action);
    let netCredentials = [];

    for(var cred of credentials) {
      if(cred == SFPrivilegesManager.CredentialAccountPassword) {
        let isOffline = await this.delegate.isOffline();
        if(!isOffline) {
          netCredentials.push(cred);
        }
      } else if(cred == SFPrivilegesManager.CredentialLocalPasscode) {
        let hasLocalPasscode = await this.delegate.hasLocalPasscode();
        if(hasLocalPasscode) {
          netCredentials.push(cred);
        }
      }
    }

    return netCredentials;
  }

  async loadPrivileges() {
    if(this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      let privsContentType = SFPrivileges.contentType();
      let contentTypePredicate = new SFPredicate("content_type", "=", privsContentType);
      this.singletonManager.registerSingleton([contentTypePredicate], (resolvedSingleton) => {
        this.privileges = resolvedSingleton;
        resolve(resolvedSingleton);
      }, async (valueCallback) => {
        // Safe to create. Create and return object.
        var privs = new SFPrivileges({content_type: privsContentType});
        if(!SNJS.crypto.generateUUIDSync) {
          // If syncrounous implementaiton of UUID generation is not available (i.e mobile),
          // we need to manually init uuid asyncronously
          await privs.initUUID();
        }
        this.modelManager.addItem(privs);
        this.modelManager.setItemDirty(privs, true);
        this.syncManager.sync();
        valueCallback(privs);
        resolve(privs);
      });
    });

    return this.loadPromise;
  }

  async getPrivileges() {
    if(this.privileges) {
      return this.privileges;
    } else {
      return this.loadPrivileges();
    }
  }

  displayInfoForCredential(credential) {
    let metadata = {}

    metadata[SFPrivilegesManager.CredentialAccountPassword] = {
      label: "Account Password",
      prompt: "Please enter your account password."
    }

    metadata[SFPrivilegesManager.CredentialLocalPasscode] = {
      label: "Local Passcode",
      prompt: "Please enter your local passcode."
    }

    return metadata[credential];
  }

  displayInfoForAction(action) {
    let metadata = {};

    metadata[SFPrivilegesManager.ActionManageExtensions] = {
      label: "Manage Extensions"
    };

    metadata[SFPrivilegesManager.ActionManageBackups] = {
      label: "Download/Import Backups"
    };

    metadata[SFPrivilegesManager.ActionViewProtectedNotes] = {
      label: "View Protected Notes"
    };

    metadata[SFPrivilegesManager.ActionManagePrivileges] = {
      label: "Manage Privileges"
    };

    metadata[SFPrivilegesManager.ActionManagePasscode] = {
      label: "Manage Passcode"
    }

    metadata[SFPrivilegesManager.ActionDeleteNote] = {
      label: "Delete Notes"
    }

    return metadata[action];
  }

  getSessionLengthOptions() {
    return [
      {
        value: SFPrivilegesManager.SessionLengthNone,
        label: "Don't Remember"
      },
      {
        value: SFPrivilegesManager.SessionLengthFiveMinutes,
        label: "5 Minutes"
      },
      {
        value: SFPrivilegesManager.SessionLengthOneHour,
        label: "1 Hour"
      },
      {
        value: SFPrivilegesManager.SessionLengthOneWeek,
        label: "1 Week"
      }
    ]
  }

  async setSessionLength(length) {
    let addToNow = (seconds) => {
      let date = new Date();
      date.setSeconds(date.getSeconds() + seconds);
      return date;
    }

    let expiresAt = addToNow(length);

    return Promise.all([
      this.delegate.saveToStorage(SFPrivilegesManager.SessionExpiresAtKey, JSON.stringify(expiresAt)),
      this.delegate.saveToStorage(SFPrivilegesManager.SessionLengthKey, JSON.stringify(length))
    ])
  }

  async clearSession() {
    return this.setSessionLength(SFPrivilegesManager.SessionLengthNone);
  }

  async getSelectedSessionLength() {
    let length = await this.delegate.getFromStorage(SFPrivilegesManager.SessionLengthKey);
    if(length) {
      return JSON.parse(length);
    } else {
      return SFPrivilegesManager.SessionLengthNone;
    }
  }

  async getSessionExpirey() {
    let expiresAt = await this.delegate.getFromStorage(SFPrivilegesManager.SessionExpiresAtKey);
    if(expiresAt) {
      return new Date(JSON.parse(expiresAt));
    } else {
      return new Date();
    }
  }

  async actionHasPrivilegesConfigured(action) {
    return (await this.netCredentialsForAction(action)).length > 0;
  }

  async actionRequiresPrivilege(action) {
    let expiresAt = await this.getSessionExpirey();
    if(expiresAt > new Date()) {
      return false;
    }
    let netCredentials = await this.netCredentialsForAction(action);
    return netCredentials.length > 0;
  }

  async savePrivileges() {
    let privs = await this.getPrivileges();
    this.modelManager.setItemDirty(privs, true);
    this.syncManager.sync();
  }

  async authenticateAction(action, credentialAuthMapping) {
    var requiredCredentials = (await this.netCredentialsForAction(action));
    var successfulCredentials = [], failedCredentials = [];

    for(let requiredCredential of requiredCredentials) {
      var passesAuth = await this._verifyAuthenticationParameters(requiredCredential, credentialAuthMapping[requiredCredential]);
      if(passesAuth) {
        successfulCredentials.push(requiredCredential);
      } else {
        failedCredentials.push(requiredCredential);
      }
    }

    return {
      success: failedCredentials.length == 0,
      successfulCredentials: successfulCredentials,
      failedCredentials: failedCredentials
    }
  }

  async _verifyAuthenticationParameters(credential, value) {

    let verifyAccountPassword = async (password) => {
      return this.delegate.verifyAccountPassword(password);
    }

    let verifyLocalPasscode = async (passcode) => {
      return this.delegate.verifyLocalPasscode(passcode);
    }

    if(credential == SFPrivilegesManager.CredentialAccountPassword) {
      return verifyAccountPassword(value);
    } else if(credential == SFPrivilegesManager.CredentialLocalPasscode) {
      return verifyLocalPasscode(value);
    }
  }
}
;const SessionHistoryPersistKey = "sessionHistory_persist";
const SessionHistoryRevisionsKey = "sessionHistory_revisions";
const SessionHistoryAutoOptimizeKey = "sessionHistory_autoOptimize";

export class SFSessionHistoryManager {

  constructor(modelManager, storageManager, keyRequestHandler, contentTypes, timeout) {
    this.modelManager = modelManager;
    this.storageManager = storageManager;
    this.$timeout = timeout || setTimeout.bind(window);

    // Required to persist the encrypted form of SFHistorySession
    this.keyRequestHandler = keyRequestHandler;

    this.loadFromDisk().then(() => {
      this.modelManager.addItemSyncObserver("session-history", contentTypes, (allItems, validItems, deletedItems, source, sourceKey) => {
        if(source === SFModelManager.MappingSourceLocalDirtied) {
          return;
        }
        for(let item of allItems) {
          try {
            this.addHistoryEntryForItem(item);
          } catch (e) {
            console.log("Caught exception while trying to add item history entry", e);
          }
        }
      });
    })
  }

  async encryptionParams() {
    // Should return a dictionary: {offline, keys, auth_params}
    return this.keyRequestHandler();
  }

  addHistoryEntryForItem(item) {
    let persistableItemParams = {
      uuid: item.uuid,
      content_type: item.content_type,
      updated_at: item.updated_at,
      content: item.getContentCopy()
    }

    let entry = this.historySession.addEntryForItem(persistableItemParams);

    if(this.autoOptimize) {
      this.historySession.optimizeHistoryForItem(item);
    }

    if(entry && this.diskEnabled) {
      // Debounce, clear existing timeout
      if(this.diskTimeout) {
        if(this.$timeout.hasOwnProperty("cancel")) {
          this.$timeout.cancel(this.diskTimeout);
        } else {
          clearTimeout(this.diskTimeout);
        }
      };
      this.diskTimeout = this.$timeout(() => {
        this.saveToDisk();
      }, 2000)
    }
  }

  historyForItem(item) {
    return this.historySession.historyForItem(item);
  }

  async clearHistoryForItem(item) {
    this.historySession.clearItemHistory(item);
    return this.saveToDisk();
  }

  async clearAllHistory() {
    this.historySession.clearAllHistory();
    return this.storageManager.removeItem(SessionHistoryRevisionsKey);
  }

  async toggleDiskSaving() {
    this.diskEnabled = !this.diskEnabled;

    if(this.diskEnabled) {
      this.storageManager.setItem(SessionHistoryPersistKey, JSON.stringify(true));
      this.saveToDisk();
    } else {
      this.storageManager.setItem(SessionHistoryPersistKey, JSON.stringify(false));
      return this.storageManager.removeItem(SessionHistoryRevisionsKey);
    }
  }

  async saveToDisk() {
    if(!this.diskEnabled) {
      return;
    }

    let encryptionParams = await this.encryptionParams();

    var itemParams = new SFItemParams(this.historySession, encryptionParams.keys, encryptionParams.auth_params);
    itemParams.paramsForSync().then((syncParams) => {
      // console.log("Saving to disk", syncParams);
      this.storageManager.setItem(SessionHistoryRevisionsKey, JSON.stringify(syncParams));
    })
  }

  async loadFromDisk() {
    var diskValue = await this.storageManager.getItem(SessionHistoryPersistKey);
    if(diskValue) {
      this.diskEnabled = JSON.parse(diskValue);
    }

    var historyValue = await this.storageManager.getItem(SessionHistoryRevisionsKey);
    if(historyValue) {
      historyValue = JSON.parse(historyValue);
      let encryptionParams = await this.encryptionParams();
      await SNJS.itemTransformer.decryptItem(historyValue, encryptionParams.keys);
      var historySession = new SFHistorySession(historyValue);
      this.historySession = historySession;
    } else {
      this.historySession = new SFHistorySession();
    }

    var autoOptimizeValue = await this.storageManager.getItem(SessionHistoryAutoOptimizeKey);
    if(autoOptimizeValue) {
      this.autoOptimize = JSON.parse(autoOptimizeValue);
    } else {
      // default value is true
      this.autoOptimize = true;
    }
  }

  async toggleAutoOptimize() {
    this.autoOptimize = !this.autoOptimize;

    if(this.autoOptimize) {
      this.storageManager.setItem(SessionHistoryAutoOptimizeKey, JSON.stringify(true));
    } else {
      this.storageManager.setItem(SessionHistoryAutoOptimizeKey, JSON.stringify(false));
    }
  }
}
;/*
  The SingletonManager allows controllers to register an item as a singleton, which means only one instance of that model
  should exist, both on the server and on the client. When the SingletonManager detects multiple items matching the singleton predicate,
  the oldest ones will be deleted, leaving the newest ones. (See 4/28/18 update. We now choose the earliest created one as the winner.).

  (This no longer fully applies, See 4/28/18 update.) We will treat the model most recently arrived from the server as the most recent one. The reason for this is,
  if you're offline, a singleton can be created, as in the case of UserPreferneces. Then when you sign in, you'll retrieve your actual user preferences.
  In that case, even though the offline singleton has a more recent updated_at, the server retreived value is the one we care more about.

  4/28/18: I'm seeing this issue: if you have the app open in one window, then in another window sign in, and during sign in,
  click Refresh (or autorefresh occurs) in the original signed in window, then you will happen to receive from the server the newly created
  Extensions singleton, and it will be mistaken (it just looks like a regular retrieved item, since nothing is in saved) for a fresh, latest copy, and replace the current instance.
  This has happened to me and many users.
  A puzzling issue, but what if instead of resolving singletons by choosing the one most recently modified, we choose the one with the earliest create date?
  This way, we don't care when it was modified, but we always, always choose the item that was created first. This way, we always deal with the same item.
*/

export class SFSingletonManager {

  constructor(modelManager, syncManager) {
    this.syncManager = syncManager;
    this.modelManager = modelManager;
    this.singletonHandlers = [];

    // We use sync observer instead of syncEvent `local-data-incremental-load`, because we want singletons
    // to resolve with the first priority, because they generally dictate app state.
    // If we used local-data-incremental-load, and 1 item was important singleton and 99 were heavy components,
    // then given the random nature of notifiying observers, the heavy components would spend a lot of time loading first,
    // here, we priortize ours loading as most important
    modelManager.addItemSyncObserverWithPriority({
      id: "sf-singleton-manager",
      types: "*",
      priority: -1,
      callback: (allItems, validItems, deletedItems, source, sourceKey) => {
        // Inside resolveSingletons, we are going to set items as dirty. If we don't stop here it will be infinite recursion.
        if(source === SFModelManager.MappingSourceLocalDirtied) {
          return;
        }
        this.resolveSingletons(modelManager.allNondummyItems, null, true);
      }
    })

    syncManager.addEventHandler((syncEvent, data) => {
      if(syncEvent == "local-data-loaded") {
        this.resolveSingletons(modelManager.allNondummyItems, null, true);
        this.initialDataLoaded = true;
      } else if(syncEvent == "sync:completed") {
        // Wait for initial data load before handling any sync. If we don't want for initial data load,
        // then the singleton resolver won't have the proper items to work with to determine whether to resolve or create.
        if(!this.initialDataLoaded) {
          return;
        }
        // The reason we also need to consider savedItems in consolidating singletons is in case of sync conflicts,
        // a new item can be created, but is never processed through "retrievedItems" since it is only created locally then saved.

        // HOWEVER, by considering savedItems, we are now ruining everything, especially during sign in. A singleton can be created
        // offline, and upon sign in, will sync all items to the server, and by combining retrievedItems & savedItems, and only choosing
        // the latest, you are now resolving to the most recent one, which is in the savedItems list and not retrieved items, defeating
        // the whole purpose of this thing.

        // Updated solution: resolveSingletons will now evaluate both of these arrays separately.
        this.resolveSingletons(data.retrievedItems, data.savedItems);
      }
    });

    /*
      If an item alternates its uuid on registration, singletonHandlers might need to update
      their local reference to the object, since the object reference will change on uuid alternation
    */
    modelManager.addModelUuidChangeObserver("singleton-manager", (oldModel, newModel) => {
      for(let handler of this.singletonHandlers) {
        if(handler.singleton && SFPredicate.ItemSatisfiesPredicates(newModel, handler.predicates)) {
          // Reference is now invalid, calling resolveSingleton should update it
          handler.singleton = null;
          this.resolveSingletons([newModel]);
        }
      }
    })
  }

  registerSingleton(predicates, resolveCallback, createBlock) {
    /*
    predicate: a key/value pair that specifies properties that should match in order for an item to be considered a predicate
    resolveCallback: called when one or more items are deleted and a new item becomes the reigning singleton
    createBlock: called when a sync is complete and no items are found. The createBlock should create the item and return it.
    */
    this.singletonHandlers.push({
      predicates: predicates,
      resolutionCallback: resolveCallback,
      createBlock: createBlock
    });
  }

  resolveSingletons(retrievedItems, savedItems, initialLoad) {
    retrievedItems = retrievedItems || [];
    savedItems = savedItems || [];

    for(let singletonHandler of this.singletonHandlers) {
      let predicates = singletonHandler.predicates.slice();
      let retrievedSingletonItems = this.modelManager.filterItemsWithPredicates(retrievedItems, predicates);

      let handleCreation = () => {
        if(singletonHandler.createBlock) {
          singletonHandler.pendingCreateBlockCallback = true;
          singletonHandler.createBlock((created) => {
            singletonHandler.singleton = created;
            singletonHandler.pendingCreateBlockCallback = false;
            singletonHandler.resolutionCallback && singletonHandler.resolutionCallback(created);
          });
        }
      }

      // We only want to consider saved items count to see if it's more than 0, and do nothing else with it.
      // This way we know there was some action and things need to be resolved. The saved items will come up
      // in filterItemsWithPredicate(this.modelManager.allNondummyItems) and be deleted anyway
      let savedSingletonItemsCount = this.modelManager.filterItemsWithPredicates(savedItems, predicates).length;

      if(retrievedSingletonItems.length > 0 || savedSingletonItemsCount > 0) {
        /*
          Check local inventory and make sure only 1 similar item exists. If more than 1, delete newest
          Note that this local inventory will also contain whatever is in retrievedItems.
        */
        let allExtantItemsMatchingPredicate = this.modelManager.itemsMatchingPredicates(predicates);

        /*
          Delete all but the earliest created
        */
        if(allExtantItemsMatchingPredicate.length >= 2) {
          let sorted = allExtantItemsMatchingPredicate.sort((a, b) => {
            /*
              If compareFunction(a, b) is less than 0, sort a to an index lower than b, i.e. a comes first.
              If compareFunction(a, b) is greater than 0, sort b to an index lower than a, i.e. b comes first.
            */

            if(a.errorDecrypting) {
              return 1;
            }

            if(b.errorDecrypting) {
              return -1;
            }

            return a.created_at < b.created_at ? -1 : 1;
          });

          // The item that will be chosen to be kept
          let winningItem = sorted[0];

          // Items that will be deleted
          // Delete everything but the first one
          let toDelete = sorted.slice(1, sorted.length);

          for(let d of toDelete) {
            this.modelManager.setItemToBeDeleted(d);
          }

          this.syncManager.sync();

          // Send remaining item to callback
          singletonHandler.singleton = winningItem;
          singletonHandler.resolutionCallback && singletonHandler.resolutionCallback(winningItem);

        } else if(allExtantItemsMatchingPredicate.length == 1) {
          let singleton = allExtantItemsMatchingPredicate[0];
          if(singleton.errorDecrypting) {
            // Delete the current singleton and create a new one
            this.modelManager.setItemToBeDeleted(singleton);
            handleCreation();
          }
          else if(!singletonHandler.singleton || singletonHandler.singleton !== singleton) {
            // Not yet notified interested parties of object
            singletonHandler.singleton = singleton;
            singletonHandler.resolutionCallback && singletonHandler.resolutionCallback(singleton);
          }
        }
      } else {
        // Retrieved items does not include any items of interest. If we don't have a singleton registered to this handler,
        // we need to create one. Only do this on actual sync completetions and not on initial data load. Because we want
        // to get the latest from the server before making the decision to create a new item
        if(!singletonHandler.singleton && !initialLoad && !singletonHandler.pendingCreateBlockCallback) {
          handleCreation();
        }
      }
    }
  }
}
;// SFStorageManager should be subclassed, and all the methods below overwritten.

export class SFStorageManager {

  /* Simple Key/Value Storage */

  async setItem(key, value) {

  }

  async getItem(key) {

  }

  async removeItem(key) {

  }

  async clear() {
    // clear only simple key/values
  }

  /*
  Model Storage
  */

  async getAllModels() {

  }

  async saveModel(item) {
    return this.saveModels([item]);
  }

  async saveModels(items) {

  }

  async deleteModel(item) {

  }

  async clearAllModels() {
    // clear only models
  }

  /* General */

  async clearAllData() {
    return Promise.all([
      this.clear(),
      this.clearAllModels()
    ])
  }
}
;export class SFSyncManager {

  constructor(modelManager, storageManager, httpManager, timeout, interval) {

    SFSyncManager.KeyRequestLoadLocal = "KeyRequestLoadLocal";
    SFSyncManager.KeyRequestSaveLocal = "KeyRequestSaveLocal";
    SFSyncManager.KeyRequestLoadSaveAccount = "KeyRequestLoadSaveAccount";

    this.httpManager = httpManager;
    this.modelManager = modelManager;
    this.storageManager = storageManager;

    // Allows you to set your own interval/timeout function (i.e if you're using angular and want to use $timeout)
    this.$interval = interval || setInterval.bind(window);
    this.$timeout = timeout || setTimeout.bind(window);

    this.syncStatus = {};
    this.syncStatusObservers = [];
    this.eventHandlers = [];

    // this.loggingEnabled = true;

    this.PerSyncItemUploadLimit = 150;
    this.ServerItemDownloadLimit = 150;

    // The number of changed items that constitute a major change
    // This is used by the desktop app to create backups
    this.MajorDataChangeThreshold = 15;

    // Sync integrity checking
    // If X consective sync requests return mismatching hashes, then we officially enter out-of-sync.
    this.MaxDiscordanceBeforeOutOfSync = 5;

    // How many consective sync results have had mismatching hashes. This value can never exceed this.MaxDiscordanceBeforeOutOfSync.
    this.syncDiscordance = 0;
    this.outOfSync = false;
  }

  async handleServerIntegrityHash(serverHash) {
    if(!serverHash || serverHash.length == 0) {
      return true;
    }

    let localHash = await this.modelManager.computeDataIntegrityHash();

    // if localHash is null, it means computation failed. We can do nothing but return true for success here
    if(!localHash) {
      return true;
    }

    if(localHash !== serverHash) {
      this.syncDiscordance++;
      if(this.syncDiscordance >= this.MaxDiscordanceBeforeOutOfSync) {
        if(!this.outOfSync) {
          this.outOfSync = true;
          this.notifyEvent("enter-out-of-sync");
        }
      }
      return false;
    } else {
      // Integrity matches
      if(this.outOfSync) {
        this.outOfSync = false;
        this.notifyEvent("exit-out-of-sync");
      }
      this.syncDiscordance = 0;
      return true;
    }
  }

  isOutOfSync() {
    // Once we are outOfSync, it's up to the client to display UI to the user to instruct them
    // to take action. The client should present a reconciliation wizard.
    return this.outOfSync;
  }

  async getServerURL() {
    return await this.storageManager.getItem("server") || window._default_sf_server;
  }

  async getSyncURL() {
    return await this.getServerURL() + "/items/sync";
  }

  registerSyncStatusObserver(callback) {
    let observer = {key: new Date(), callback: callback};
    this.syncStatusObservers.push(observer);
    return observer;
  }

  removeSyncStatusObserver(observer) {
    _.pull(this.syncStatusObservers, observer);
  }

  syncStatusDidChange() {
    this.syncStatusObservers.forEach((observer) => {
      observer.callback(this.syncStatus);
    })
  }

  addEventHandler(handler) {
    /*
    Possible Events:
    sync:completed
    sync:taking-too-long
    sync:updated_token
    sync:error
    major-data-change
    local-data-loaded
    sync-session-invalid
    sync-exception
     */
    this.eventHandlers.push(handler);
    return handler;
  }

  removeEventHandler(handler) {
    _.pull(this.eventHandlers, handler);
  }

  notifyEvent(syncEvent, data) {
    for(let handler of this.eventHandlers) {
      handler(syncEvent, data || {});
    }
  }

  setKeyRequestHandler(handler) {
    this.keyRequestHandler = handler;
  }

  async getActiveKeyInfo(request) {
    // request can be one of [KeyRequestSaveLocal, KeyRequestLoadLocal, KeyRequestLoadSaveAccount]
    // keyRequestHandler is set externally by using class. It should return an object of this format:
    /*
    {
      keys: {pw, mk, ak}
      auth_params,
      offline: true/false
    }
    */
    return this.keyRequestHandler(request);
  }

  initialDataLoaded() {
    return this._initialDataLoaded === true;
  }

  _sortLocalItems(items) {
    return items.sort((a,b) => {
      let dateResult = new Date(b.updated_at) - new Date(a.updated_at);

      let priorityList = this.contentTypeLoadPriority;
      let aPriority = 0, bPriority = 0;
      if(priorityList) {
        aPriority = priorityList.indexOf(a.content_type);
        bPriority = priorityList.indexOf(b.content_type);
        if(aPriority == -1) {
          // Not found in list, not prioritized. Set it to max value
          aPriority = priorityList.length;
        }
        if(bPriority == -1) {
          // Not found in list, not prioritized. Set it to max value
          bPriority = priorityList.length;
        }
      }

      if(aPriority == bPriority) {
        return dateResult;
      }

      if(aPriority < bPriority) {
        return -1;
      } else {
        return 1;
      }

      // aPriority < bPriority means a should come first
      return aPriority < bPriority ? -1 : 1;
    })
  }

  async loadLocalItems({incrementalCallback, batchSize, options} = {}) {
    // Used for testing
    if(options && options.simulateHighLatency) {
      let latency = options.simulatedLatency || 1000;
      await this._awaitSleep(latency);
    }

    if(this.loadLocalDataPromise) {
      return this.loadLocalDataPromise;
    }

    if(!batchSize) { batchSize = 100;}

    this.loadLocalDataPromise = this.storageManager.getAllModels().then((items) => {
      // put most recently updated at beginning, sorted by priority
      items = this._sortLocalItems(items);

      // Filter out any items that exist in the local model mapping and have a lower dirtied date than the local dirtiedDate.
      items = items.filter((nonDecryptedItem) => {
        let localItem = this.modelManager.findItem(nonDecryptedItem.uuid);
        if(!localItem) {
          return true;
        }

        return new Date(nonDecryptedItem.dirtiedDate) > localItem.dirtiedDate;
      })

      // break it up into chunks to make interface more responsive for large item counts
      let total = items.length;
      let current = 0;
      let processed = [];

      let decryptNext = async () => {
        let subitems = items.slice(current, current + batchSize);
        let processedSubitems = await this.handleItemsResponse(subitems, null, SFModelManager.MappingSourceLocalRetrieved, SFSyncManager.KeyRequestLoadLocal);
        processed.push(processedSubitems);

        current += subitems.length;

        if(current < total) {
          return new Promise((innerResolve, innerReject) => {
            this.$timeout(() => {
              this.notifyEvent("local-data-incremental-load");
              incrementalCallback && incrementalCallback(current, total);
              decryptNext().then(innerResolve);
            });
          });
        } else {
          // Completed
          this._initialDataLoaded = true;
          this.notifyEvent("local-data-loaded");
        }
      }

      return decryptNext();
    })

    return this.loadLocalDataPromise;
  }

  async writeItemsToLocalStorage(items, offlineOnly) {
    if(items.length == 0) {
      return;
    }

    return new Promise(async (resolve, reject) => {
      let nonDeletedItems = [], deletedItems = [];
      for(let item of items) {
        // if the item is deleted and dirty it means we still need to sync it.
        if(item.deleted === true && !item.dirty) {deletedItems.push(item);}
        else {nonDeletedItems.push(item);}
      }

      if(deletedItems.length > 0) {
        await Promise.all(deletedItems.map(async (deletedItem) => {
          return this.storageManager.deleteModel(deletedItem);
        }))
      }

      let info = await this.getActiveKeyInfo(SFSyncManager.KeyRequestSaveLocal);

      if(nonDeletedItems.length > 0) {
        let params = await Promise.all(nonDeletedItems.map(async (item) => {
          let itemParams = new SFItemParams(item, info.keys, info.auth_params);
          itemParams = await itemParams.paramsForLocalStorage();
          if(offlineOnly) {
            delete itemParams.dirty;
          }
          return itemParams;
        })).catch((e) => reject(e));

        await this.storageManager.saveModels(params).catch((error) => {
          console.error("Error writing items", error);
          this.syncStatus.localError = error;
          this.syncStatusDidChange();
          reject();
        });

        // on success
        if(this.syncStatus.localError) {
          this.syncStatus.localError = null;
          this.syncStatusDidChange();
        }
      }
      resolve();
    })
  }

  async syncOffline(items) {
    // Update all items updated_at to now
    for(let item of items) { item.updated_at = new Date(); }
    return this.writeItemsToLocalStorage(items, true).then((responseItems) => {
      // delete anything needing to be deleted
      for(let item of items) {
        if(item.deleted) { this.modelManager.removeItemLocally(item);}
      }

      this.modelManager.clearDirtyItems(items);
      // Required in order for modelManager to notify sync observers
      this.modelManager.didSyncModelsOffline(items);

      this.notifyEvent("sync:completed", {savedItems: items});
      return {saved_items: items};
    })
  }

  /*
    In the case of signing in and merging local data, we alternative UUIDs
    to avoid overwriting data a user may retrieve that has the same UUID.
    Alternating here forces us to to create duplicates of the items instead.
   */
  async markAllItemsDirtyAndSaveOffline(alternateUUIDs) {

    if(alternateUUIDs) {
      // use a copy, as alternating uuid will affect array
      let originalItems = this.modelManager.allNondummyItems.filter((item) => {return !item.errorDecrypting}).slice();
      for(let item of originalItems) {
        // Update: the last params has been removed. Defaults to true.
        // Old: alternateUUIDForItem last param is a boolean that controls whether the original item
        // should be removed locally after new item is created. We set this to true, since during sign in,
        // all item ids are alternated, and we only want one final copy of the entire data set.
        // Passing false can be desired sometimes, when for example the app has signed out the user,
        // but for some reason retained their data (This happens in Firefox when using private mode).
        // In this case, we should pass false so that both copies are kept. However, it's difficult to
        // detect when the app has entered this state. We will just use true to remove original items for now.
        await this.modelManager.alternateUUIDForItem(item);
      }
    }

    let allItems = this.modelManager.allNondummyItems;
    for(let item of allItems) { item.setDirty(true); }
    return this.writeItemsToLocalStorage(allItems, false);
  }

  async setSyncToken(token) {
    this._syncToken = token;
    await this.storageManager.setItem("syncToken", token);
  }

  async getSyncToken() {
    if(!this._syncToken) {
      this._syncToken = await this.storageManager.getItem("syncToken");
    }
    return this._syncToken;
  }

  async setCursorToken(token) {
    this._cursorToken = token;
    if(token) {
      await this.storageManager.setItem("cursorToken", token);
    } else {
      await this.storageManager.removeItem("cursorToken");
    }
  }

  async getCursorToken() {
    if(!this._cursorToken) {
      this._cursorToken = await this.storageManager.getItem("cursorToken");
    }
    return this._cursorToken;
  }

  get queuedCallbacks() {
    if(!this._queuedCallbacks) {
      this._queuedCallbacks = [];
    }
    return this._queuedCallbacks;
  }

  clearQueuedCallbacks() {
    this._queuedCallbacks = [];
  }

  callQueuedCallbacks(response) {
    let allCallbacks = this.queuedCallbacks;
    if(allCallbacks.length) {
      for(let eachCallback of allCallbacks) {
        eachCallback(response);
      }
      this.clearQueuedCallbacks();
    }
  }

  beginCheckingIfSyncIsTakingTooLong() {
    if(this.syncStatus.checker) {
      this.stopCheckingIfSyncIsTakingTooLong();
    }
    this.syncStatus.checker = this.$interval(function(){
      // check to see if the ongoing sync is taking too long, alert the user
      let secondsPassed = (new Date() - this.syncStatus.syncStart) / 1000;
      let warningThreshold = 5.0; // seconds
      if(secondsPassed > warningThreshold) {
        this.notifyEvent("sync:taking-too-long");
        this.stopCheckingIfSyncIsTakingTooLong();
      }
    }.bind(this), 500)
  }

  stopCheckingIfSyncIsTakingTooLong() {
    if(this.$interval.hasOwnProperty("cancel")) {
      this.$interval.cancel(this.syncStatus.checker);
    } else {
      clearInterval(this.syncStatus.checker);
    }
    this.syncStatus.checker = null;
  }

  lockSyncing() {
    this.syncLocked = true;
  }

  unlockSyncing() {
    this.syncLocked = false;
  }

  async sync(options = {}) {
    if(this.syncLocked) {
      console.log("Sync Locked, Returning;");
      return;
    }

    return new Promise(async (resolve, reject) => {

      if(!options) options = {};

      let allDirtyItems = this.modelManager.getDirtyItems();
      let dirtyItemsNotYetSaved = allDirtyItems.filter((candidate) => {
        return !this.lastDirtyItemsSave || (candidate.dirtiedDate > this.lastDirtyItemsSave);
      })

      let info = await this.getActiveKeyInfo(SFSyncManager.KeyRequestLoadSaveAccount);

      let isSyncInProgress = this.syncStatus.syncOpInProgress;
      let initialDataLoaded = this.initialDataLoaded();

      if(isSyncInProgress || !initialDataLoaded) {
        this.performSyncAgainOnCompletion = true;
        this.lastDirtyItemsSave = new Date();
        await this.writeItemsToLocalStorage(dirtyItemsNotYetSaved, false);
        if(isSyncInProgress) {
          this.queuedCallbacks.push(resolve);
          if(this.loggingEnabled) {
            console.warn("Attempting to sync while existing sync is in progress.");
          }
        }
        if(!initialDataLoaded) {
          if(this.loggingEnabled) {
            console.warn("(1) Attempting to perform online sync before local data has loaded");
          }
          // Resolve right away, as we can't be sure when local data will be called by consumer.
          resolve();
        }
        return;
      }

      // Set this value immediately after checking it above, to avoid race conditions.
      this.syncStatus.syncOpInProgress = true;

      if(info.offline) {
        return this.syncOffline(allDirtyItems).then((response) => {
          this.syncStatus.syncOpInProgress = false;
          resolve(response);
        }).catch((e) => {
          this.notifyEvent("sync-exception", e);
        })
      }

      if(!this.initialDataLoaded()) {
        console.error("Attempting to perform online sync before local data has loaded");
        return;
      }

      if(this.loggingEnabled) {
        console.log("Syncing online user.");
      }

      let isContinuationSync = this.syncStatus.needsMoreSync;
      this.syncStatus.syncStart = new Date();
      this.beginCheckingIfSyncIsTakingTooLong();

      let submitLimit = this.PerSyncItemUploadLimit;
      let subItems = allDirtyItems.slice(0, submitLimit);
      if(subItems.length < allDirtyItems.length) {
        // more items left to be synced, repeat
        this.syncStatus.needsMoreSync = true;
      } else {
        this.syncStatus.needsMoreSync = false;
      }

      if(!isContinuationSync) {
        this.syncStatus.total = allDirtyItems.length;
        this.syncStatus.current = 0;
      }

      // If items are marked as dirty during a long running sync request, total isn't updated
      // This happens mostly in the case of large imports and sync conflicts where duplicated items are created
      if(this.syncStatus.current > this.syncStatus.total) {
        this.syncStatus.total = this.syncStatus.current;
      }

      this.syncStatusDidChange();

      // Perform save after you've updated all status signals above. Presync save can take several seconds in some cases.
      // Write to local storage before beginning sync.
      // This way, if they close the browser before the sync request completes, local changes will not be lost
      await this.writeItemsToLocalStorage(dirtyItemsNotYetSaved, false);
      this.lastDirtyItemsSave = new Date();

      if(options.onPreSyncSave) {
        options.onPreSyncSave();
      }

      // when doing a sync request that returns items greater than the limit, and thus subsequent syncs are required,
      // we want to keep track of all retreived items, then save to local storage only once all items have been retrieved,
      // so that relationships remain intact
      // Update 12/18: I don't think we need to do this anymore, since relationships will now retroactively resolve their relationships,
      // if an item they were looking for hasn't been pulled in yet.
      if(!this.allRetreivedItems) {
        this.allRetreivedItems = [];
      }

      // We also want to do this for savedItems
      if(!this.allSavedItems) {
        this.allSavedItems = [];
      }

      let params = {};
      params.limit = this.ServerItemDownloadLimit;

      if(options.performIntegrityCheck) {
        params.compute_integrity = true;
      }

      try {
        await Promise.all(subItems.map((item) => {
          let itemParams = new SFItemParams(item, info.keys, info.auth_params);
          itemParams.additionalFields = options.additionalFields;
          return itemParams.paramsForSync();
        })).then((itemsParams) => {
          params.items = itemsParams;
        })
      } catch (e) {
        this.notifyEvent("sync-exception", e);
      }

      for(let item of subItems) {
        // Reset dirty counter to 0, since we're about to sync it.
        // This means anyone marking the item as dirty after this will cause it so sync again and not be cleared on sync completion.
        item.dirtyCount = 0;
      }

      params.sync_token = await this.getSyncToken();
      params.cursor_token = await this.getCursorToken();

      params['api'] = SFHttpManager.getApiVersion();

      if(this.loggingEnabled)  {
        console.log("Syncing with params", params);
      }

      try {
        this.httpManager.postAuthenticatedAbsolute(await this.getSyncURL(), params, (response) => {
          this.handleSyncSuccess(subItems, response, options).then(() => {
            resolve(response);
          }).catch((e) => {
            console.log("Caught sync success exception:", e);
            this.handleSyncError(e, null, allDirtyItems).then((errorResponse) => {
              this.notifyEvent("sync-exception", e);
              resolve(errorResponse);
            });
          });
        }, (response, statusCode) => {
          this.handleSyncError(response, statusCode, allDirtyItems).then((errorResponse) => {
            resolve(errorResponse);
          });
        });
      }
      catch(e) {
        console.log("Sync exception caught:", e);
      }
    });
  }

  async _awaitSleep(durationInMs) {
    console.warn("Simulating high latency sync request", durationInMs);
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        resolve();
      }, durationInMs);
    })
  }

  async handleSyncSuccess(syncedItems, response, options) {
    // Used for testing
    if(options.simulateHighLatency) {
      let latency = options.simulatedLatency || 1000;
      await this._awaitSleep(latency);
    }

    this.syncStatus.error = null;

    if(this.loggingEnabled) {
      console.log("Sync response", response);
    }

    let allSavedUUIDs = this.allSavedItems.map((item) => item.uuid);
    let currentRequestSavedUUIDs = response.saved_items.map((savedResponse) => savedResponse.uuid);

    response.retrieved_items = response.retrieved_items.filter((retrievedItem) => {
      let isInPreviousSaved = allSavedUUIDs.includes(retrievedItem.uuid);
      let isInCurrentSaved = currentRequestSavedUUIDs.includes(retrievedItem.uuid);
      if(isInPreviousSaved || isInCurrentSaved) {
        return false;
      }

      let localItem = this.modelManager.findItem(retrievedItem.uuid);
      if(localItem && localItem.dirty) {
        return false;
      }
      return true;
    });

    // Clear dirty items after we've finish filtering retrieved_items above, since that depends on dirty items.
    // Check to make sure any subItem hasn't been marked as dirty again while a sync was ongoing
    let itemsToClearAsDirty = [];
    for(let item of syncedItems) {
      if(item.dirtyCount == 0) {
        // Safe to clear as dirty
        itemsToClearAsDirty.push(item);
      }
    }

    this.modelManager.clearDirtyItems(itemsToClearAsDirty);

    // Map retrieved items to local data
    // Note that deleted items will not be returned
    let retrieved = await this.handleItemsResponse(response.retrieved_items, null, SFModelManager.MappingSourceRemoteRetrieved, SFSyncManager.KeyRequestLoadSaveAccount);

    // Append items to master list of retrieved items for this ongoing sync operation
    this.allRetreivedItems = this.allRetreivedItems.concat(retrieved);
    this.syncStatus.retrievedCount = this.allRetreivedItems.length;

    // Merge only metadata for saved items
    // we write saved items to disk now because it clears their dirty status then saves
    // if we saved items before completion, we had have to save them as dirty and save them again on success as clean
    let omitFields = ["content", "auth_hash"];

    // Map saved items to local data
    let saved = await this.handleItemsResponse(response.saved_items, omitFields, SFModelManager.MappingSourceRemoteSaved, SFSyncManager.KeyRequestLoadSaveAccount);

    // Append items to master list of saved items for this ongoing sync operation
    this.allSavedItems = this.allSavedItems.concat(saved);

    // 'unsaved' is deprecated and replaced with 'conflicts' in newer version.
    let deprecated_unsaved = response.unsaved;
    await this.deprecated_handleUnsavedItemsResponse(deprecated_unsaved);

    let conflicts = await this.handleConflictsResponse(response.conflicts);

    let conflictsNeedSync = conflicts && conflicts.length > 0;
    if(conflicts) {
      await this.writeItemsToLocalStorage(conflicts, false);
    }
    await this.writeItemsToLocalStorage(saved, false);
    await this.writeItemsToLocalStorage(retrieved, false);

    // if a cursor token is available, dont perform integrity calculation,
    // as content is still on the server waiting to be downloaded
    if(response.integrity_hash && !response.cursor_token) {
      let matches = await this.handleServerIntegrityHash(response.integrity_hash);
      if(!matches) {
        // If the server hash doesn't match our local hash, we want to continue syncing until we reach
        // the max discordance threshold
        if(this.syncDiscordance < this.MaxDiscordanceBeforeOutOfSync) {
          this.performSyncAgainOnCompletion = true;
        }
      }
    }

    this.syncStatus.syncOpInProgress = false;
    this.syncStatus.current += syncedItems.length;

    this.syncStatusDidChange();

    // set the sync token at the end, so that if any errors happen above, you can resync
    this.setSyncToken(response.sync_token);
    this.setCursorToken(response.cursor_token);

    this.stopCheckingIfSyncIsTakingTooLong();

    let cursorToken = await this.getCursorToken();
    if(cursorToken || this.syncStatus.needsMoreSync) {
      return new Promise((resolve, reject) => {
        setTimeout(function () {
          this.sync(options).then(resolve);
        }.bind(this), 10); // wait 10ms to allow UI to update
      })
    }

    else if(conflictsNeedSync) {
      // We'll use the conflict sync as the next sync, so performSyncAgainOnCompletion can be turned off.
      this.performSyncAgainOnCompletion = false;
      // Include as part of await/resolve chain
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          this.sync(options).then(resolve);
        }, 10); // wait 10ms to allow UI to update
      });
    }

    else {
      this.syncStatus.retrievedCount = 0;

      // current and total represent what's going up, not what's come down or saved.
      this.syncStatus.current = 0
      this.syncStatus.total = 0

      this.syncStatusDidChange();

      if(
        this.allRetreivedItems.length >= this.majorDataChangeThreshold ||
        saved.length >= this.majorDataChangeThreshold ||
        (deprecated_unsaved && deprecated_unsaved.length >= this.majorDataChangeThreshold) ||
        (conflicts && conflicts.length >= this.majorDataChangeThreshold)
      ) {
        this.notifyEvent("major-data-change");
      }

      this.callQueuedCallbacks(response);
      this.notifyEvent("sync:completed", {retrievedItems: this.allRetreivedItems, savedItems: this.allSavedItems});

      this.allRetreivedItems = [];
      this.allSavedItems = [];

      if(this.performSyncAgainOnCompletion) {
        this.performSyncAgainOnCompletion = false;
        setTimeout(() => {
          this.sync(options);
        }, 10); // wait 10ms to allow UI to update
      }

      return response;
    }
  }

  async handleSyncError(response, statusCode, allDirtyItems) {
    console.log("Sync error: ", response);

    if(statusCode == 401) {
      this.notifyEvent("sync-session-invalid");
    }

    if(!response) {
      response = {error: {message: "Could not connect to server."}};
    } else if(typeof response == 'string') {
      response = {error: {message: response}};
    }

    this.syncStatus.syncOpInProgress = false;
    this.syncStatus.error = response.error;
    this.syncStatusDidChange();

    this.writeItemsToLocalStorage(allDirtyItems, false);
    this.modelManager.didSyncModelsOffline(allDirtyItems);

    this.stopCheckingIfSyncIsTakingTooLong();

    this.notifyEvent("sync:error", response.error);

    this.callQueuedCallbacks({error: "Sync error"});

    return response;
  }

  async handleItemsResponse(responseItems, omitFields, source, keyRequest) {
    let keys = (await this.getActiveKeyInfo(keyRequest)).keys;
    await SNJS.itemTransformer.decryptMultipleItems(responseItems, keys);
    let items = await this.modelManager.mapResponseItemsToLocalModelsOmittingFields(responseItems, omitFields, source);

    // During the decryption process, items may be marked as "errorDecrypting". If so, we want to be sure
    // to persist this new state by writing these items back to local storage. When an item's "errorDecrypting"
    // flag is changed, its "errorDecryptingValueChanged" flag will be set, so we can find these items by filtering (then unsetting) below:
    let itemsWithErrorStatusChange = items.filter((item) => {
      let valueChanged = item.errorDecryptingValueChanged;
      // unset after consuming value
      item.errorDecryptingValueChanged = false;
      return valueChanged;
    });
    if(itemsWithErrorStatusChange.length > 0) {
      this.writeItemsToLocalStorage(itemsWithErrorStatusChange, false);
    }

    return items;
  }

  async refreshErroredItems() {
    let erroredItems = this.modelManager.allNondummyItems.filter((item) => {return item.errorDecrypting == true});
    if(erroredItems.length > 0) {
      return this.handleItemsResponse(erroredItems, null, SFModelManager.MappingSourceLocalRetrieved, SFSyncManager.KeyRequestLoadSaveAccount);
    }
  }

  /*
  The difference between 'unsaved' (deprecated_handleUnsavedItemsResponse) and 'conflicts' (handleConflictsResponse) is that
  with unsaved items, the local copy is triumphant on the server, and we check the server copy to see if we should
  create it as a duplicate. This is for the legacy API where it would save what you sent the server no matter its value,
  and the client would decide what to do with the previous server value.

  handleConflictsResponse on the other hand handles where the local copy save was not triumphant on the server.
  Instead the conflict includes the server item. Here we immediately map the server value onto our local value,
  but before that, we give our local value a chance to duplicate itself if it differs from the server value.
  */
  async handleConflictsResponse(conflicts) {
    if(!conflicts || conflicts.length == 0) { return; }

    if(this.loggingEnabled) {
      console.log("Handle Conflicted Items:", conflicts);
    }

    // Get local values before doing any processing. This way, if a note change below modifies a tag,
    // and the tag is going to be iterated on in the same loop, then we don't want this change to be compared
    // to the local value.
    let localValues = {};
    for(let conflict of conflicts) {
      let serverItemResponse = conflict.server_item || conflict.unsaved_item;
      let localItem = this.modelManager.findItem(serverItemResponse.uuid);
      if(!localItem) {
        localValues[serverItemResponse.uuid] = {};
        continue;
      }
      let frozenContent = localItem.getContentCopy();
      localValues[serverItemResponse.uuid] = {frozenContent, itemRef: localItem};
    }

    // Any item that's newly created here or updated will need to be persisted
    let itemsNeedingLocalSave = [];

    for(let conflict of conflicts) {
      // if sync_conflict, we receive conflict.server_item.
      // If uuid_conflict, we receive the value we attempted to save.
      let serverItemResponse = conflict.server_item || conflict.unsaved_item;
      await SNJS.itemTransformer.decryptMultipleItems([serverItemResponse], (await this.getActiveKeyInfo(SFSyncManager.KeyRequestLoadSaveAccount)).keys);
      let {frozenContent, itemRef} = localValues[serverItemResponse.uuid];

      // Could be deleted
      if(!itemRef) { continue; }

      // Item ref is always added, since it's value will have changed below, either by mapping, being set to dirty,
      // or being set undirty by the caller but the caller not saving because they're waiting on us.
      itemsNeedingLocalSave.push(itemRef);

      if(conflict.type === "uuid_conflict") {
        // UUID conflicts can occur if a user attempts to
        // import an old data archive with uuids from the old account into a new account
        let newItem = await this.modelManager.alternateUUIDForItem(itemRef);
        itemsNeedingLocalSave.push(newItem);
      } else if(conflict.type === "sync_conflict") {
        let tempServerItem = await this.modelManager.createDuplicateItemFromResponseItem(serverItemResponse);
        // Convert to an object simply so we can have access to the `isItemContentEqualWith` function.
        let _tempItemWithFrozenValues = this.modelManager.duplicateItemWithCustomContent({
          content: frozenContent, duplicateOf: itemRef
        });
        // if !frozenContentDiffers && currentContentDiffers, it means values have changed as we were looping through conflicts here.
        let frozenContentDiffers = !_tempItemWithFrozenValues.isItemContentEqualWith(tempServerItem);
        let currentContentDiffers = !itemRef.isItemContentEqualWith(tempServerItem);

        let duplicateLocal = false;
        let duplicateServer = false;
        let keepLocal = false;
        let keepServer = false;

        if(serverItemResponse.deleted || itemRef.deleted) {
          keepServer = true;
        }
        else if(frozenContentDiffers) {
          const IsActiveItemSecondsThreshold = 20;
          let isActivelyBeingEdited = (new Date() - itemRef.client_updated_at) / 1000 < IsActiveItemSecondsThreshold;
          if(isActivelyBeingEdited) {
            keepLocal = true;
            duplicateServer = true;
          } else {
            duplicateLocal = true;
            keepServer = true;
          }
        }
        else if(currentContentDiffers) {
          let contentExcludingReferencesDiffers = !SFItem.AreItemContentsEqual({
            leftContent: itemRef.content,
            rightContent: tempServerItem.content,
            keysToIgnore: itemRef.keysToIgnoreWhenCheckingContentEquality().concat(["references"]),
            appDataKeysToIgnore: itemRef.appDataKeysToIgnoreWhenCheckingContentEquality()
          })
          let isOnlyReferenceChange = !contentExcludingReferencesDiffers;
          if(isOnlyReferenceChange) {
            keepLocal = true;
          } else {
            duplicateLocal = true;
            keepServer = true;
          }
        } else {
          // items are exactly equal
          keepServer = true;
        }

        if(duplicateLocal) {
          let localDuplicate = await this.modelManager.duplicateItemWithCustomContentAndAddAsConflict({
            content: frozenContent,
            duplicateOf: itemRef
          });
          itemsNeedingLocalSave.push(localDuplicate);
        }

        if(duplicateServer) {
          this.modelManager.addDuplicatedItemAsConflict({
            duplicate: tempServerItem,
            duplicateOf: itemRef
          });
          itemsNeedingLocalSave.push(tempServerItem);
        }

        if(keepServer) {
          await this.modelManager.mapResponseItemsToLocalModelsOmittingFields([serverItemResponse], null, SFModelManager.MappingSourceRemoteRetrieved);
        }

        if(keepLocal) {
          itemRef.updated_at = tempServerItem.updated_at;
          itemRef.setDirty(true);
        }
      } else {
        console.error("Unsupported conflict type", conflict.type);
        continue;
      }
    }

    return itemsNeedingLocalSave;
  }


  // Legacy API
  async deprecated_handleUnsavedItemsResponse(unsaved) {
    if(!unsaved || unsaved.length == 0) {
      return;
    }

    if(this.loggingEnabled) {
      console.log("Handle Unsaved Items:", unsaved);
    }

    for(let mapping of unsaved) {
      let itemResponse = mapping.item;
      await SNJS.itemTransformer.decryptMultipleItems([itemResponse], (await this.getActiveKeyInfo(SFSyncManager.KeyRequestLoadSaveAccount)).keys);
      let item = this.modelManager.findItem(itemResponse.uuid);

      // Could be deleted
      if(!item) { continue; }

      let error = mapping.error;

      if(error.tag === "uuid_conflict") {
        // UUID conflicts can occur if a user attempts to
        // import an old data archive with uuids from the old account into a new account
        await this.modelManager.alternateUUIDForItem(item);
      }

      else if(error.tag === "sync_conflict") {
        // Create a new item with the same contents of this item if the contents differ
        let dup = await this.modelManager.createDuplicateItemFromResponseItem(itemResponse);
        if(!itemResponse.deleted && !item.isItemContentEqualWith(dup)) {
          this.modelManager.addDuplicatedItemAsConflict({duplicate: dup, duplicateOf: item});
        }
      }
    }
  }

  /*
    Executes a sync request with a blank sync token and high download limit. It will download all items,
    but won't do anything with them other than decrypting, creating respective objects, and returning them to caller. (it does not map them nor establish their relationships)
    The use case came primarly for clients who had ignored a certain content_type in sync, but later issued an update
    indicated they actually did want to start handling that content type. In that case, they would need to download all items
    freshly from the server.
  */
  stateless_downloadAllItems(options = {}) {
    return new Promise(async (resolve, reject) => {
      let params = {
        limit: options.limit || 500,
        sync_token: options.syncToken,
        cursor_token: options.cursorToken,
        content_type: options.contentType,
        event: options.event,
        api: SFHttpManager.getApiVersion()
      };

      try {
        this.httpManager.postAuthenticatedAbsolute(await this.getSyncURL(), params, async (response) => {
          if(!options.retrievedItems) {
            options.retrievedItems = [];
          }

          let incomingItems = response.retrieved_items;
          let keys = (await this.getActiveKeyInfo(SFSyncManager.KeyRequestLoadSaveAccount)).keys;
          await SNJS.itemTransformer.decryptMultipleItems(incomingItems, keys);

          options.retrievedItems = options.retrievedItems.concat(incomingItems.map((incomingItem) => {
            // Create model classes
            return this.modelManager.createItem(incomingItem);
          }));
          options.syncToken = response.sync_token;
          options.cursorToken = response.cursor_token;

          if(options.cursorToken) {
            this.stateless_downloadAllItems(options).then(resolve);
          } else {
            resolve(options.retrievedItems);
          }
        }, (response, statusCode) => {
          reject(response);
        });
      } catch(e) {
        console.log("Download all items exception caught:", e);
        reject(e);
      }
    });
  }

  async resolveOutOfSync() {
    // Sync all items again to resolve out-of-sync state
    return this.stateless_downloadAllItems({event: "resolve-out-of-sync"}).then(async (downloadedItems) => {
      let itemsToMap = [];
      for(let downloadedItem of downloadedItems) {
        // Note that deleted items will not be sent back by the server.
        let existingItem = this.modelManager.findItem(downloadedItem.uuid);
        if(existingItem) {
          // Check if the content differs. If it does, create a new item, and do not map downloadedItem.
          let contentDoesntMatch = !downloadedItem.isItemContentEqualWith(existingItem);
          if(contentDoesntMatch) {
            // We create a copy of the local existing item and sync that up. It will be a "conflict" of itself
            await this.modelManager.duplicateItemAndAddAsConflict(existingItem);
          }
        }

        // Map the downloadedItem as authoritive content. If client copy at all differed, we would have created a duplicate of it above and synced it.
        // This is also neccessary to map the updated_at value from the server
        itemsToMap.push(downloadedItem);
      }

      await this.modelManager.mapResponseItemsToLocalModelsWithOptions({items: itemsToMap, source: SFModelManager.MappingSourceRemoteRetrieved});
      // Save all items locally. Usually sync() would save downloaded items locally, but we're using stateless_sync here, so we have to do it manually
      await this.writeItemsToLocalStorage(this.modelManager.allNondummyItems);
      return this.sync({performIntegrityCheck: true});
    })
  }

  async handleSignout() {
    this.outOfSync = false;
    this.loadLocalDataPromise = null;
    this.performSyncAgainOnCompletion = false;
    this.syncStatus.syncOpInProgress = false;
    this._queuedCallbacks = [];
    this.syncStatus = {};
    return this.clearSyncToken();
  }

  async clearSyncToken() {
    this._syncToken = null;
    this._cursorToken = null;
    return this.storageManager.removeItem("syncToken");
  }

  // Only used by unit test
  __setLocalDataNotLoaded() {
    this.loadLocalDataPromise = null;
    this._initialDataLoaded = false;
  }
}
;var dateFormatter;

export class SFItem {

  constructor(json_obj = {}) {
    this.content = {};
    this.referencingObjects = [];
    this.updateFromJSON(json_obj);

    if(!this.uuid) {
      // on React Native, this method will not exist. UUID gen will be handled manually via async methods.
      if(typeof(SNJS) !== "undefined" && SNJS.crypto.generateUUIDSync) {
        this.uuid = SNJS.crypto.generateUUIDSync();
      }
    }

    if(typeof this.content === 'object' && !this.content.references) {
      this.content.references = [];
    }
  }

  // On some platforms, syncrounous uuid generation is not available.
  // Those platforms (mobile) must call this function manually.
  async initUUID() {
    if(!this.uuid) {
      this.uuid = await SNJS.crypto.generateUUID();
    }
  }

  get contentObject() {

    if(this.errorDecrypting) {
      return this.content;
    }

    if(!this.content) {
      this.content = {};
      return this.content;
    }

    if(this.content !== null && typeof this.content === 'object') {
      // this is the case when mapping localStorage content, in which case the content is already parsed
      return this.content;
    }

    try {
      let content = JSON.parse(this.content);
      this.content = content;
      return this.content;
    } catch (e) {
      console.log("Error parsing json", e, this);
      this.content = {};
      return this.content;
    }
  }

  static deepMerge(a, b) {
    // By default _.merge will not merge a full array with an empty one.
    // We want to replace arrays wholesale
    function mergeCopyArrays(objValue, srcValue) {
      if (_.isArray(objValue)) {
        return srcValue;
      }
    }
    _.mergeWith(a, b, mergeCopyArrays);
    return a;
  }

  updateFromJSON(json) {
    // Don't expect this to ever be the case but we're having a crash with Android and this is the only suspect.
    if(!json) {
      return;
    }

    this.deleted = json.deleted;
    this.uuid = json.uuid;
    this.enc_item_key = json.enc_item_key;
    this.auth_hash = json.auth_hash;
    this.auth_params = json.auth_params;

    // When updating from server response (as opposed to local json response), these keys will be missing.
    // So we only want to update these values if they are explicitly present.
    let clientKeys = ["errorDecrypting", "dirty", "dirtyCount", "dirtiedDate", "dummy"];
    for(var key of clientKeys) {
      if(json[key] !== undefined) {
        this[key] = json[key];
      }
    }

    if(this.dirtiedDate && typeof this.dirtiedDate === 'string') {
      this.dirtiedDate = new Date(this.dirtiedDate);
    }

    // Check if object has getter for content_type, and if so, skip
    if(!this.content_type) {
      this.content_type = json.content_type;
    }

    // this.content = json.content will copy it by reference rather than value. So we need to do a deep merge after.
    // json.content can still be a string here. We copy it to this.content, then do a deep merge to transfer over all values.

    if(json.errorDecrypting) {
      this.content = json.content;
    } else {
      try {
        let parsedContent = typeof json.content === 'string' ? JSON.parse(json.content) : json.content;
        SFItem.deepMerge(this.contentObject, parsedContent);
      } catch (e) {
        console.log("Error while updating item from json", e);
      }
    }

    // Manually merge top level data instead of wholesale merge
    if(json.created_at) {
      this.created_at = json.created_at;
    }
    // Could be null if we're mapping from an extension bridge, where we remove this as its a private property.
    if(json.updated_at) {
      this.updated_at = json.updated_at;
    }

    if(this.created_at) { this.created_at = new Date(this.created_at);}
    else { this.created_at = new Date();}

    if(this.updated_at) { this.updated_at = new Date(this.updated_at);}
    else { this.updated_at = new Date(0);} // Epoch

    // Allows the getter to be re-invoked
    this._client_updated_at = null;

    if(json.content) {
      this.mapContentToLocalProperties(this.contentObject);
    } else if(json.deleted == true) {
      this.handleDeletedContent();
    }
  }

  mapContentToLocalProperties(contentObj) {

  }

  createContentJSONFromProperties() {
    /*
    NOTE: This function does have side effects and WILL modify our content.

    Subclasses will override structureParams, and add their own custom content and properties to the object returned from structureParams
    These are properties that this superclass will not be aware of, like 'title' or 'text'

    When we call createContentJSONFromProperties, we want to update our own inherit 'content' field with the values returned from structureParams,
    so that our content field is up to date.

    Each subclass will call super.structureParams and merge it with its own custom result object.
    Since our own structureParams gets a real-time copy of our content, it should be safe to merge the aggregate value back into our own content field.
    */
    let content = this.structureParams();

    SFItem.deepMerge(this.contentObject, content);

    // Return the content item copy and not our actual value, as we don't want it to be mutated outside our control.
    return content;
  }

  structureParams() {
    return this.getContentCopy();
  }

  /* Allows the item to handle the case where the item is deleted and the content is null */
  handleDeletedContent() {
    // Subclasses can override
  }

  setDirty(dirty, updateClientDate) {
    this.dirty = dirty;

    // Allows the syncManager to check if an item has been marked dirty after a sync has been started
    // This prevents it from clearing it as a dirty item after sync completion, if someone else has marked it dirty
    // again after an ongoing sync.
    if(!this.dirtyCount) { this.dirtyCount = 0; }
    if(dirty) {
      this.dirtyCount++;
    } else {
      this.dirtyCount = 0;
    }

    // Used internally by syncManager to determine if a dirted item needs to be saved offline.
    // You want to set this in both cases, when dirty is true and false. If it's false, we still need
    // to save it to disk as an update.
    this.dirtiedDate = new Date();

    if(dirty && updateClientDate) {
      // Set the client modified date to now if marking the item as dirty
      this.client_updated_at = new Date();
    } else if(!this.hasRawClientUpdatedAtValue()) {
      // if we don't have an explcit raw value, we initialize client_updated_at.
      this.client_updated_at = new Date(this.updated_at);
    }
  }

  updateLocalRelationships() {
    // optional override
  }

  addItemAsRelationship(item) {
    item.setIsBeingReferencedBy(this);

    if(this.hasRelationshipWithItem(item)) {
      return;
    }

    var references = this.content.references || [];
    references.push({
      uuid: item.uuid,
      content_type: item.content_type
    })
    this.content.references = references;
  }

  removeItemAsRelationship(item) {
    item.setIsNoLongerBeingReferencedBy(this);
    this.removeReferenceWithUuid(item.uuid);
  }

  // When another object has a relationship with us, we push that object into memory here.
  // We use this so that when `this` is deleted, we're able to update the references of those other objects.
  setIsBeingReferencedBy(item) {
    if(!_.find(this.referencingObjects, {uuid: item.uuid})) {
      this.referencingObjects.push(item);
    }
  }

  setIsNoLongerBeingReferencedBy(item) {
    _.remove(this.referencingObjects, {uuid: item.uuid});
    // Legacy two-way relationships should be handled here
    if(this.hasRelationshipWithItem(item)) {
      this.removeReferenceWithUuid(item.uuid);
      // We really shouldn't have the authority to set this item as dirty, but it's the only way to save this change.
      this.setDirty(true);
    }
  }

  removeReferenceWithUuid(uuid) {
    var references = this.content.references || [];
    references = references.filter((r) => {return r.uuid != uuid});
    this.content.references = references;
  }

  hasRelationshipWithItem(item) {
    let target = this.content.references.find((r) => {
      return r.uuid == item.uuid;
    });
    return target != null;
  }

  isBeingRemovedLocally() {

  }

  didFinishSyncing() {

  }

  informReferencesOfUUIDChange(oldUUID, newUUID) {
    // optional override
  }

  potentialItemOfInterestHasChangedItsUUID(newItem, oldUUID, newUUID) {
    if(this.errorDecrypting) {
      return;
    }
    for(let reference of this.content.references) {
      if(reference.uuid == oldUUID) {
        reference.uuid = newUUID;
        this.setDirty(true);
      }
    }
  }

  doNotEncrypt() {
    return false;
  }

  /*
  App Data
  */

  setDomainDataItem(key, value, domain) {
    if(!domain) {
      console.error("SFItem.AppDomain needs to be set.");
      return;
    }

    if(this.errorDecrypting) {
      return;
    }

    if(!this.content.appData) {
      this.content.appData = {};
    }

    var data = this.content.appData[domain];
    if(!data) {
      data = {}
    }
    data[key] = value;
    this.content.appData[domain] = data;
  }

  getDomainDataItem(key, domain) {
    if(!domain) {
      console.error("SFItem.AppDomain needs to be set.");
      return;
    }

    if(this.errorDecrypting) {
      return;
    }

    if(!this.content.appData) {
      this.content.appData = {};
    }

    var data = this.content.appData[domain];
    if(data) {
      return data[key];
    } else {
      return null;
    }
  }

  setAppDataItem(key, value) {
    this.setDomainDataItem(key, value, SFItem.AppDomain);
  }

  getAppDataItem(key) {
    return this.getDomainDataItem(key, SFItem.AppDomain);
  }

  get pinned() {
    return this.getAppDataItem("pinned");
  }

  get archived() {
    return this.getAppDataItem("archived");
  }

  get locked() {
    return this.getAppDataItem("locked");
  }

  // May be used by clients to display the human readable type for this item. Should be overriden by subclasses.
  get displayName() {
    return "Item";
  }

  hasRawClientUpdatedAtValue() {
    return this.getAppDataItem("client_updated_at") != null;
  }

  get client_updated_at() {
    if(!this._client_updated_at) {
      var saved = this.getAppDataItem("client_updated_at");
      if(saved) {
        this._client_updated_at = new Date(saved);
      } else {
        this._client_updated_at = new Date(this.updated_at);
      }
    }
    return this._client_updated_at;
  }

  set client_updated_at(date) {
    this._client_updated_at = date;

    this.setAppDataItem("client_updated_at", date);
  }

  /*
    During sync conflicts, when determing whether to create a duplicate for an item, we can omit keys that have no
    meaningful weight and can be ignored. For example, if one component has active = true and another component has active = false,
    it would be silly to duplicate them, so instead we ignore this.
   */
  keysToIgnoreWhenCheckingContentEquality() {
    return [];
  }

  // Same as above, but keys inside appData[Item.AppDomain]
  appDataKeysToIgnoreWhenCheckingContentEquality() {
    return ["client_updated_at"];
  }

  getContentCopy() {
    let contentCopy = JSON.parse(JSON.stringify(this.content));
    return contentCopy;
  }

  isItemContentEqualWith(otherItem) {
    return SFItem.AreItemContentsEqual({
      leftContent: this.content,
      rightContent: otherItem.content,
      keysToIgnore: this.keysToIgnoreWhenCheckingContentEquality(),
      appDataKeysToIgnore: this.appDataKeysToIgnoreWhenCheckingContentEquality()
    })
  }

  static AreItemContentsEqual({leftContent, rightContent, keysToIgnore, appDataKeysToIgnore}) {
    const omit = (obj, keys) => {
      if(!obj) { return obj; }
      for(let key of keys) {
        delete obj[key];
      }
      return obj;
    }

    // Create copies of objects before running omit as not to modify source values directly.
    leftContent = JSON.parse(JSON.stringify(leftContent));
    if(leftContent.appData) {
      omit(leftContent.appData[SFItem.AppDomain], appDataKeysToIgnore);
    }
    leftContent = omit(leftContent, keysToIgnore);

    rightContent = JSON.parse(JSON.stringify(rightContent));
    if(rightContent.appData) {
      omit(rightContent.appData[SFItem.AppDomain], appDataKeysToIgnore);
    }
    rightContent = omit(rightContent, keysToIgnore);

    return JSON.stringify(leftContent) === JSON.stringify(rightContent);
  }

  satisfiesPredicate(predicate) {
    /*
    Predicate is an SFPredicate having properties:
    {
      keypath: String,
      operator: String,
      value: object
    }
     */
    return SFPredicate.ItemSatisfiesPredicate(this, predicate);
  }

  /*
  Dates
  */

  createdAtString() {
    return this.dateToLocalizedString(this.created_at);
  }

  updatedAtString() {
    return this.dateToLocalizedString(this.client_updated_at);
  }

  updatedAtTimestamp() {
    return this.updated_at.getTime();
  }

  dateToLocalizedString(date) {
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      if (!dateFormatter) {
        var locale = (navigator.languages && navigator.languages.length) ? navigator.languages[0] : navigator.language;
        dateFormatter = new Intl.DateTimeFormat(locale, {
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          weekday: 'long',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      return dateFormatter.format(date);
    } else {
      // IE < 11, Safari <= 9.0.
      // In English, this generates the string most similar to
      // the toLocaleDateString() result above.
      return date.toDateString() + ' ' + date.toLocaleTimeString();
    }
  }

}
;export class SFItemParams {

  constructor(item, keys, auth_params) {
    this.item = item;
    this.keys = keys;
    this.auth_params = auth_params;

    if(this.keys && !this.auth_params) {
      throw "SFItemParams.auth_params must be supplied if supplying keys.";
    }

    if(this.auth_params && !this.auth_params.version) {
      throw "SFItemParams.auth_params is missing version";
    }
  }

  async paramsForExportFile(includeDeleted) {
    this.forExportFile = true;
    if(includeDeleted) {
      return this.__params();
    } else {
      var result = await this.__params();
      return _.omit(result, ["deleted"]);
    }
  }

  async paramsForExtension() {
    return this.paramsForExportFile();
  }

  async paramsForLocalStorage() {
    this.additionalFields = ["dirty", "dirtiedDate", "errorDecrypting"];
    this.forExportFile = true;
    return this.__params();
  }

  async paramsForSync() {
    return this.__params();
  }

  async __params() {

    var params = { uuid: this.item.uuid, content_type: this.item.content_type, deleted: this.item.deleted, created_at: this.item.created_at, updated_at: this.item.updated_at};
    if(!this.item.errorDecrypting) {
      // Items should always be encrypted for export files. Only respect item.doNotEncrypt for remote sync params.
      var doNotEncrypt = this.item.doNotEncrypt() && !this.forExportFile;
      if(this.keys && !doNotEncrypt) {
        var encryptedParams = await SNJS.itemTransformer.encryptItem(this.item, this.keys, this.auth_params);
        _.merge(params, encryptedParams);

        if(this.auth_params.version !== "001") {
          params.auth_hash = null;
        }
      }
      else {
        params.content = this.forExportFile ? this.item.createContentJSONFromProperties() : "000" + await SNJS.crypto.base64(JSON.stringify(this.item.createContentJSONFromProperties()));
        if(!this.forExportFile) {
          params.enc_item_key = null;
          params.auth_hash = null;
        }
      }
    } else {
      // Error decrypting, keep "content" and related fields as is (and do not try to encrypt, otherwise that would be undefined behavior)
      params.content = this.item.content;
      params.enc_item_key = this.item.enc_item_key;
      params.auth_hash = this.item.auth_hash;
    }

    if(this.additionalFields) {
      _.merge(params, _.pick(this.item, this.additionalFields));
    }

    return params;
  }


}
;export class SFPredicate {


  constructor(keypath, operator, value) {
    this.keypath = keypath;
    this.operator = operator;
    this.value = value;

    // Preprocessing to make predicate evaluation faster.
    // Won't recurse forever, but with arbitrarily large input could get stuck. Hope there are input size limits
    // somewhere else.
    if(SFPredicate.IsRecursiveOperator(this.operator)) {
      this.value = this.value.map(SFPredicate.fromArray);
    }
  }

  static fromArray(array) {
    return new SFPredicate(array[0],array[1],array[2]);
  }

  static ObjectSatisfiesPredicate(object, predicate) {
    // Predicates may not always be created using the official constructor
    // so if it's still an array here, convert to object
    if(Array.isArray(predicate)) {
      predicate = this.fromArray(predicate);
    }

    if(SFPredicate.IsRecursiveOperator(predicate.operator)) {
      if(predicate.operator === "and") {
        for(var subPredicate of predicate.value) {
          if (!this.ObjectSatisfiesPredicate(object, subPredicate)) {
            return false;
          }
        }
        return true;
      }
      if(predicate.operator === "or") {
        for(var subPredicate of predicate.value) {
          if (this.ObjectSatisfiesPredicate(object, subPredicate)) {
            return true;
          }
        }
        return false;
      }
    }

    var predicateValue = predicate.value;
    if(typeof(predicateValue) == 'string' && predicateValue.includes(".ago")) {
      predicateValue = this.DateFromString(predicateValue);
    }

    var valueAtKeyPath = predicate.keypath.split('.').reduce((previous, current) => {
      return previous && previous[current]
    }, object);

    const falseyValues = [false, "", null, undefined, NaN];

    // If the value at keyPath is undefined, either because the property is nonexistent or the value is null.
    if(valueAtKeyPath == undefined) {
      if(predicate.operator == "!=") {
        return !falseyValues.includes(predicate.value);
      } else {
        return falseyValues.includes(predicate.value);
      }
    }

    if(predicate.operator == "=") {
      // Use array comparison
      if(Array.isArray(valueAtKeyPath)) {
        return JSON.stringify(valueAtKeyPath) == JSON.stringify(predicateValue);
      } else {
        return valueAtKeyPath == predicateValue;
      }
    } else if(predicate.operator == "!=") {
      // Use array comparison
      if(Array.isArray(valueAtKeyPath)) {
        return JSON.stringify(valueAtKeyPath) != JSON.stringify(predicateValue);
      } else {
        return valueAtKeyPath !== predicateValue;
      }
    } else if(predicate.operator == "<")  {
      return valueAtKeyPath < predicateValue;
    } else if(predicate.operator == ">")  {
      return valueAtKeyPath > predicateValue;
    } else if(predicate.operator == "<=")  {
      return valueAtKeyPath <= predicateValue;
    } else if(predicate.operator == ">=")  {
      return valueAtKeyPath >= predicateValue;
    } else if(predicate.operator == "startsWith")  {
      return valueAtKeyPath.startsWith(predicateValue);
    } else if(predicate.operator == "in") {
      return predicateValue.indexOf(valueAtKeyPath) != -1;
    } else if(predicate.operator == "includes") {
      return this.resolveIncludesPredicate(valueAtKeyPath, predicateValue);
    } else if(predicate.operator == "matches") {
      var regex = new RegExp(predicateValue);
      return regex.test(valueAtKeyPath);
    }

    return false;
  }

  static resolveIncludesPredicate(valueAtKeyPath, predicateValue) {
    // includes can be a string  or a predicate (in array form)
    if(typeof(predicateValue) == 'string') {
      // if string, simply check if the valueAtKeyPath includes the predicate value
      return valueAtKeyPath.includes(predicateValue);
    } else {
      // is a predicate array or predicate object
      var innerPredicate;
      if(Array.isArray(predicateValue)) {
        innerPredicate = SFPredicate.fromArray(predicateValue);
      } else {
        innerPredicate = predicateValue;
      }
      for(var obj of valueAtKeyPath) {
        if(this.ObjectSatisfiesPredicate(obj, innerPredicate)) {
          return true;
        }
      }
      return false;
    }
  }

  static ItemSatisfiesPredicate(item, predicate) {
    if(Array.isArray(predicate)) {
      predicate = SFPredicate.fromArray(predicate);
    }
    return this.ObjectSatisfiesPredicate(item, predicate);
  }

  static ItemSatisfiesPredicates(item, predicates) {
    for(var predicate of predicates) {
      if(!this.ItemSatisfiesPredicate(item, predicate)) {
        return false;
      }
    }
    return true;
  }

  static DateFromString(string) {
    // x.days.ago, x.hours.ago
    var comps = string.split(".");
    var unit = comps[1];
    var date = new Date;
    var offset = parseInt(comps[0]);
    if(unit == "days") {
      date.setDate(date.getDate() - offset);
    } else if(unit == "hours") {
      date.setHours(date.getHours() - offset);
    }
    return date;
  }

  static IsRecursiveOperator(operator) {
    return ["and", "or"].includes(operator);
  }
}
;export class SNComponent extends SFItem {

  constructor(json_obj) {
    // If making a copy of an existing component (usually during sign in if you have a component active in the session),
    // which may have window set, you may get a cross-origin exception since you'll be trying to copy the window. So we clear it here.
    json_obj.window = null;

    super(json_obj);

    if(!this.componentData) {
      this.componentData = {};
    }

    if(!this.disassociatedItemIds) {
      this.disassociatedItemIds = [];
    }

    if(!this.associatedItemIds) {
      this.associatedItemIds = [];
    }
  }

  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content)
    /* Legacy */
    // We don't want to set the url directly, as we'd like to phase it out.
    // If the content.url exists, we'll transfer it to legacy_url
    // We'll only need to set this if content.hosted_url is blank, otherwise, hosted_url is the url replacement.
    if(!content.hosted_url) {
      this.legacy_url = content.url;
    }

    /* New */
    this.local_url = content.local_url;
    this.hosted_url = content.hosted_url || content.url;
    this.offlineOnly = content.offlineOnly;

    if(content.valid_until) {
      this.valid_until = new Date(content.valid_until);
    }

    this.name = content.name;
    this.autoupdateDisabled = content.autoupdateDisabled;

    this.package_info = content.package_info;

    // the location in the view this component is located in. Valid values are currently tags-list, note-tags, and editor-stack`
    this.area = content.area;

    this.permissions = content.permissions;
    if(!this.permissions) {
      this.permissions = [];
    }

    this.active = content.active;

    // custom data that a component can store in itself
    this.componentData = content.componentData || {};

    // items that have requested a component to be disabled in its context
    this.disassociatedItemIds = content.disassociatedItemIds || [];

    // items that have requested a component to be enabled in its context
    this.associatedItemIds = content.associatedItemIds || [];
  }

  handleDeletedContent() {
    super.handleDeletedContent();

    this.active = false;
  }

  structureParams() {
    var params = {
      legacy_url: this.legacy_url,
      hosted_url: this.hosted_url,
      local_url: this.local_url,
      valid_until: this.valid_until,
      offlineOnly: this.offlineOnly,
      name: this.name,
      area: this.area,
      package_info: this.package_info,
      permissions: this.permissions,
      active: this.active,
      autoupdateDisabled: this.autoupdateDisabled,
      componentData: this.componentData,
      disassociatedItemIds: this.disassociatedItemIds,
      associatedItemIds: this.associatedItemIds,
    };

    var superParams = super.structureParams();
    Object.assign(superParams, params);
    return superParams;
  }

  get content_type() {
    return "SN|Component";
  }

  isEditor() {
    return this.area == "editor-editor";
  }

  isTheme() {
    return this.content_type == "SN|Theme" || this.area == "themes";
  }

  isDefaultEditor() {
    return this.getAppDataItem("defaultEditor") == true;
  }

  setLastSize(size) {
    this.setAppDataItem("lastSize", size);
  }

  getLastSize() {
    return this.getAppDataItem("lastSize");
  }

  acceptsThemes() {
    if(this.content.package_info && "acceptsThemes" in this.content.package_info) {
      return this.content.package_info.acceptsThemes;
    }
    return true;
  }

  /*
    The key used to look up data that this component may have saved to an item.
    This key will be look up on the item, and not on itself.
   */
  getClientDataKey() {
    if(this.legacy_url) {
      return this.legacy_url;
    } else {
      return this.uuid;
    }
  }

  hasValidHostedUrl() {
    return this.hosted_url || this.legacy_url;
  }

  keysToIgnoreWhenCheckingContentEquality() {
    return ["active", "disassociatedItemIds", "associatedItemIds"].concat(super.keysToIgnoreWhenCheckingContentEquality());
  }


  /*
    An associative component depends on being explicitly activated for a given item, compared to a dissaciative component,
    which is enabled by default in areas unrelated to a certain item.
   */
   static associativeAreas() {
     return ["editor-editor"];
   }

  isAssociative() {
    return Component.associativeAreas().includes(this.area);
  }

  associateWithItem(item) {
    this.associatedItemIds.push(item.uuid);
  }

  isExplicitlyEnabledForItem(item) {
    return this.associatedItemIds.indexOf(item.uuid) !== -1;
  }

  isExplicitlyDisabledForItem(item) {
    return this.disassociatedItemIds.indexOf(item.uuid) !== -1;
  }
}
;export class SNEditor extends SFItem {

  constructor(json_obj) {
    super(json_obj);
    if(!this.notes) {
      this.notes = [];
    }
    if(!this.data) {
      this.data = {};
    }
  }

  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content)
    this.url = content.url;
    this.name = content.name;
    this.data = content.data || {};
    this.default = content.default;
    this.systemEditor = content.systemEditor;
  }

  structureParams() {
    var params = {
      url: this.url,
      name: this.name,
      data: this.data,
      default: this.default,
      systemEditor: this.systemEditor
    };

    var superParams = super.structureParams();
    Object.assign(superParams, params);
    return superParams;
  }

  referenceParams() {
    var references = _.map(this.notes, function(note){
      return {uuid: note.uuid, content_type: note.content_type};
    })

    return references;
  }

  addItemAsRelationship(item) {
    if(item.content_type == "Note") {
      if(!_.find(this.notes, item)) {
        this.notes.push(item);
      }
    }
    super.addItemAsRelationship(item);
  }

  removeItemAsRelationship(item) {
    if(item.content_type == "Note") {
      _.pull(this.notes, item);
    }
    super.removeItemAsRelationship(item);
  }

  removeAndDirtyAllRelationships() {
    super.removeAndDirtyAllRelationships();
    this.notes = [];
  }

  removeReferencesNotPresentIn(references) {
    super.removeReferencesNotPresentIn(references);

    var uuids = references.map(function(ref){return ref.uuid});
    this.notes.forEach(function(note){
      if(!uuids.includes(note.uuid)) {
        _.remove(this.notes, {uuid: note.uuid});
      }
    }.bind(this))
  }

  potentialItemOfInterestHasChangedItsUUID(newItem, oldUUID, newUUID) {
    if(newItem.content_type === "Note" && _.find(this.notes, {uuid: oldUUID})) {
      _.remove(this.notes, {uuid: oldUUID});
      this.notes.push(newItem);
    }
  }

  get content_type() {
    return "SN|Editor";
  }

  setData(key, value) {
    var dataHasChanged = JSON.stringify(this.data[key]) !== JSON.stringify(value);
    if(dataHasChanged) {
      this.data[key] = value;
      return true;
    }
    return false;
  }

  dataForKey(key) {
    return this.data[key] || {};
  }
}
;export class Action {
  constructor(json) {
    _.merge(this, json);
    this.running = false; // in case running=true was synced with server since model is uploaded nondiscriminatory
    this.error = false;
    if(this.lastExecuted) {
      // is string
      this.lastExecuted = new Date(this.lastExecuted);
    }
  }
}

export class SNExtension extends SFItem {
  constructor(json) {
      super(json);

      if(json.actions) {
        this.actions = json.actions.map(function(action){
          return new Action(action);
        })
      }

      if(!this.actions) {
        this.actions = [];
      }
  }

  actionsWithContextForItem(item) {
    return this.actions.filter(function(action){
      return action.context == item.content_type || action.context == "Item";
    })
  }

  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content)
    this.description = content.description;
    this.url = content.url;
    this.name = content.name;
    this.package_info = content.package_info;
    this.supported_types = content.supported_types;
    if(content.actions) {
      this.actions = content.actions.map(function(action){
        return new Action(action);
      })
    }
  }

  get content_type() {
    return "Extension";
  }

  structureParams() {
    var params = {
      name: this.name,
      url: this.url,
      package_info: this.package_info,
      description: this.description,
      actions: this.actions.map((a) => {return _.omit(a, ["subrows", "subactions"])}),
      supported_types: this.supported_types
    };

    var superParams = super.structureParams();
    Object.assign(superParams, params);
    return superParams;
  }

}
;export class SNNote extends SFItem {

  constructor(json_obj) {
    super(json_obj);

    if(!this.text) {
      // Some external editors can't handle a null value for text.
      // Notes created on mobile with no text have a null value for it,
      // so we'll just set a default here.
      this.text = "";
    }

    if(!this.tags) {
      this.tags = [];
    }
  }

  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content)
    this.title = content.title;
    this.text = content.text;
  }

  structureParams() {
    var params = {
      title: this.title,
      text: this.text
    };

    var superParams = super.structureParams();
    Object.assign(superParams, params);
    return superParams;
  }

  addItemAsRelationship(item) {
    /*
    Legacy.
    Previously, note/tag relationships were bidirectional, however in some cases there
    may be broken links such that a note has references to a tag and not vice versa.
    Now, only tags contain references to notes. For old notes that may have references to tags,
    we want to transfer them over to the tag.
     */
    if(item.content_type == "Tag") {
      item.addItemAsRelationship(this);
    }
    super.addItemAsRelationship(item);
  }

  setIsBeingReferencedBy(item) {
    super.setIsBeingReferencedBy(item);
    this.clearSavedTagsString();
  }

  setIsNoLongerBeingReferencedBy(item) {
    super.setIsNoLongerBeingReferencedBy(item);
    this.clearSavedTagsString();
  }

  isBeingRemovedLocally() {
    this.tags.forEach(function(tag){
      _.remove(tag.notes, {uuid: this.uuid});
    }.bind(this))
    super.isBeingRemovedLocally();
  }

  static filterDummyNotes(notes) {
    var filtered = notes.filter(function(note){return note.dummy == false || note.dummy == null});
    return filtered;
  }

  informReferencesOfUUIDChange(oldUUID, newUUID) {
    super.informReferencesOfUUIDChange();
    for(var tag of this.tags) {
      _.remove(tag.notes, {uuid: oldUUID});
      tag.notes.push(this);
    }
  }

  tagDidFinishSyncing(tag) {
    this.clearSavedTagsString();
  }

  safeText() {
    return this.text || "";
  }

  safeTitle() {
    return this.title || "";
  }

  get content_type() {
    return "Note";
  }

  get displayName() {
    return "Note";
  }

  clearSavedTagsString() {
    this.savedTagsString = null;
  }

  tagsString() {
    this.savedTagsString = SNTag.arrayToDisplayString(this.tags);
    return this.savedTagsString;
  }
}
;export class SNTag extends SFItem {

  constructor(json_obj) {
    super(json_obj);

    if(!this.content_type) {
      this.content_type = "Tag";
    }

    if(!this.notes) {
      this.notes = [];
    }
  }

  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content)
    this.title = content.title;
  }

  structureParams() {
    var params = {
      title: this.title
    };

    var superParams = super.structureParams();
    Object.assign(superParams, params);
    return superParams;
  }

  addItemAsRelationship(item) {
    if(item.content_type == "Note") {
      if(!_.find(this.notes, {uuid: item.uuid})) {
        this.notes.push(item);
        item.tags.push(this);
      }
    }
    super.addItemAsRelationship(item);
  }

  removeItemAsRelationship(item) {
    if(item.content_type == "Note") {
      _.remove(this.notes, {uuid: item.uuid});
      _.remove(item.tags, {uuid: this.uuid});
    }
    super.removeItemAsRelationship(item);
  }

  updateLocalRelationships() {
    var references = this.content.references;

    var uuids = references.map(function(ref){return ref.uuid});
    this.notes.slice().forEach(function(note){
      if(!uuids.includes(note.uuid)) {
        _.remove(note.tags, {uuid: this.uuid});
        _.remove(this.notes, {uuid: note.uuid});

        note.setIsNoLongerBeingReferencedBy(this);
      }
    }.bind(this))
  }

  isBeingRemovedLocally() {
    this.notes.forEach((note) => {
      _.remove(note.tags, {uuid: this.uuid});
      note.setIsNoLongerBeingReferencedBy(this);
    })

    this.notes.length = 0;

    super.isBeingRemovedLocally();
  }

  informReferencesOfUUIDChange(oldUUID, newUUID) {
    for(var note of this.notes) {
      _.remove(note.tags, {uuid: oldUUID});
      note.tags.push(this);
    }
  }

  didFinishSyncing() {
    for(var note of this.notes) {
      note.tagDidFinishSyncing(this);
    }
  }

  isSmartTag() {
    return this.content_type == "SN|SmartTag";
  }

  get displayName() {
    return "Tag";
  }

  static arrayToDisplayString(tags) {
    return tags.sort((a, b) => {return a.title > b.title}).map(function(tag, i){
      return "#" + tag.title;
    }).join(" ");
  }
}
;export class SNEncryptedStorage extends SFItem {

  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content)
    this.storage = content.storage;
  }

  get content_type() {
    return "SN|EncryptedStorage";
  }

}
;export class SFPrivileges extends SFItem {

  static contentType() {
    // It has prefix SN since it was originally imported from SN codebase
    return "SN|Privileges";
  }

  constructor(json_obj) {
    super(json_obj);

    if(!this.content.desktopPrivileges) {
      this.content.desktopPrivileges = {};
    }
  }

  setCredentialsForAction(action, credentials) {
    this.content.desktopPrivileges[action] = credentials;
  }

  getCredentialsForAction(action) {
    return this.content.desktopPrivileges[action] || [];
  }

  toggleCredentialForAction(action, credential) {
    if(this.isCredentialRequiredForAction(action, credential)) {
      this.removeCredentialForAction(action, credential);
    } else {
      this.addCredentialForAction(action, credential);
    }
  }

  removeCredentialForAction(action, credential) {
    _.pull(this.content.desktopPrivileges[action], credential);
  }

  addCredentialForAction(action, credential) {
    var credentials = this.getCredentialsForAction(action);
    credentials.push(credential);
    this.setCredentialsForAction(action, credentials);
  }

  isCredentialRequiredForAction(action, credential) {
    var credentialsRequired = this.getCredentialsForAction(action);
    return credentialsRequired.includes(credential);
  }

}
;export class SNMfa extends SFItem {

  constructor(json_obj) {
    super(json_obj);
  }

  // mapContentToLocalProperties(content) {
  //   super.mapContentToLocalProperties(content)
  //   this.serverContent = content;
  // }
  //
  // structureParams() {
  //   return _.merge(this.serverContent, super.structureParams());
  // }

  get content_type() {
    return "SF|MFA";
  }

  doNotEncrypt() {
    return true;
  }

}
;export class SNServerExtension extends SFItem {

  mapContentToLocalProperties(content) {
    super.mapContentToLocalProperties(content)
    this.url = content.url;
  }

  get content_type() {
    return "SF|Extension";
  }

  doNotEncrypt() {
    return true;
  }
}
;/*
  Important: This is the only object in the session history domain that is persistable.

  A history session contains one main content object:
  the itemUUIDToItemHistoryMapping. This is a dictionary whose keys are item uuids,
  and each value is an SFItemHistory object.

  Each SFItemHistory object contains an array called `entires` which contain `SFItemHistory` entries (or subclasses, if the
  `SFItemHistory.HistoryEntryClassMapping` class property value is set.)
 */

// See default class values at bottom of this file, including `SFHistorySession.LargeItemEntryAmountThreshold`.

export class SFHistorySession extends SFItem {
  constructor(json_obj) {

    super(json_obj);

    /*
      Our .content params:
      {
        itemUUIDToItemHistoryMapping
      }
     */

    if(!this.content.itemUUIDToItemHistoryMapping) {
      this.content.itemUUIDToItemHistoryMapping = {};
    }

    // When initializing from a json_obj, we want to deserialize the item history JSON into SFItemHistory objects.
    var uuids = Object.keys(this.content.itemUUIDToItemHistoryMapping);
    uuids.forEach((itemUUID) => {
      var itemHistory = this.content.itemUUIDToItemHistoryMapping[itemUUID];
      this.content.itemUUIDToItemHistoryMapping[itemUUID] = new SFItemHistory(itemHistory);
    });
  }

  addEntryForItem(item) {
    var itemHistory = this.historyForItem(item);
    var entry = itemHistory.addHistoryEntryForItem(item);
    return entry;
  }

  historyForItem(item) {
    var history = this.content.itemUUIDToItemHistoryMapping[item.uuid];
    if(!history) {
      history = this.content.itemUUIDToItemHistoryMapping[item.uuid] = new SFItemHistory();
    }
    return history;
  }

  clearItemHistory(item) {
    this.historyForItem(item).clear();
  }

  clearAllHistory() {
    this.content.itemUUIDToItemHistoryMapping = {};
  }

  optimizeHistoryForItem(item) {
    // Clean up if there are too many revisions. Note SFHistorySession.LargeItemEntryAmountThreshold is the amount of revisions which above, call
    // for an optimization. An optimization may not remove entries above this threshold. It will determine what it should keep and what it shouldn't.
    // So, it is possible to have a threshold of 60 but have 600 entries, if the item history deems those worth keeping.
    var itemHistory = this.historyForItem(item);
    if(itemHistory.entries.length > SFHistorySession.LargeItemEntryAmountThreshold) {
      itemHistory.optimize();
    }
  }
}

// See comment in `this.optimizeHistoryForItem`
SFHistorySession.LargeItemEntryAmountThreshold = 60;
;// See default class values at bottom of this file, including `SFItemHistory.LargeEntryDeltaThreshold`.

export class SFItemHistory {

  constructor(params = {}) {
    if(!this.entries) {
      this.entries = [];
    }

    // Deserialize the entries into entry objects.
    if(params.entries) {
      for(var entryParams of params.entries) {
        var entry = this.createEntryForItem(entryParams.item);
        entry.setPreviousEntry(this.getLastEntry());
        this.entries.push(entry);
      }
    }
  }

  createEntryForItem(item) {
    var historyItemClass = SFItemHistory.HistoryEntryClassMapping && SFItemHistory.HistoryEntryClassMapping[item.content_type];
    if(!historyItemClass) {
      historyItemClass = SFItemHistoryEntry;
    }
    var entry = new historyItemClass(item);
    return entry;
  }

  getLastEntry() {
    return this.entries[this.entries.length - 1]
  }

  addHistoryEntryForItem(item) {
    var prospectiveEntry = this.createEntryForItem(item);

    var previousEntry = this.getLastEntry();
    prospectiveEntry.setPreviousEntry(previousEntry);

    // Don't add first revision if text length is 0, as this means it's a new note.
    // Actually, nevermind. If we do this, the first character added to a new note
    // will be displayed as "1 characters loaded".
    // if(!previousRevision && prospectiveRevision.textCharDiffLength == 0) {
    //   return;
    // }

    // Don't add if text is the same
    if(prospectiveEntry.isSameAsEntry(previousEntry)) {
      return;
    }

    this.entries.push(prospectiveEntry);
    return prospectiveEntry;
  }

  clear() {
    this.entries.length = 0;
  }

  optimize() {
    var keepEntries = [];

    let isEntrySignificant = (entry) => {
      return entry.deltaSize() > SFItemHistory.LargeEntryDeltaThreshold;
    }

    let processEntry = (entry, index, keep) => {
      // Entries may be processed retrospectively, meaning it can be decided to be deleted, then an upcoming processing can change that.
      if(keep) {
        keepEntries.push(entry);
      } else {
        // Remove if in keep
        var index = keepEntries.indexOf(entry);
        if(index !== -1) {
          keepEntries.splice(index, 1);
        }
      }

      if(keep && isEntrySignificant(entry) && entry.operationVector() == -1) {
        // This is a large negative change. Hang on to the previous entry.
        var previousEntry = this.entries[index - 1];
        if(previousEntry) {
          keepEntries.push(previousEntry);
        }
      }
    }

    this.entries.forEach((entry, index) => {
      if(index == 0 || index == this.entries.length - 1) {
        // Keep the first and last
        processEntry(entry, index, true);
      } else {
        var significant = isEntrySignificant(entry);
        processEntry(entry, index, significant);
      }
    })

    this.entries = this.entries.filter((entry, index) => {
      return keepEntries.indexOf(entry) !== -1;
    })
  }
}

// The amount of characters added or removed that constitute a keepable entry after optimization.
SFItemHistory.LargeEntryDeltaThreshold = 15;
;export class SFItemHistoryEntry {

  constructor(item) {
    // Whatever values `item` has will be persisted, so be sure that the values are picked beforehand.
    this.item = SFItem.deepMerge({}, item);

    // We'll assume a `text` content value to diff on. If it doesn't exist, no problem.
    this.defaultContentKeyToDiffOn = "text";

    // Default value
    this.textCharDiffLength = 0;

    if(typeof this.item.updated_at == 'string') {
      this.item.updated_at = new Date(this.item.updated_at);
    }
  }

  setPreviousEntry(previousEntry) {
    this.hasPreviousEntry = previousEntry != null;

    // we'll try to compute the delta based on an assumed content property of `text`, if it exists.
    if(this.item.content[this.defaultContentKeyToDiffOn]) {
      if(previousEntry) {
        this.textCharDiffLength = this.item.content[this.defaultContentKeyToDiffOn].length - previousEntry.item.content[this.defaultContentKeyToDiffOn].length;
      } else {
        this.textCharDiffLength = this.item.content[this.defaultContentKeyToDiffOn].length;
      }
    }
  }

  operationVector() {
    // We'll try to use the value of `textCharDiffLength` to help determine this, if it's set
    if(this.textCharDiffLength != undefined) {
      if(!this.hasPreviousEntry || this.textCharDiffLength == 0) {
        return 0;
      } else if(this.textCharDiffLength < 0) {
        return -1;
      } else {
        return 1;
      }
    }

    // Otherwise use a default value of 1
    return 1;
  }

  deltaSize() {
    // Up to the subclass to determine how large the delta was, i.e number of characters changed.
    // But this general class won't be able to determine which property it should diff on, or even its format.

    // We can return the `textCharDiffLength` if it's set, otherwise, just return 1;
    if(this.textCharDiffLength != undefined) {
      return Math.abs(this.textCharDiffLength);
    }

    // Otherwise return 1 here to constitute a basic positive delta.
    // The value returned should always be positive. override `operationVector` to return the direction of the delta.
    return 1;
  }

  isSameAsEntry(entry) {
    if(!entry) {
      return false;
    }

    var lhs = new SFItem(this.item);
    var rhs = new SFItem(entry.item);
    return lhs.isItemContentEqualWith(rhs);
  }

}
;export class SNSmartTag extends SNTag {

  constructor(json_ob) {
    super(json_ob);
    this.content_type = "SN|SmartTag";
  }

  static systemSmartTags() {
    return [
      new SNSmartTag({
        uuid: SNSmartTag.SystemSmartTagIdAllNotes,
        dummy: true,
        content: {
          title: "All notes",
          isSystemTag: true,
          isAllTag: true,
          predicate: new SFPredicate.fromArray(["content_type", "=", "Note"])
        }
      }),
      new SNSmartTag({
        uuid: SNSmartTag.SystemSmartTagIdArchivedNotes,
        dummy: true,
        content: {
          title: "Archived",
          isSystemTag: true,
          isArchiveTag: true,
          predicate: new SFPredicate.fromArray(["archived", "=", true])
        }
      }),
      new SNSmartTag({
        uuid: SNSmartTag.SystemSmartTagIdTrashedNotes,
        dummy: true,
        content: {
          title: "Trash",
          isSystemTag: true,
          isTrashTag: true,
          predicate: new SFPredicate.fromArray(["content.trashed", "=", true])
        }
      })
    ]
  }
}

SNSmartTag.SystemSmartTagIdAllNotes = "all-notes";
SNSmartTag.SystemSmartTagIdArchivedNotes = "archived-notes";
SNSmartTag.SystemSmartTagIdTrashedNotes = "trashed-notes";
;export class SNTheme extends SNComponent {

  constructor(json_obj) {
    super(json_obj);
    this.area = "themes";
  }

  isLayerable() {
    return this.package_info && this.package_info.layerable;
  }

  get content_type() {
    return "SN|Theme";
  }

  get displayName() {
    return "Theme";
  }

  setMobileRules(rules) {
    this.setAppDataItem("mobileRules", rules);
  }

  getMobileRules() {
    return this.getAppDataItem("mobileRules") || {constants: {}, rules: {}};
  }

  // Same as getMobileRules but without default value
  hasMobileRules() {
    return this.getAppDataItem("mobileRules");
  }

  setNotAvailOnMobile(na) {
    this.setAppDataItem("notAvailableOnMobile", na);
  }

  getNotAvailOnMobile() {
    return this.getAppDataItem("notAvailableOnMobile");
  }

  /* We must not use .active because if you set that to true, it will also activate that theme on desktop/web */
  setMobileActive(active) {
    this.setAppDataItem("mobileActive", active);
  }

  isMobileActive() {
    return this.getAppDataItem("mobileActive");
  }
}
;/*
  Abstract class with default implementations of some crypto functions.
  Instantiate an instance of either SFCryptoJS (uses cryptojs) or SFCryptoWeb (uses web crypto)
  These subclasses may override some of the functions in this abstract class.
*/

var globalScope = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null);

export class SFAbstractCrypto {

  constructor() {
    this.DefaultPBKDF2Length = 768;
  }

  generateUUIDSync() {
    var crypto = globalScope.crypto || globalScope.msCrypto;
    if(crypto) {
      var buf = new Uint32Array(4);
      crypto.getRandomValues(buf);
      var idx = -1;
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          idx++;
          var r = (buf[idx>>3] >> ((idx%8)*4))&15;
          var v = c == 'x' ? r : (r&0x3|0x8);
          return v.toString(16);
      });
    } else {
      var d = new Date().getTime();
      if(globalScope.performance && typeof globalScope.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
      }
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
      });
      return uuid;
    }
  }

  async generateUUID()  {
    return this.generateUUIDSync();
  }

  /* Constant-time string comparison */
  timingSafeEqual(a, b) {
    var strA = String(a);
    var strB = String(b);
    var lenA = strA.length;
    var result = 0;

    if(lenA !== strB.length) {
      strB = strA;
      result = 1;
    }

    for(var i = 0; i < lenA; i++) {
      result |= (strA.charCodeAt(i) ^ strB.charCodeAt(i));
    }

    return result === 0;
  }

  async decryptText({ciphertextToAuth, contentCiphertext, encryptionKey, iv, authHash, authKey} = {}, requiresAuth) {
    if(requiresAuth && !authHash) {
      console.error("Auth hash is required.");
      return;
    }

    if(authHash) {
      var localAuthHash = await this.hmac256(ciphertextToAuth, authKey);
      if(this.timingSafeEqual(authHash, localAuthHash) === false) {
        console.error("Auth hash does not match, returning null.");
        return null;
      }
    }

    var keyData = CryptoJS.enc.Hex.parse(encryptionKey);
    var ivData  = CryptoJS.enc.Hex.parse(iv || "");
    var decrypted = CryptoJS.AES.decrypt(contentCiphertext, keyData, { iv: ivData,  mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  async encryptText(text, key, iv) {
    var keyData = CryptoJS.enc.Hex.parse(key);
    var ivData  = CryptoJS.enc.Hex.parse(iv || "");
    var encrypted = CryptoJS.AES.encrypt(text, keyData, { iv: ivData,  mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.toString();
  }

  async generateRandomKey(bits) {
    return CryptoJS.lib.WordArray.random(bits/8).toString();
  }

  async generateItemEncryptionKey() {
    // Generates a key that will be split in half, each being 256 bits. So total length will need to be 512.
    let length = 512; let cost = 1;
    var salt = await this.generateRandomKey(length);
    var passphrase = await this.generateRandomKey(length);
    return this.pbkdf2(passphrase, salt, cost, length);
  }

  async firstHalfOfKey(key) {
    return key.substring(0, key.length/2);
  }

  async secondHalfOfKey(key) {
    return key.substring(key.length/2, key.length);
  }

  async base64(text) {
    return globalScope.btoa(encodeURIComponent(text).replace(/%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
  }

  async base64Decode(base64String) {
    return globalScope.atob(base64String);
  }

  async sha256(text) {
    return CryptoJS.SHA256(text).toString();
  }

  async hmac256(message, key) {
    var keyData = CryptoJS.enc.Hex.parse(key);
    var messageData = CryptoJS.enc.Utf8.parse(message);
    var result = CryptoJS.HmacSHA256(messageData, keyData).toString();
    return result;
  }

  async generateSalt(identifier, version, cost, nonce) {
    var result = await this.sha256([identifier, "SF", version, cost, nonce].join(":"));
    return result;
  }

  /** Generates two deterministic keys based on one input */
  async generateSymmetricKeyPair({password, pw_salt, pw_cost} = {}) {
    var output = await this.pbkdf2(password, pw_salt, pw_cost, this.DefaultPBKDF2Length);
    var outputLength = output.length;
    var splitLength = outputLength/3;
    var firstThird = output.slice(0, splitLength);
    var secondThird = output.slice(splitLength, splitLength * 2);
    var thirdThird = output.slice(splitLength * 2, splitLength * 3);
    return [firstThird, secondThird, thirdThird];
  }

  async computeEncryptionKeysForUser(password, authParams) {
    var pw_salt;

    if(authParams.version == "003") {
      if(!authParams.identifier) {
        console.error("authParams is missing identifier.");
        return;
      }
      // Salt is computed from identifier + pw_nonce from server
      pw_salt = await this.generateSalt(authParams.identifier, authParams.version, authParams.pw_cost, authParams.pw_nonce);
    } else {
      // Salt is returned from server
      pw_salt = authParams.pw_salt;
    }

    return this.generateSymmetricKeyPair({password: password, pw_salt: pw_salt, pw_cost: authParams.pw_cost})
    .then((keys) => {
      let userKeys = {pw: keys[0], mk: keys[1], ak: keys[2]};
      return userKeys;
     });
   }

   // Unlike computeEncryptionKeysForUser, this method always uses the latest SF Version
  async generateInitialKeysAndAuthParamsForUser(identifier, password) {
    let version = this.defaults.version;
    var pw_cost = this.defaults.defaultPasswordGenerationCost;
    var pw_nonce = await this.generateRandomKey(256);
    var pw_salt = await this.generateSalt(identifier, version, pw_cost, pw_nonce);

    return this.generateSymmetricKeyPair({password: password, pw_salt: pw_salt, pw_cost: pw_cost})
    .then((keys) => {
      let authParams = {pw_nonce: pw_nonce, pw_cost: pw_cost, identifier: identifier, version: version};
      let userKeys = {pw: keys[0], mk: keys[1], ak: keys[2]};
      return {keys: userKeys, authParams: authParams};
    });
  }

}
;export class SFCryptoJS extends SFAbstractCrypto {

  async pbkdf2(password, pw_salt, pw_cost, length) {
    var params = {
      keySize: length/32,
      hasher: CryptoJS.algo.SHA512,
      iterations: pw_cost
    }

    return CryptoJS.PBKDF2(password, pw_salt, params).toString();
  }

}
;var globalScope = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null);

const subtleCrypto = globalScope.crypto ? globalScope.crypto.subtle : null;

export class SFCryptoWeb extends SFAbstractCrypto {

  /**
  Public
  */

  async pbkdf2(password, pw_salt, pw_cost, length) {
    var key = await this.webCryptoImportKey(password, "PBKDF2", ["deriveBits"]);
    if(!key) {
      console.log("Key is null, unable to continue");
      return null;
    }

    return this.webCryptoDeriveBits(key, pw_salt, pw_cost, length);
  }

  async generateRandomKey(bits) {
    let extractable = true;
    return subtleCrypto.generateKey({name: "AES-CBC", length: bits}, extractable, ["encrypt", "decrypt"]).then((keyObject) => {
      return subtleCrypto.exportKey("raw", keyObject).then(async (keyData) => {
        var key = await this.arrayBufferToHexString(new Uint8Array(keyData));
        return key;
      })
      .catch((err) => {
        console.error("Error exporting key", err);
      });
    })
    .catch((err) => {
      console.error("Error generating key", err);
    });
  }

  async generateItemEncryptionKey() {
    // Generates a key that will be split in half, each being 256 bits. So total length will need to be 512.
    var length = 256;
    return Promise.all([
      this.generateRandomKey(length),
      this.generateRandomKey(length)
    ]).then((values) => {
      return values.join("");
    });
  }

  async encryptText(text, key, iv) {
    // in 001, iv can be null, so we'll initialize to an empty array buffer instead
    var ivData = iv ? await this.hexStringToArrayBuffer(iv) : new ArrayBuffer(16);
    const alg = { name: 'AES-CBC', iv: ivData };

    const keyBuffer = await this.hexStringToArrayBuffer(key);
    var keyData = await this.webCryptoImportKey(keyBuffer, alg.name, ["encrypt"]);
    var textData = await this.stringToArrayBuffer(text);

    return crypto.subtle.encrypt(alg, keyData, textData).then(async (result) => {
      let cipher = await this.arrayBufferToBase64(result);
      return cipher;
    })
  }

  async decryptText({ciphertextToAuth, contentCiphertext, encryptionKey, iv, authHash, authKey} = {}, requiresAuth) {
    if(requiresAuth && !authHash) {
      console.error("Auth hash is required.");
      return;
    }

    if(authHash) {
      var localAuthHash = await this.hmac256(ciphertextToAuth, authKey);
      if(this.timingSafeEqual(authHash, localAuthHash) === false) {
        console.error(`Auth hash does not match, returning null. ${authHash} != ${localAuthHash}`);
        return null;
      }
    }

    // in 001, iv can be null, so we'll initialize to an empty array buffer instead
    var ivData = iv ? await this.hexStringToArrayBuffer(iv) : new ArrayBuffer(16);
    const alg = { name: 'AES-CBC', iv: ivData };

    const keyBuffer = await this.hexStringToArrayBuffer(encryptionKey);
    var keyData = await this.webCryptoImportKey(keyBuffer, alg.name, ["decrypt"]);
    var textData = await this.base64ToArrayBuffer(contentCiphertext);

    return crypto.subtle.decrypt(alg, keyData, textData).then(async (result) => {
      var decoded = await this.arrayBufferToString(result);
      return decoded;
    }).catch((error) => {
      console.error("Error decrypting:", error);
    })
  }

  async hmac256(message, key) {
    var keyHexData = await this.hexStringToArrayBuffer(key);
    var keyData = await this.webCryptoImportKey(keyHexData, "HMAC", ["sign"], {name: "SHA-256"});
    var messageData = await this.stringToArrayBuffer(message);
    return crypto.subtle.sign({name: "HMAC"}, keyData, messageData)
    .then(async (signature) => {
      var hash = await this.arrayBufferToHexString(signature);
      return hash;
    })
    .catch(function(err){
      console.error("Error computing hmac", err);
    });
  }

  /**
  Internal
  */

  async webCryptoImportKey(input, alg, actions, hash) {
    var text = typeof input === "string" ? await this.stringToArrayBuffer(input) : input;
    return subtleCrypto.importKey("raw", text, { name: alg, hash: hash }, false, actions)
    .then((key) => {
      return key;
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
  }

  async webCryptoDeriveBits(key, pw_salt, pw_cost, length) {
    var params = {
      "name": "PBKDF2",
      salt: await this.stringToArrayBuffer(pw_salt),
      iterations: pw_cost,
      hash: {name: "SHA-512"},
    }

    return subtleCrypto.deriveBits(params, key, length)
    .then(async (bits) => {
      var key = await this.arrayBufferToHexString(new Uint8Array(bits));
      return key;
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
  }

  async stringToArrayBuffer(string) {
    // Using FileReader for higher performance amongst larger files
    return new Promise((resolve, reject) => {
      var blob = new Blob([string]);
      var f = new FileReader();
      f.onload = function(e) {
        resolve(e.target.result);
      }
      f.readAsArrayBuffer(blob);
    })
  }

  async arrayBufferToString(arrayBuffer) {
    // Using FileReader for higher performance amongst larger files
    return new Promise((resolve, reject) => {
      var blob = new Blob([arrayBuffer]);
      var f = new FileReader();
      f.onload = function(e) {
        resolve(e.target.result);
      }
      f.readAsText(blob);
    })
  }

  async arrayBufferToHexString(arrayBuffer) {
    var byteArray = new Uint8Array(arrayBuffer);
    var hexString = "";
    var nextHexByte;

    for (var i=0; i<byteArray.byteLength; i++) {
      nextHexByte = byteArray[i].toString(16);
      if(nextHexByte.length < 2) {
        nextHexByte = "0" + nextHexByte;
      }
      hexString += nextHexByte;
    }
    return hexString;
  }

  async hexStringToArrayBuffer(hex) {
    for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
    return new Uint8Array(bytes);
  }

  async base64ToArrayBuffer(base64) {
    var binary_string = await this.base64Decode(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for(var i = 0; i < len; i++)        {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  async arrayBufferToBase64(buffer) {
    return new Promise((resolve, reject) => {
      var blob = new Blob([buffer],{type:'application/octet-binary'});
      var reader = new FileReader();
      reader.onload = function(evt){
        var dataurl = evt.target.result;
        resolve(dataurl.substr(dataurl.indexOf(',') + 1));
      };
      reader.readAsDataURL(blob);
    })
  }

}
;export class SFItemTransformer {

  constructor(crypto) {
    this.crypto = crypto;
  }

  async _private_encryptString(string, encryptionKey, authKey, uuid, auth_params) {
    var fullCiphertext, contentCiphertext;
    if(auth_params.version === "001") {
      contentCiphertext = await this.crypto.encryptText(string, encryptionKey, null);
      fullCiphertext = auth_params.version + contentCiphertext;
    } else {
      var iv = await this.crypto.generateRandomKey(128);
      contentCiphertext = await this.crypto.encryptText(string, encryptionKey, iv);
      var ciphertextToAuth = [auth_params.version, uuid, iv, contentCiphertext].join(":");
      var authHash = await this.crypto.hmac256(ciphertextToAuth, authKey);
      var authParamsString = await this.crypto.base64(JSON.stringify(auth_params));
      fullCiphertext = [auth_params.version, authHash, uuid, iv, contentCiphertext, authParamsString].join(":");
    }

    return fullCiphertext;
  }

  async encryptItem(item, keys, auth_params) {
    var params = {};
    // encrypt item key
    var item_key = await this.crypto.generateItemEncryptionKey();
    if(auth_params.version === "001") {
      // legacy
      params.enc_item_key = await this.crypto.encryptText(item_key, keys.mk, null);
    } else {
      params.enc_item_key = await this._private_encryptString(item_key, keys.mk, keys.ak, item.uuid, auth_params);
    }

    // encrypt content
    var ek = await this.crypto.firstHalfOfKey(item_key);
    var ak = await this.crypto.secondHalfOfKey(item_key);
    var ciphertext = await this._private_encryptString(JSON.stringify(item.createContentJSONFromProperties()), ek, ak, item.uuid, auth_params);
    if(auth_params.version === "001") {
      var authHash = await this.crypto.hmac256(ciphertext, ak);
      params.auth_hash = authHash;
    }

    params.content = ciphertext;
    return params;
  }

  encryptionComponentsFromString(string, encryptionKey, authKey) {
    var encryptionVersion = string.substring(0, 3);
    if(encryptionVersion === "001") {
      return {
        contentCiphertext: string.substring(3, string.length),
        encryptionVersion: encryptionVersion,
        ciphertextToAuth: string,
        iv: null,
        authHash: null,
        encryptionKey: encryptionKey,
        authKey: authKey
      }
    } else {
      let components = string.split(":");
      return {
        encryptionVersion: components[0],
        authHash: components[1],
        uuid: components[2],
        iv: components[3],
        contentCiphertext: components[4],
        authParams: components[5],
        ciphertextToAuth: [components[0], components[2], components[3], components[4]].join(":"),
        encryptionKey: encryptionKey,
        authKey: authKey,
      }
    }
  }

  async decryptItem(item, keys) {

    if(typeof item.content != "string") {
      // Content is already an object, can't do anything with it.
      return;
    }

    if(item.content.startsWith("000")) {
      // is base64 encoded
      try {
        item.content = JSON.parse(await this.crypto.base64Decode(item.content.substring(3, item.content.length)));
      } catch (e) {}

      return;
    }

    if(!item.enc_item_key) {
      // This needs to be here to continue, return otherwise
      console.log("Missing item encryption key, skipping decryption.");
      return;
    }

    // decrypt encrypted key
    var encryptedItemKey = item.enc_item_key;
    var requiresAuth = true;
    if(!encryptedItemKey.startsWith("002") && !encryptedItemKey.startsWith("003")) {
      // legacy encryption type, has no prefix
      encryptedItemKey = "001" + encryptedItemKey;
      requiresAuth = false;
    }
    var keyParams = this.encryptionComponentsFromString(encryptedItemKey, keys.mk, keys.ak);

    // return if uuid in auth hash does not match item uuid. Signs of tampering.
    if(keyParams.uuid && keyParams.uuid !== item.uuid) {
      console.error("Item key params UUID does not match item UUID");
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
      return;
    }

    var item_key = await this.crypto.decryptText(keyParams, requiresAuth);

    if(!item_key) {
      console.log("Error decrypting item", item);
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
      return;
    }

    // decrypt content
    var ek = await this.crypto.firstHalfOfKey(item_key);
    var ak = await this.crypto.secondHalfOfKey(item_key);
    var itemParams = this.encryptionComponentsFromString(item.content, ek, ak);

    try {
      item.auth_params = JSON.parse(await this.crypto.base64Decode(itemParams.authParams));
    } catch (e) {}

    // return if uuid in auth hash does not match item uuid. Signs of tampering.
    if(itemParams.uuid && itemParams.uuid !== item.uuid) {
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
      return;
    }

    if(!itemParams.authHash) {
      // legacy 001
      itemParams.authHash = item.auth_hash;
    }

    var content = await this.crypto.decryptText(itemParams, true);
    if(!content) {
      if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
      item.errorDecrypting = true;
    } else {
      if(item.errorDecrypting == true) { item.errorDecryptingValueChanged = true;}
       // Content should only be set if it was successfully decrypted, and should otherwise remain unchanged.
      item.errorDecrypting = false;
      item.content = content;
    }
  }

  async decryptMultipleItems(items, keys, throws) {
    let decrypt = async (item) => {
      if(!item) {
        return;
      }
      // 4/15/18: Adding item.content == null clause. We still want to decrypt deleted items incase
      // they were marked as dirty but not yet synced. Not yet sure why we had this requirement.
      if(item.deleted == true && item.content == null) {
        return;
      }

      var isString = typeof item.content === 'string' || item.content instanceof String;
      if(isString) {
        try {
          await this.decryptItem(item, keys);
        } catch (e) {
          if(!item.errorDecrypting) { item.errorDecryptingValueChanged = true;}
          item.errorDecrypting = true;
          if(throws) {
            throw e;
          }
          console.error("Error decrypting item", item, e);
          return;
        }
      }
    }

    return Promise.all(items.map((item) => {
      return decrypt(item);
    }));

  }
}
;var globalScope = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null);

export class StandardNotes {
  constructor(cryptoInstance) {
    // This library runs in native environments as well (react native)
    if(globalScope) {
      // detect IE8 and above, and edge.
      // IE and Edge do not support pbkdf2 in WebCrypto, therefore we need to use CryptoJS
      var IEOrEdge = (typeof document !== 'undefined' && document.documentMode) || /Edge/.test(navigator.userAgent);

      if(!IEOrEdge && (globalScope.crypto && globalScope.crypto.subtle)) {
        this.crypto = new SFCryptoWeb();
      } else {
        this.crypto = new SFCryptoJS();
      }
    }

    // This must be placed outside window check, as it's used in native.
    if(cryptoInstance) {
      this.crypto = cryptoInstance;
    }

    this.itemTransformer = new SFItemTransformer(this.crypto);

    this.crypto.defaults = {
      version : this.version(),
      defaultPasswordGenerationCost : this.defaultPasswordGenerationCost()
    }
  }

  version() {
    return "003";
  }

  supportsPasswordDerivationCost(cost) {
    // some passwords are created on platforms with stronger pbkdf2 capabilities, like iOS,
    // which CryptoJS can't handle here (WebCrypto can however).
    // if user has high password cost and is using browser that doesn't support WebCrypto,
    // we want to tell them that they can't login with this browser.
    if(cost > 5000) {
      return this.crypto instanceof SFCryptoWeb;
    } else {
      return true;
    }
  }

  // Returns the versions that this library supports technically.
  supportedVersions() {
    return ["001", "002", "003"];
  }

  isVersionNewerThanLibraryVersion(version) {
    var libraryVersion = this.version();
    return parseInt(version) > parseInt(libraryVersion);
  }

  isProtocolVersionOutdated(version) {
    // YYYY-MM-DD
    let expirationDates = {
      "001" : Date.parse("2018-01-01"),
      "002" : Date.parse("2020-01-01"),
    }

    let date = expirationDates[version];
    if(!date) {
      // No expiration date, is active version
      return false;
    }
    let expired = new Date() > date;
    return expired;
  }

  costMinimumForVersion(version) {
    return {
      "001" : 3000,
      "002" : 3000,
      "003" : 110000
    }[version];
  }

  defaultPasswordGenerationCost() {
    return this.costMinimumForVersion(this.version());
  }
}

if(globalScope) {
  // window is for some reason defined in React Native, but throws an exception when you try to set to it
  try {
    globalScope.StandardNotes = StandardNotes;
    globalScope.SNJS = new StandardNotes();
    globalScope.SFCryptoWeb = SFCryptoWeb;
    globalScope.SFCryptoJS = SFCryptoJS;
    globalScope.SFItemTransformer = SFItemTransformer;
    globalScope.SFModelManager = SFModelManager;
    globalScope.SFItem = SFItem;
    globalScope.SFItemParams = SFItemParams;
    globalScope.SFHttpManager = SFHttpManager;
    globalScope.SFStorageManager = SFStorageManager;
    globalScope.SFSyncManager = SFSyncManager;
    globalScope.SFAuthManager = SFAuthManager;
    globalScope.SFMigrationManager = SFMigrationManager;
    globalScope.SFAlertManager = SFAlertManager;
    globalScope.SFPredicate = SFPredicate;
    globalScope.SFHistorySession = SFHistorySession;
    globalScope.SFSessionHistoryManager = SFSessionHistoryManager
    globalScope.SFItemHistory = SFItemHistory;
    globalScope.SFItemHistoryEntry = SFItemHistoryEntry;
    globalScope.SFPrivilegesManager = SFPrivilegesManager;
    globalScope.SFPrivileges = SFPrivileges;
    globalScope.SFSingletonManager = SFSingletonManager;

    globalScope.SNNote = SNNote;
    globalScope.SNTag = SNTag;
    globalScope.SNSmartTag = SNSmartTag;
    globalScope.SNMfa = SNMfa;
    globalScope.SNServerExtension = SNServerExtension;
    globalScope.SNComponent = SNComponent;
    globalScope.SNEditor = SNEditor;
    globalScope.SNExtension = SNExtension;
    globalScope.SNTheme = SNTheme;
    globalScope.SNEncryptedStorage = SNEncryptedStorage;
    globalScope.SNComponentManager = SNComponentManager;
  } catch (e) {
    console.log("Exception while exporting window variables", e);
  }
}
