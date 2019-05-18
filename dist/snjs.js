"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SNTheme = exports.SNSmartTag = exports.SNServerExtension = exports.SNMfa = exports.SNEncryptedStorage = exports.SNTag = exports.SNNote = exports.SNExtension = exports.Action = exports.SNEditor = exports.SNComponent = exports.SNComponentManager = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _standardFileJs = require("standard-file-js");

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SNComponentManager = exports.SNComponentManager = function () {

  /*
    @param {string} environment: one of [web, desktop, mobile]
    @param {string} platform: one of [ios, android, linux-${environment}, mac-${environment}, windows-${environment}]
  */
  function SNComponentManager(_ref) {
    var modelManager = _ref.modelManager,
        syncManager = _ref.syncManager,
        desktopManager = _ref.desktopManager,
        nativeExtManager = _ref.nativeExtManager,
        alertManager = _ref.alertManager,
        $uiRunner = _ref.$uiRunner,
        $timeout = _ref.$timeout,
        environment = _ref.environment,
        platform = _ref.platform;

    _classCallCheck(this, SNComponentManager);

    /* This domain will be used to save context item client data */
    SNComponentManager.ClientDataDomain = "org.standardnotes.sn.components";

    // Some actions need to be run on the ui thread (desktop/web only)
    this.$uiRunner = $uiRunner || function (fn) {
      fn();
    };
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

    if (environment != "mobile") {
      this.configureForNonMobileUsage();
    }

    this.configureForGeneralUsage();

    // this.loggingEnabled = true;

    this.permissionDialogs = [];

    this.handlers = [];
  }

  _createClass(SNComponentManager, [{
    key: "configureForGeneralUsage",
    value: function configureForGeneralUsage() {
      var _this = this;

      this.modelManager.addItemSyncObserver("component-manager", "*", function (allItems, validItems, deletedItems, source, sourceKey) {

        /* If the source of these new or updated items is from a Component itself saving items, we don't need to notify
          components again of the same item. Regarding notifying other components than the issuing component, other mapping sources
          will take care of that, like SFModelManager.MappingSourceRemoteSaved
           Update: We will now check sourceKey to determine whether the incoming change should be sent to
          a component. If sourceKey == component.uuid, it will be skipped. This way, if one component triggers a change,
          it's sent to other components.
         */
        // if(source == SFModelManager.MappingSourceComponentRetrieved) {
        //   return;
        // }

        var syncedComponents = allItems.filter(function (item) {
          return item.content_type === "SN|Component" || item.content_type == "SN|Theme";
        });

        /* We only want to sync if the item source is Retrieved, not MappingSourceRemoteSaved to avoid
          recursion caused by the component being modified and saved after it is updated.
        */
        if (syncedComponents.length > 0 && source != SFModelManager.MappingSourceRemoteSaved) {
          // Ensure any component in our data is installed by the system
          if (_this.isDesktop) {
            _this.desktopManager.syncComponentsInstallation(syncedComponents);
          }
        }

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = syncedComponents[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var component = _step.value;

            var activeComponent = _.find(_this.activeComponents, { uuid: component.uuid });
            if (component.active && !component.deleted && !activeComponent) {
              _this.activateComponent(component);
            } else if (!component.active && activeComponent) {
              _this.deactivateComponent(component);
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        var _loop = function _loop(observer) {
          if (sourceKey && sourceKey == observer.component.uuid) {
            // Don't notify source of change, as it is the originator, doesn't need duplicate event.
            return "continue";
          }

          var relevantItems = allItems.filter(function (item) {
            return observer.contentTypes.indexOf(item.content_type) !== -1;
          });

          if (relevantItems.length == 0) {
            return "continue";
          }

          var requiredPermissions = [{
            name: "stream-items",
            content_types: observer.contentTypes.sort()
          }];

          _this.runWithPermissions(observer.component, requiredPermissions, function () {
            _this.sendItemsInReply(observer.component, relevantItems, observer.originalMessage);
          });
        };

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = _this.streamObservers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var observer = _step2.value;

            var _ret = _loop(observer);

            if (_ret === "continue") continue;
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        var requiredContextPermissions = [{
          name: "stream-context-item"
        }];

        var _loop2 = function _loop2(observer) {
          if (sourceKey && sourceKey == observer.component.uuid) {
            // Don't notify source of change, as it is the originator, doesn't need duplicate event.
            return "continue";
          }

          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = _this.handlers[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var handler = _step4.value;

              if (!handler.areas.includes(observer.component.area) && !handler.areas.includes("*")) {
                continue;
              }
              if (handler.contextRequestHandler) {
                itemInContext = handler.contextRequestHandler(observer.component);

                if (itemInContext) {
                  matchingItem = _.find(allItems, { uuid: itemInContext.uuid });

                  if (matchingItem) {
                    _this.runWithPermissions(observer.component, requiredContextPermissions, function () {
                      _this.sendContextItemInReply(observer.component, matchingItem, observer.originalMessage, source);
                    });
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }
        };

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = _this.contextStreamObservers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var observer = _step3.value;
            var itemInContext;
            var matchingItem;

            var _ret2 = _loop2(observer);

            if (_ret2 === "continue") continue;
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      });
    }
  }, {
    key: "configureForNonMobileUsage",
    value: function configureForNonMobileUsage() {
      var _this2 = this;

      var detectFocusChange = function detectFocusChange(event) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = _this2.activeComponents[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var component = _step5.value;

            if (document.activeElement == _this2.iframeForComponent(component)) {
              _this2.$timeout(function () {
                _this2.focusChangedForComponent(component);
              });
              break;
            }
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }
      };

      window.addEventListener ? window.addEventListener('focus', detectFocusChange, true) : window.attachEvent('onfocusout', detectFocusChange);
      window.addEventListener ? window.addEventListener('blur', detectFocusChange, true) : window.attachEvent('onblur', detectFocusChange);

      this.desktopManager.registerUpdateObserver(function (component) {
        // Reload theme if active
        if (component.active && component.isTheme()) {
          _this2.postActiveThemesToAllComponents();
        }
      });

      // On mobile, events listeners are handled by a respective component
      window.addEventListener("message", function (event) {
        if (_this2.loggingEnabled) {
          console.log("Web app: received message", event);
        }

        // Make sure this message is for us
        if (event.data.sessionKey) {
          _this2.handleMessage(_this2.componentForSessionKey(event.data.sessionKey), event.data);
        }
      }, false);
    }
  }, {
    key: "postActiveThemesToAllComponents",
    value: function postActiveThemesToAllComponents() {
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = this.components[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var component = _step6.value;

          // Skip over components that are themes themselves,
          // or components that are not active, or components that don't have a window
          if (component.isTheme() || !component.active || !component.window) {
            continue;
          }

          this.postActiveThemesToComponent(component);
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }
    }
  }, {
    key: "getActiveThemes",
    value: function getActiveThemes() {
      return this.componentsForArea("themes").filter(function (theme) {
        return theme.active;
      });
    }
  }, {
    key: "urlsForActiveThemes",
    value: function urlsForActiveThemes() {
      var _this3 = this;

      var themes = this.getActiveThemes();
      return themes.map(function (theme) {
        return _this3.urlForComponent(theme);
      });
    }
  }, {
    key: "postActiveThemesToComponent",
    value: function postActiveThemesToComponent(component) {
      var urls = this.urlsForActiveThemes();
      var data = { themes: urls };

      this.sendMessageToComponent(component, { action: "themes", data: data });
    }
  }, {
    key: "contextItemDidChangeInArea",
    value: function contextItemDidChangeInArea(area) {
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = this.handlers[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var handler = _step7.value;

          if (handler.areas.includes(area) === false && !handler.areas.includes("*")) {
            continue;
          }
          var observers = this.contextStreamObservers.filter(function (observer) {
            return observer.component.area === area;
          });

          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = observers[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var observer = _step8.value;

              if (handler.contextRequestHandler) {
                var itemInContext = handler.contextRequestHandler(observer.component);
                if (itemInContext) {
                  this.sendContextItemInReply(observer.component, itemInContext, observer.originalMessage);
                }
              }
            }
          } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion8 && _iterator8.return) {
                _iterator8.return();
              }
            } finally {
              if (_didIteratorError8) {
                throw _iteratorError8;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }
    }
  }, {
    key: "setComponentHidden",
    value: function setComponentHidden(component, hidden) {
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
        var contextObserver = _.find(this.contextStreamObservers, { identifier: component.uuid });
        if (contextObserver) {
          this.handleStreamContextItemMessage(component, contextObserver.originalMessage);
        }

        // streamItems
        var streamObserver = _.find(this.streamObservers, { identifier: component.uuid });
        if (streamObserver) {
          this.handleStreamItemsMessage(component, streamObserver.originalMessage);
        }
      }
    }
  }, {
    key: "jsonForItem",
    value: function jsonForItem(item, component, source) {
      var params = { uuid: item.uuid, content_type: item.content_type, created_at: item.created_at, updated_at: item.updated_at, deleted: item.deleted };
      params.content = item.createContentJSONFromProperties();
      params.clientData = item.getDomainDataItem(component.getClientDataKey(), SNComponentManager.ClientDataDomain) || {};

      /* This means the this function is being triggered through a remote Saving response, which should not update
        actual local content values. The reason is, Save responses may be delayed, and a user may have changed some values
        in between the Save was initiated, and the time it completes. So we only want to update actual content values (and not just metadata)
        when its another source, like SFModelManager.MappingSourceRemoteRetrieved.
         3/7/18: Add MappingSourceLocalSaved as well to handle fully offline saving. github.com/standardnotes/forum/issues/169
       */
      if (source && (source == SFModelManager.MappingSourceRemoteSaved || source == SFModelManager.MappingSourceLocalSaved)) {
        params.isMetadataUpdate = true;
      }
      this.removePrivatePropertiesFromResponseItems([params], component);
      return params;
    }
  }, {
    key: "sendItemsInReply",
    value: function sendItemsInReply(component, items, message, source) {
      var _this4 = this;

      if (this.loggingEnabled) {
        console.log("Web|componentManager|sendItemsInReply", component, items, message);
      };
      var response = { items: {} };
      var mapped = items.map(function (item) {
        return _this4.jsonForItem(item, component, source);
      });

      response.items = mapped;
      this.replyToMessage(component, message, response);
    }
  }, {
    key: "sendContextItemInReply",
    value: function sendContextItemInReply(component, item, originalMessage, source) {
      if (this.loggingEnabled) {
        console.log("Web|componentManager|sendContextItemInReply", component, item, originalMessage);
      };
      var response = { item: this.jsonForItem(item, component, source) };
      this.replyToMessage(component, originalMessage, response);
    }
  }, {
    key: "replyToMessage",
    value: function replyToMessage(component, originalMessage, replyData) {
      var reply = {
        action: "reply",
        original: originalMessage,
        data: replyData
      };

      this.sendMessageToComponent(component, reply);
    }
  }, {
    key: "sendMessageToComponent",
    value: function sendMessageToComponent(component, message) {
      var permissibleActionsWhileHidden = ["component-registered", "themes"];
      if (component.hidden && !permissibleActionsWhileHidden.includes(message.action)) {
        if (this.loggingEnabled) {
          console.log("Component disabled for current item, not sending any messages.", component.name);
        }
        return;
      }

      if (this.loggingEnabled) {
        console.log("Web|sendMessageToComponent", component, message);
      }

      var origin = this.urlForComponent(component, "file://");
      if (!origin.startsWith("http") && !origin.startsWith("file")) {
        // Native extension running in web, prefix current host
        origin = window.location.href + origin;
      }

      if (!component.window) {
        this.alertManager.alert({ text: "Standard Notes is trying to communicate with " + component.name + ", but an error is occurring. Please restart this extension and try again." });
      }

      // Mobile messaging requires json
      if (this.isMobile) {
        message = JSON.stringify(message);
      }

      component.window.postMessage(message, origin);
    }
  }, {
    key: "componentsForArea",
    value: function componentsForArea(area) {
      return this.components.filter(function (component) {
        return component.area === area;
      });
    }
  }, {
    key: "urlForComponent",
    value: function urlForComponent(component) {
      var offlinePrefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";

      // offlineOnly is available only on desktop, and not on web or mobile.
      if (component.offlineOnly && !this.isDesktop) {
        return null;
      }

      if (component.offlineOnly || this.isDesktop && component.local_url) {
        return component.local_url && component.local_url.replace("sn://", offlinePrefix + this.desktopManager.getApplicationDataPath() + "/");
      } else {
        var url = component.hosted_url || component.legacy_url;
        if (this.isMobile) {
          var localReplacement = this.platform == "ios" ? "localhost" : "10.0.2.2";
          url = url.replace("localhost", localReplacement).replace("sn.local", localReplacement);
        }
        return url;
      }
    }
  }, {
    key: "componentForUrl",
    value: function componentForUrl(url) {
      return this.components.filter(function (component) {
        return component.hosted_url === url || component.legacy_url === url;
      })[0];
    }
  }, {
    key: "componentForSessionKey",
    value: function componentForSessionKey(key) {
      var component = _.find(this.components, { sessionKey: key });
      if (!component) {
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = this.handlers[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var handler = _step9.value;

            if (handler.componentForSessionKeyHandler) {
              component = handler.componentForSessionKeyHandler(key);
              if (component) {
                break;
              }
            }
          }
        } catch (err) {
          _didIteratorError9 = true;
          _iteratorError9 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion9 && _iterator9.return) {
              _iterator9.return();
            }
          } finally {
            if (_didIteratorError9) {
              throw _iteratorError9;
            }
          }
        }
      }
      return component;
    }
  }, {
    key: "handleMessage",
    value: function handleMessage(component, message) {
      var _this5 = this;

      if (!component) {
        console.log("Component not defined for message, returning", message);
        this.alertManager.alert({ text: "An extension is trying to communicate with Standard Notes, but there is an error establishing a bridge. Please restart the app and try again." });
        return;
      }

      // Actions that won't succeeed with readonly mode
      var readwriteActions = ["save-items", "associate-item", "deassociate-item", "create-item", "create-items", "delete-items", "set-component-data"];

      if (component.readonly && readwriteActions.includes(message.action)) {
        // A component can be marked readonly if changes should not be saved.
        // Particullary used for revision preview windows where the notes should not be savable.
        this.alertManager.alert({ text: "The extension " + component.name + " is trying to save, but it is in a locked state and cannot accept changes." });
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
        var componentToToggle = this.modelManager.findItem(message.data.uuid);
        this.handleToggleComponentMessage(component, componentToToggle, message);
      } else if (message.action === "request-permissions") {
        this.handleRequestPermissionsMessage(component, message);
      } else if (message.action === "install-local-component") {
        this.handleInstallLocalComponentMessage(component, message);
      } else if (message.action === "duplicate-item") {
        this.handleDuplicateItemMessage(component, message);
      }

      // Notify observers

      var _loop3 = function _loop3(handler) {
        if (handler.actionHandler && (handler.areas.includes(component.area) || handler.areas.includes("*"))) {
          _this5.$timeout(function () {
            handler.actionHandler(component, message.action, message.data);
          });
        }
      };

      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = this.handlers[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          var handler = _step10.value;

          _loop3(handler);
        }
      } catch (err) {
        _didIteratorError10 = true;
        _iteratorError10 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion10 && _iterator10.return) {
            _iterator10.return();
          }
        } finally {
          if (_didIteratorError10) {
            throw _iteratorError10;
          }
        }
      }
    }
  }, {
    key: "removePrivatePropertiesFromResponseItems",
    value: function removePrivatePropertiesFromResponseItems(responseItems, component) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

      if (component) {
        // System extensions can bypass this step
        if (this.nativeExtManager && this.nativeExtManager.isSystemExtension(component)) {
          return;
        }
      }
      // Don't allow component to overwrite these properties.
      var privateProperties = ["autoupdateDisabled", "permissions", "active"];
      if (options) {
        if (options.includeUrls) {
          privateProperties = privateProperties.concat(["url", "hosted_url", "local_url"]);
        }
      }
      var _iteratorNormalCompletion11 = true;
      var _didIteratorError11 = false;
      var _iteratorError11 = undefined;

      try {
        for (var _iterator11 = responseItems[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
          var responseItem = _step11.value;

          // Do not pass in actual items here, otherwise that would be destructive.
          // Instead, generic JS/JSON objects should be passed.
          if (typeof responseItem.setDirty === 'function') {
            console.error("Attempting to pass object. Use JSON.");
            continue;
          }

          var _iteratorNormalCompletion12 = true;
          var _didIteratorError12 = false;
          var _iteratorError12 = undefined;

          try {
            for (var _iterator12 = privateProperties[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
              var prop = _step12.value;

              delete responseItem.content[prop];
            }
          } catch (err) {
            _didIteratorError12 = true;
            _iteratorError12 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion12 && _iterator12.return) {
                _iterator12.return();
              }
            } finally {
              if (_didIteratorError12) {
                throw _iteratorError12;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError11 = true;
        _iteratorError11 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion11 && _iterator11.return) {
            _iterator11.return();
          }
        } finally {
          if (_didIteratorError11) {
            throw _iteratorError11;
          }
        }
      }
    }
  }, {
    key: "handleStreamItemsMessage",
    value: function handleStreamItemsMessage(component, message) {
      var _this6 = this;

      var requiredPermissions = [{
        name: "stream-items",
        content_types: message.data.content_types.sort()
      }];

      this.runWithPermissions(component, requiredPermissions, function () {
        if (!_.find(_this6.streamObservers, { identifier: component.uuid })) {
          // for pushing laster as changes come in
          _this6.streamObservers.push({
            identifier: component.uuid,
            component: component,
            originalMessage: message,
            contentTypes: message.data.content_types
          });
        }

        // push immediately now
        var items = [];
        var _iteratorNormalCompletion13 = true;
        var _didIteratorError13 = false;
        var _iteratorError13 = undefined;

        try {
          for (var _iterator13 = message.data.content_types[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
            var contentType = _step13.value;

            items = items.concat(_this6.modelManager.validItemsForContentType(contentType));
          }
        } catch (err) {
          _didIteratorError13 = true;
          _iteratorError13 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion13 && _iterator13.return) {
              _iterator13.return();
            }
          } finally {
            if (_didIteratorError13) {
              throw _iteratorError13;
            }
          }
        }

        _this6.sendItemsInReply(component, items, message);
      });
    }
  }, {
    key: "handleStreamContextItemMessage",
    value: function handleStreamContextItemMessage(component, message) {
      var _this7 = this;

      var requiredPermissions = [{
        name: "stream-context-item"
      }];

      this.runWithPermissions(component, requiredPermissions, function () {
        if (!_.find(_this7.contextStreamObservers, { identifier: component.uuid })) {
          // for pushing laster as changes come in
          _this7.contextStreamObservers.push({
            identifier: component.uuid,
            component: component,
            originalMessage: message
          });
        }

        // push immediately now
        var _iteratorNormalCompletion14 = true;
        var _didIteratorError14 = false;
        var _iteratorError14 = undefined;

        try {
          for (var _iterator14 = _this7.handlersForArea(component.area)[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
            var handler = _step14.value;

            if (handler.contextRequestHandler) {
              var itemInContext = handler.contextRequestHandler(component);
              if (itemInContext) {
                _this7.sendContextItemInReply(component, itemInContext, message);
              }
            }
          }
        } catch (err) {
          _didIteratorError14 = true;
          _iteratorError14 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion14 && _iterator14.return) {
              _iterator14.return();
            }
          } finally {
            if (_didIteratorError14) {
              throw _iteratorError14;
            }
          }
        }
      });
    }
  }, {
    key: "isItemIdWithinComponentContextJurisdiction",
    value: function isItemIdWithinComponentContextJurisdiction(uuid, component) {
      var itemIdsInJurisdiction = this.itemIdsInContextJurisdictionForComponent(component);
      return itemIdsInJurisdiction.includes(uuid);
    }

    /* Returns items that given component has context permissions for */

  }, {
    key: "itemIdsInContextJurisdictionForComponent",
    value: function itemIdsInContextJurisdictionForComponent(component) {
      var itemIds = [];
      var _iteratorNormalCompletion15 = true;
      var _didIteratorError15 = false;
      var _iteratorError15 = undefined;

      try {
        for (var _iterator15 = this.handlersForArea(component.area)[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
          var handler = _step15.value;

          if (handler.contextRequestHandler) {
            var itemInContext = handler.contextRequestHandler(component);
            if (itemInContext) {
              itemIds.push(itemInContext.uuid);
            }
          }
        }
      } catch (err) {
        _didIteratorError15 = true;
        _iteratorError15 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion15 && _iterator15.return) {
            _iterator15.return();
          }
        } finally {
          if (_didIteratorError15) {
            throw _iteratorError15;
          }
        }
      }

      return itemIds;
    }
  }, {
    key: "handlersForArea",
    value: function handlersForArea(area) {
      return this.handlers.filter(function (candidate) {
        return candidate.areas.includes(area);
      });
    }
  }, {
    key: "handleSaveItemsMessage",
    value: function handleSaveItemsMessage(component, message) {
      var _this8 = this;

      var responseItems = message.data.items;
      var requiredPermissions = [];

      var itemIdsInContextJurisdiction = this.itemIdsInContextJurisdictionForComponent(component);

      // Pending as in needed to be accounted for in permissions.
      var pendingResponseItems = responseItems.slice();

      var _iteratorNormalCompletion16 = true;
      var _didIteratorError16 = false;
      var _iteratorError16 = undefined;

      try {
        for (var _iterator16 = responseItems.slice()[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
          var responseItem = _step16.value;

          if (itemIdsInContextJurisdiction.includes(responseItem.uuid)) {
            requiredPermissions.push({
              name: "stream-context-item"
            });
            _.pull(pendingResponseItems, responseItem);
            // We break because there can only be one context item
            break;
          }
        }

        // Check to see if additional privileges are required
      } catch (err) {
        _didIteratorError16 = true;
        _iteratorError16 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion16 && _iterator16.return) {
            _iterator16.return();
          }
        } finally {
          if (_didIteratorError16) {
            throw _iteratorError16;
          }
        }
      }

      if (pendingResponseItems.length > 0) {
        var requiredContentTypes = _.uniq(pendingResponseItems.map(function (i) {
          return i.content_type;
        })).sort();
        requiredPermissions.push({
          name: "stream-items",
          content_types: requiredContentTypes
        });
      }

      this.runWithPermissions(component, requiredPermissions, function () {

        _this8.removePrivatePropertiesFromResponseItems(responseItems, component, { includeUrls: true });

        /*
        We map the items here because modelManager is what updates the UI. If you were to instead get the items directly,
        this would update them server side via sync, but would never make its way back to the UI.
        */

        // Filter locked items
        var ids = responseItems.map(function (i) {
          return i.uuid;
        });
        var items = _this8.modelManager.findItems(ids);
        var lockedCount = 0;
        var _iteratorNormalCompletion17 = true;
        var _didIteratorError17 = false;
        var _iteratorError17 = undefined;

        try {
          for (var _iterator17 = items[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
            var item = _step17.value;

            if (item.locked) {
              _.remove(responseItems, { uuid: item.uuid });
              lockedCount++;
            }
          }
        } catch (err) {
          _didIteratorError17 = true;
          _iteratorError17 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion17 && _iterator17.return) {
              _iterator17.return();
            }
          } finally {
            if (_didIteratorError17) {
              throw _iteratorError17;
            }
          }
        }

        if (lockedCount > 0) {
          var itemNoun = lockedCount == 1 ? "item" : "items";
          var auxVerb = lockedCount == 1 ? "is" : "are";
          _this8.alertManager.alert({ title: 'Items Locked', text: lockedCount + " " + itemNoun + " you are attempting to save " + auxVerb + " locked and cannot be edited." });
        }

        var localItems = _this8.modelManager.mapResponseItemsToLocalModels(responseItems, SFModelManager.MappingSourceComponentRetrieved, component.uuid);

        var _iteratorNormalCompletion18 = true;
        var _didIteratorError18 = false;
        var _iteratorError18 = undefined;

        try {
          for (var _iterator18 = responseItems[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
            var _responseItem = _step18.value;

            var _item = _.find(localItems, { uuid: _responseItem.uuid });
            if (!_item) {
              // An item this extension is trying to save was possibly removed locally, notify user
              _this8.alertManager.alert({ text: "The extension " + component.name + " is trying to save an item with type " + _responseItem.content_type + ", but that item does not exist. Please restart this extension and try again." });
              continue;
            }

            // 8/2018: Why did we have this here? `mapResponseItemsToLocalModels` takes care of merging item content. We definitely shouldn't be doing this directly.
            // _.merge(item.content, responseItem.content);

            if (!_item.locked) {
              if (_responseItem.clientData) {
                _item.setDomainDataItem(component.getClientDataKey(), _responseItem.clientData, SNComponentManager.ClientDataDomain);
              }
              _item.setDirty(true);
            }
          }
        } catch (err) {
          _didIteratorError18 = true;
          _iteratorError18 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion18 && _iterator18.return) {
              _iterator18.return();
            }
          } finally {
            if (_didIteratorError18) {
              throw _iteratorError18;
            }
          }
        }

        _this8.syncManager.sync().then(function (response) {
          // Allow handlers to be notified when a save begins and ends, to update the UI
          var saveMessage = Object.assign({}, message);
          saveMessage.action = response && response.error ? "save-error" : "save-success";
          _this8.replyToMessage(component, message, { error: response && response.error });
          _this8.handleMessage(component, saveMessage);
        });
      });
    }
  }, {
    key: "handleDuplicateItemMessage",
    value: function handleDuplicateItemMessage(component, message) {
      var _this9 = this;

      var itemParams = message.data.item;
      var item = this.modelManager.findItem(itemParams.uuid);
      var requiredPermissions = [{
        name: "stream-items",
        content_types: [item.content_type]
      }];

      this.runWithPermissions(component, requiredPermissions, function () {
        var duplicate = _this9.modelManager.duplicateItem(item);
        _this9.syncManager.sync();

        _this9.replyToMessage(component, message, { item: _this9.jsonForItem(duplicate, component) });
      });
    }
  }, {
    key: "handleCreateItemsMessage",
    value: function handleCreateItemsMessage(component, message) {
      var _this10 = this;

      var responseItems = message.data.item ? [message.data.item] : message.data.items;
      var uniqueContentTypes = _.uniq(responseItems.map(function (item) {
        return item.content_type;
      }));
      var requiredPermissions = [{
        name: "stream-items",
        content_types: uniqueContentTypes
      }];

      this.runWithPermissions(component, requiredPermissions, function () {
        _this10.removePrivatePropertiesFromResponseItems(responseItems, component);
        var processedItems = [];
        var _iteratorNormalCompletion19 = true;
        var _didIteratorError19 = false;
        var _iteratorError19 = undefined;

        try {
          for (var _iterator19 = responseItems[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
            var responseItem = _step19.value;

            var item = _this10.modelManager.createItem(responseItem);
            if (responseItem.clientData) {
              item.setDomainDataItem(component.getClientDataKey(), responseItem.clientData, SNComponentManager.ClientDataDomain);
            }
            _this10.modelManager.addItem(item);
            _this10.modelManager.resolveReferencesForItem(item, true);
            item.setDirty(true);
            processedItems.push(item);
          }
        } catch (err) {
          _didIteratorError19 = true;
          _iteratorError19 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion19 && _iterator19.return) {
              _iterator19.return();
            }
          } finally {
            if (_didIteratorError19) {
              throw _iteratorError19;
            }
          }
        }

        _this10.syncManager.sync();

        // "create-item" or "create-items" are possible messages handled here
        var reply = message.action == "create-item" ? { item: _this10.jsonForItem(processedItems[0], component) } : { items: processedItems.map(function (item) {
            return _this10.jsonForItem(item, component);
          }) };

        _this10.replyToMessage(component, message, reply);
      });
    }
  }, {
    key: "handleDeleteItemsMessage",
    value: function handleDeleteItemsMessage(component, message) {
      var _this11 = this;

      var requiredContentTypes = _.uniq(message.data.items.map(function (i) {
        return i.content_type;
      })).sort();
      var requiredPermissions = [{
        name: "stream-items",
        content_types: requiredContentTypes
      }];

      this.runWithPermissions(component, requiredPermissions, function () {
        var itemsData = message.data.items;
        var noun = itemsData.length == 1 ? "item" : "items";
        var reply = null;
        if (confirm("Are you sure you want to delete " + itemsData.length + " " + noun + "?")) {
          // Filter for any components and deactivate before deleting
          var _iteratorNormalCompletion20 = true;
          var _didIteratorError20 = false;
          var _iteratorError20 = undefined;

          try {
            for (var _iterator20 = itemsData[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
              var itemData = _step20.value;

              var model = _this11.modelManager.findItem(itemData.uuid);
              if (["SN|Component", "SN|Theme"].includes(model.content_type)) {
                _this11.deactivateComponent(model, true);
              }
              _this11.modelManager.setItemToBeDeleted(model);
              // Currently extensions are not notified of association until a full server sync completes.
              // We manually notify observers.
              _this11.modelManager.notifySyncObserversOfModels([model], SFModelManager.MappingSourceRemoteSaved);
            }
          } catch (err) {
            _didIteratorError20 = true;
            _iteratorError20 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion20 && _iterator20.return) {
                _iterator20.return();
              }
            } finally {
              if (_didIteratorError20) {
                throw _iteratorError20;
              }
            }
          }

          _this11.syncManager.sync();
          reply = { deleted: true };
        } else {
          // Rejected by user
          reply = { deleted: false };
        }

        _this11.replyToMessage(component, message, reply);
      });
    }
  }, {
    key: "handleRequestPermissionsMessage",
    value: function handleRequestPermissionsMessage(component, message) {
      var _this12 = this;

      this.runWithPermissions(component, message.data.permissions, function () {
        _this12.replyToMessage(component, message, { approved: true });
      });
    }
  }, {
    key: "handleSetComponentDataMessage",
    value: function handleSetComponentDataMessage(component, message) {
      var _this13 = this;

      // A component setting its own data does not require special permissions
      this.runWithPermissions(component, [], function () {
        component.componentData = message.data.componentData;
        component.setDirty(true);
        _this13.syncManager.sync();
      });
    }
  }, {
    key: "handleToggleComponentMessage",
    value: function handleToggleComponentMessage(sourceComponent, targetComponent, message) {
      this.toggleComponent(targetComponent);
    }
  }, {
    key: "toggleComponent",
    value: function toggleComponent(component) {
      var _this14 = this;

      if (component.area == "modal") {
        this.openModalComponent(component);
      } else {
        if (component.active) {
          this.deactivateComponent(component);
        } else {
          if (component.content_type == "SN|Theme") {
            // Deactive currently active theme if new theme is not layerable
            var activeThemes = this.getActiveThemes();

            // Activate current before deactivating others, so as not to flicker
            this.activateComponent(component);

            if (!component.isLayerable()) {
              setTimeout(function () {
                var _iteratorNormalCompletion21 = true;
                var _didIteratorError21 = false;
                var _iteratorError21 = undefined;

                try {
                  for (var _iterator21 = activeThemes[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
                    var theme = _step21.value;

                    if (theme && !theme.isLayerable()) {
                      _this14.deactivateComponent(theme);
                    }
                  }
                } catch (err) {
                  _didIteratorError21 = true;
                  _iteratorError21 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion21 && _iterator21.return) {
                      _iterator21.return();
                    }
                  } finally {
                    if (_didIteratorError21) {
                      throw _iteratorError21;
                    }
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
  }, {
    key: "handleInstallLocalComponentMessage",
    value: function handleInstallLocalComponentMessage(sourceComponent, message) {
      // Only extensions manager has this permission
      if (this.nativeExtManager && !this.nativeExtManager.isSystemExtension(sourceComponent)) {
        return;
      }

      var targetComponent = this.modelManager.findItem(message.data.uuid);
      this.desktopManager.installComponent(targetComponent);
    }
  }, {
    key: "runWithPermissions",
    value: function runWithPermissions(component, requiredPermissions, runFunction) {
      if (!component.permissions) {
        component.permissions = [];
      }

      // Make copy as not to mutate input values
      requiredPermissions = JSON.parse(JSON.stringify(requiredPermissions));

      var acquiredPermissions = component.permissions;

      var _loop4 = function _loop4(required) {
        // Remove anything we already have
        var respectiveAcquired = acquiredPermissions.find(function (candidate) {
          return candidate.name == required.name;
        });
        if (!respectiveAcquired) {
          return "continue";
        }

        // We now match on name, lets substract from required.content_types anything we have in acquired.
        var requiredContentTypes = required.content_types;

        if (!requiredContentTypes) {
          // If this permission does not require any content types (i.e stream-context-item)
          // then we can remove this from required since we match by name (respectiveAcquired.name == required.name)
          _.pull(requiredPermissions, required);
          return "continue";
        }

        var _iteratorNormalCompletion23 = true;
        var _didIteratorError23 = false;
        var _iteratorError23 = undefined;

        try {
          for (var _iterator23 = respectiveAcquired.content_types[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
            var acquiredContentType = _step23.value;

            // console.log("Removing content_type", acquiredContentType, "from", requiredContentTypes);
            _.pull(requiredContentTypes, acquiredContentType);
          }
        } catch (err) {
          _didIteratorError23 = true;
          _iteratorError23 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion23 && _iterator23.return) {
              _iterator23.return();
            }
          } finally {
            if (_didIteratorError23) {
              throw _iteratorError23;
            }
          }
        }

        if (requiredContentTypes.length == 0) {
          // We've removed all acquired and end up with zero, means we already have all these permissions
          _.pull(requiredPermissions, required);
        }
      };

      var _iteratorNormalCompletion22 = true;
      var _didIteratorError22 = false;
      var _iteratorError22 = undefined;

      try {
        for (var _iterator22 = requiredPermissions.slice()[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
          var required = _step22.value;

          var _ret4 = _loop4(required);

          if (_ret4 === "continue") continue;
        }
      } catch (err) {
        _didIteratorError22 = true;
        _iteratorError22 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion22 && _iterator22.return) {
            _iterator22.return();
          }
        } finally {
          if (_didIteratorError22) {
            throw _iteratorError22;
          }
        }
      }

      if (requiredPermissions.length > 0) {
        this.promptForPermissions(component, requiredPermissions, function (approved) {
          if (approved) {
            runFunction();
          }
        });
      } else {
        runFunction();
      }
    }
  }, {
    key: "promptForPermissions",
    value: function promptForPermissions(component, permissions, callback) {
      var _this15 = this;

      var params = {};
      params.component = component;
      params.permissions = permissions;
      params.permissionsString = this.permissionsStringForPermissions(permissions, component);
      params.actionBlock = callback;

      params.callback = function (approved) {
        if (approved) {
          var _loop5 = function _loop5(permission) {
            var matchingPermission = component.permissions.find(function (candidate) {
              return candidate.name == permission.name;
            });
            if (!matchingPermission) {
              component.permissions.push(permission);
            } else {
              // Permission already exists, but content_types may have been expanded
              var contentTypes = matchingPermission.content_types || [];
              matchingPermission.content_types = _.uniq(contentTypes.concat(permission.content_types));
            }
          };

          var _iteratorNormalCompletion24 = true;
          var _didIteratorError24 = false;
          var _iteratorError24 = undefined;

          try {
            for (var _iterator24 = permissions[Symbol.iterator](), _step24; !(_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done); _iteratorNormalCompletion24 = true) {
              var permission = _step24.value;

              _loop5(permission);
            }
          } catch (err) {
            _didIteratorError24 = true;
            _iteratorError24 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion24 && _iterator24.return) {
                _iterator24.return();
              }
            } finally {
              if (_didIteratorError24) {
                throw _iteratorError24;
              }
            }
          }

          component.setDirty(true);
          _this15.syncManager.sync();
        }

        _this15.permissionDialogs = _this15.permissionDialogs.filter(function (pendingDialog) {
          // Remove self
          if (pendingDialog == params) {
            pendingDialog.actionBlock && pendingDialog.actionBlock(approved);
            return false;
          }

          /* Use with numbers and strings, not objects */
          var containsObjectSubset = function containsObjectSubset(source, target) {
            return !target.some(function (val) {
              return !source.find(function (candidate) {
                return candidate == val;
              });
            });
          };

          if (pendingDialog.component == component) {
            // remove pending dialogs that are encapsulated by already approved permissions, and run its function
            if (pendingDialog.permissions == permissions || containsObjectSubset(permissions, pendingDialog.permissions)) {
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

        if (_this15.permissionDialogs.length > 0) {
          _this15.presentPermissionsDialog(_this15.permissionDialogs[0]);
        }
      };

      // since these calls are asyncronous, multiple dialogs may be requested at the same time. We only want to present one and trigger all callbacks based on one modal result
      var existingDialog = _.find(this.permissionDialogs, { component: component });

      this.permissionDialogs.push(params);

      if (!existingDialog) {
        this.presentPermissionsDialog(params);
      } else {
        console.log("Existing dialog, not presenting.");
      }
    }
  }, {
    key: "presentPermissionsDialog",
    value: function presentPermissionsDialog(dialog) {
      console.error("Must override");
    }
  }, {
    key: "openModalComponent",
    value: function openModalComponent(component) {
      console.error("Must override");
    }
  }, {
    key: "registerHandler",
    value: function registerHandler(handler) {
      this.handlers.push(handler);
    }
  }, {
    key: "deregisterHandler",
    value: function deregisterHandler(identifier) {
      var handler = _.find(this.handlers, { identifier: identifier });
      if (!handler) {
        console.log("Attempting to deregister non-existing handler");
        return;
      }
      this.handlers.splice(this.handlers.indexOf(handler), 1);
    }

    // Called by other views when the iframe is ready

  }, {
    key: "registerComponentWindow",
    value: function () {
      var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(component, componentWindow) {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (component.window === componentWindow) {
                  if (this.loggingEnabled) {
                    console.log("Web|componentManager", "attempting to re-register same component window.");
                  }
                }

                if (this.loggingEnabled) {
                  console.log("Web|componentManager|registerComponentWindow", component);
                }
                component.window = componentWindow;
                _context.next = 5;
                return SFJS.crypto.generateUUID();

              case 5:
                component.sessionKey = _context.sent;

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

              case 9:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function registerComponentWindow(_x3, _x4) {
        return _ref2.apply(this, arguments);
      }

      return registerComponentWindow;
    }()
  }, {
    key: "activateComponent",
    value: function activateComponent(component) {
      var _this16 = this;

      var dontSync = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var didChange = component.active != true;

      component.active = true;

      var _loop6 = function _loop6(handler) {
        if (handler.areas.includes(component.area) || handler.areas.includes("*")) {
          // We want to run the handler in a $timeout so the UI updates, but we also don't want it to run asyncronously
          // so that the steps below this one are run before the handler. So we run in a waitTimeout.
          // Update 12/18: We were using this.waitTimeout previously, however, that caused the iframe.onload callback to never be called
          // for some reason for iframes on desktop inside the revision-preview-modal. So we'll use safeApply instead. I'm not quite sure
          // where the original "so the UI updates" comment applies to, but we'll have to keep an eye out to see if this causes problems somewhere else.
          _this16.$uiRunner(function () {
            handler.activationHandler && handler.activationHandler(component);
          });
        }
      };

      var _iteratorNormalCompletion25 = true;
      var _didIteratorError25 = false;
      var _iteratorError25 = undefined;

      try {
        for (var _iterator25 = this.handlers[Symbol.iterator](), _step25; !(_iteratorNormalCompletion25 = (_step25 = _iterator25.next()).done); _iteratorNormalCompletion25 = true) {
          var handler = _step25.value;

          _loop6(handler);
        }
      } catch (err) {
        _didIteratorError25 = true;
        _iteratorError25 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion25 && _iterator25.return) {
            _iterator25.return();
          }
        } finally {
          if (_didIteratorError25) {
            throw _iteratorError25;
          }
        }
      }

      if (didChange && !dontSync) {
        component.setDirty(true);
        this.syncManager.sync();
      }

      if (!this.activeComponents.includes(component)) {
        this.activeComponents.push(component);
      }

      if (component.area == "themes") {
        this.postActiveThemesToAllComponents();
      }
    }
  }, {
    key: "deactivateComponent",
    value: function deactivateComponent(component) {
      var _this17 = this;

      var dontSync = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      var didChange = component.active != false;
      component.active = false;
      component.sessionKey = null;

      var _loop7 = function _loop7(handler) {
        if (handler.areas.includes(component.area) || handler.areas.includes("*")) {
          // See comment in activateComponent regarding safeApply and awaitTimeout
          _this17.$uiRunner(function () {
            handler.activationHandler && handler.activationHandler(component);
          });
        }
      };

      var _iteratorNormalCompletion26 = true;
      var _didIteratorError26 = false;
      var _iteratorError26 = undefined;

      try {
        for (var _iterator26 = this.handlers[Symbol.iterator](), _step26; !(_iteratorNormalCompletion26 = (_step26 = _iterator26.next()).done); _iteratorNormalCompletion26 = true) {
          var handler = _step26.value;

          _loop7(handler);
        }
      } catch (err) {
        _didIteratorError26 = true;
        _iteratorError26 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion26 && _iterator26.return) {
            _iterator26.return();
          }
        } finally {
          if (_didIteratorError26) {
            throw _iteratorError26;
          }
        }
      }

      if (didChange && !dontSync) {
        component.setDirty(true);
        this.syncManager.sync();
      }

      _.pull(this.activeComponents, component);

      this.streamObservers = this.streamObservers.filter(function (o) {
        return o.component !== component;
      });

      this.contextStreamObservers = this.contextStreamObservers.filter(function (o) {
        return o.component !== component;
      });

      if (component.area == "themes") {
        this.postActiveThemesToAllComponents();
      }
    }
  }, {
    key: "reloadComponent",
    value: function () {
      var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(component) {
        var _this18 = this;

        var _loop8, _iteratorNormalCompletion27, _didIteratorError27, _iteratorError27, _iterator27, _step27, handler;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                //
                // Do soft deactivate
                //
                component.active = false;

                _loop8 = function _loop8(handler) {
                  if (handler.areas.includes(component.area) || handler.areas.includes("*")) {
                    // See comment in activateComponent regarding safeApply and awaitTimeout
                    _this18.$uiRunner(function () {
                      handler.activationHandler && handler.activationHandler(component);
                    });
                  }
                };

                _iteratorNormalCompletion27 = true;
                _didIteratorError27 = false;
                _iteratorError27 = undefined;
                _context2.prev = 5;
                for (_iterator27 = this.handlers[Symbol.iterator](); !(_iteratorNormalCompletion27 = (_step27 = _iterator27.next()).done); _iteratorNormalCompletion27 = true) {
                  handler = _step27.value;

                  _loop8(handler);
                }

                _context2.next = 13;
                break;

              case 9:
                _context2.prev = 9;
                _context2.t0 = _context2["catch"](5);
                _didIteratorError27 = true;
                _iteratorError27 = _context2.t0;

              case 13:
                _context2.prev = 13;
                _context2.prev = 14;

                if (!_iteratorNormalCompletion27 && _iterator27.return) {
                  _iterator27.return();
                }

              case 16:
                _context2.prev = 16;

                if (!_didIteratorError27) {
                  _context2.next = 19;
                  break;
                }

                throw _iteratorError27;

              case 19:
                return _context2.finish(16);

              case 20:
                return _context2.finish(13);

              case 21:
                this.streamObservers = this.streamObservers.filter(function (o) {
                  return o.component !== component;
                });

                this.contextStreamObservers = this.contextStreamObservers.filter(function (o) {
                  return o.component !== component;
                });

                if (component.area == "themes") {
                  this.postActiveThemesToAllComponents();
                }

                //
                // Do soft activate
                //

                return _context2.abrupt("return", new Promise(function (resolve, reject) {
                  _this18.$timeout(function () {
                    component.active = true;
                    var _iteratorNormalCompletion28 = true;
                    var _didIteratorError28 = false;
                    var _iteratorError28 = undefined;

                    try {
                      for (var _iterator28 = _this18.handlers[Symbol.iterator](), _step28; !(_iteratorNormalCompletion28 = (_step28 = _iterator28.next()).done); _iteratorNormalCompletion28 = true) {
                        var handler = _step28.value;

                        if (handler.areas.includes(component.area) || handler.areas.includes("*")) {
                          // See comment in activateComponent regarding safeApply and awaitTimeout
                          _this18.$uiRunner(function () {
                            handler.activationHandler && handler.activationHandler(component);
                            resolve();
                          });
                        }
                      }
                    } catch (err) {
                      _didIteratorError28 = true;
                      _iteratorError28 = err;
                    } finally {
                      try {
                        if (!_iteratorNormalCompletion28 && _iterator28.return) {
                          _iterator28.return();
                        }
                      } finally {
                        if (_didIteratorError28) {
                          throw _iteratorError28;
                        }
                      }
                    }

                    if (!_this18.activeComponents.includes(component)) {
                      _this18.activeComponents.push(component);
                    }

                    if (component.area == "themes") {
                      _this18.postActiveThemesToAllComponents();
                    }
                    // Resolve again in case first resolve in for loop isn't reached.
                    // Should be no effect if resolved twice, only first will be used.
                    resolve();
                  });
                }));

              case 25:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this, [[5, 9, 13, 21], [14,, 16, 20]]);
      }));

      function reloadComponent(_x7) {
        return _ref3.apply(this, arguments);
      }

      return reloadComponent;
    }()
  }, {
    key: "deleteComponent",
    value: function deleteComponent(component) {
      this.modelManager.setItemToBeDeleted(component);
      this.syncManager.sync();
    }
  }, {
    key: "isComponentActive",
    value: function isComponentActive(component) {
      return component.active;
    }
  }, {
    key: "iframeForComponent",
    value: function iframeForComponent(component) {
      var _iteratorNormalCompletion29 = true;
      var _didIteratorError29 = false;
      var _iteratorError29 = undefined;

      try {
        for (var _iterator29 = Array.from(document.getElementsByTagName("iframe"))[Symbol.iterator](), _step29; !(_iteratorNormalCompletion29 = (_step29 = _iterator29.next()).done); _iteratorNormalCompletion29 = true) {
          var frame = _step29.value;

          var componentId = frame.dataset.componentId;
          if (componentId === component.uuid) {
            return frame;
          }
        }
      } catch (err) {
        _didIteratorError29 = true;
        _iteratorError29 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion29 && _iterator29.return) {
            _iterator29.return();
          }
        } finally {
          if (_didIteratorError29) {
            throw _iteratorError29;
          }
        }
      }
    }
  }, {
    key: "focusChangedForComponent",
    value: function focusChangedForComponent(component) {
      var focused = document.activeElement == this.iframeForComponent(component);
      var _iteratorNormalCompletion30 = true;
      var _didIteratorError30 = false;
      var _iteratorError30 = undefined;

      try {
        for (var _iterator30 = this.handlers[Symbol.iterator](), _step30; !(_iteratorNormalCompletion30 = (_step30 = _iterator30.next()).done); _iteratorNormalCompletion30 = true) {
          var handler = _step30.value;

          // Notify all handlers, and not just ones that match this component type
          handler.focusHandler && handler.focusHandler(component, focused);
        }
      } catch (err) {
        _didIteratorError30 = true;
        _iteratorError30 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion30 && _iterator30.return) {
            _iterator30.return();
          }
        } finally {
          if (_didIteratorError30) {
            throw _iteratorError30;
          }
        }
      }
    }
  }, {
    key: "handleSetSizeEvent",
    value: function handleSetSizeEvent(component, data) {
      var setSize = function setSize(element, size) {
        var widthString = typeof size.width === 'string' ? size.width : data.width + "px";
        var heightString = typeof size.height === 'string' ? size.height : data.height + "px";
        if (element) {
          element.setAttribute("style", "width:" + widthString + "; height:" + heightString + ";");
        }
      };

      if (component.area == "rooms" || component.area == "modal") {
        var selector = component.area == "rooms" ? "inner" : "outer";
        var content = document.getElementById("component-content-" + selector + "-" + component.uuid);
        if (content) {
          setSize(content, data);
        }
      } else {
        var iframe = this.iframeForComponent(component);
        if (!iframe) {
          return;
        }

        setSize(iframe, data);

        // On Firefox, resizing a component iframe does not seem to have an effect with editor-stack extensions.
        // Sizing the parent does the trick, however, we can't do this globally, otherwise, areas like the note-tags will
        // not be able to expand outside of the bounds (to display autocomplete, for example).
        if (component.area == "editor-stack") {
          var parent = iframe.parentElement;
          if (parent) {
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
  }, {
    key: "editorForNote",
    value: function editorForNote(note) {
      var editors = this.componentsForArea("editor-editor");
      var _iteratorNormalCompletion31 = true;
      var _didIteratorError31 = false;
      var _iteratorError31 = undefined;

      try {
        for (var _iterator31 = editors[Symbol.iterator](), _step31; !(_iteratorNormalCompletion31 = (_step31 = _iterator31.next()).done); _iteratorNormalCompletion31 = true) {
          var editor = _step31.value;

          if (editor.isExplicitlyEnabledForItem(note)) {
            return editor;
          }
        }

        // No editor found for note. Use default editor, if note does not prefer system editor
      } catch (err) {
        _didIteratorError31 = true;
        _iteratorError31 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion31 && _iterator31.return) {
            _iterator31.return();
          }
        } finally {
          if (_didIteratorError31) {
            throw _iteratorError31;
          }
        }
      }

      if (this.isMobile) {
        if (!note.content.mobilePrefersPlainEditor) {
          return this.getDefaultEditor();
        }
      } else {
        if (!note.getAppDataItem("prefersPlainEditor")) {
          return editors.filter(function (e) {
            return e.isDefaultEditor();
          })[0];
        }
      }
    }
  }, {
    key: "permissionsStringForPermissions",
    value: function permissionsStringForPermissions(permissions, component) {
      var _this19 = this;

      var finalString = "";
      var permissionsCount = permissions.length;

      var addSeparator = function addSeparator(index, length) {
        if (index > 0) {
          if (index == length - 1) {
            if (length == 2) {
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

      permissions.forEach(function (permission, index) {
        if (permission.name === "stream-items") {
          var types = permission.content_types.map(function (type) {
            var desc = _this19.modelManager.humanReadableDisplayForContentType(type);
            if (desc) {
              return desc + "s";
            } else {
              return "items of type " + type;
            }
          });
          var typesString = "";

          for (var i = 0; i < types.length; i++) {
            var type = types[i];
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
          var mapping = {
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
  }, {
    key: "components",
    get: function get() {
      return this.modelManager.allItemsMatchingTypes(["SN|Component", "SN|Theme"]);
    }
  }]);

  return SNComponentManager;
}();

;
var SNComponent = exports.SNComponent = function (_SFItem) {
  _inherits(SNComponent, _SFItem);

  function SNComponent(json_obj) {
    _classCallCheck(this, SNComponent);

    // If making a copy of an existing component (usually during sign in if you have a component active in the session),
    // which may have window set, you may get a cross-origin exception since you'll be trying to copy the window. So we clear it here.
    json_obj.window = null;

    var _this20 = _possibleConstructorReturn(this, (SNComponent.__proto__ || Object.getPrototypeOf(SNComponent)).call(this, json_obj));

    if (!_this20.componentData) {
      _this20.componentData = {};
    }

    if (!_this20.disassociatedItemIds) {
      _this20.disassociatedItemIds = [];
    }

    if (!_this20.associatedItemIds) {
      _this20.associatedItemIds = [];
    }
    return _this20;
  }

  _createClass(SNComponent, [{
    key: "mapContentToLocalProperties",
    value: function mapContentToLocalProperties(content) {
      _get(SNComponent.prototype.__proto__ || Object.getPrototypeOf(SNComponent.prototype), "mapContentToLocalProperties", this).call(this, content);
      /* Legacy */
      // We don't want to set the url directly, as we'd like to phase it out.
      // If the content.url exists, we'll transfer it to legacy_url
      // We'll only need to set this if content.hosted_url is blank, otherwise, hosted_url is the url replacement.
      if (!content.hosted_url) {
        this.legacy_url = content.url;
      }

      /* New */
      this.local_url = content.local_url;
      this.hosted_url = content.hosted_url || content.url;
      this.offlineOnly = content.offlineOnly;

      if (content.valid_until) {
        this.valid_until = new Date(content.valid_until);
      }

      this.name = content.name;
      this.autoupdateDisabled = content.autoupdateDisabled;

      this.package_info = content.package_info;

      // the location in the view this component is located in. Valid values are currently tags-list, note-tags, and editor-stack`
      this.area = content.area;

      this.permissions = content.permissions;
      if (!this.permissions) {
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
  }, {
    key: "handleDeletedContent",
    value: function handleDeletedContent() {
      _get(SNComponent.prototype.__proto__ || Object.getPrototypeOf(SNComponent.prototype), "handleDeletedContent", this).call(this);

      this.active = false;
    }
  }, {
    key: "structureParams",
    value: function structureParams() {
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
        associatedItemIds: this.associatedItemIds
      };

      var superParams = _get(SNComponent.prototype.__proto__ || Object.getPrototypeOf(SNComponent.prototype), "structureParams", this).call(this);
      Object.assign(superParams, params);
      return superParams;
    }
  }, {
    key: "isEditor",
    value: function isEditor() {
      return this.area == "editor-editor";
    }
  }, {
    key: "isTheme",
    value: function isTheme() {
      return this.content_type == "SN|Theme" || this.area == "themes";
    }
  }, {
    key: "isDefaultEditor",
    value: function isDefaultEditor() {
      return this.getAppDataItem("defaultEditor") == true;
    }
  }, {
    key: "setLastSize",
    value: function setLastSize(size) {
      this.setAppDataItem("lastSize", size);
    }
  }, {
    key: "getLastSize",
    value: function getLastSize() {
      return this.getAppDataItem("lastSize");
    }
  }, {
    key: "acceptsThemes",
    value: function acceptsThemes() {
      if (this.content.package_info && "acceptsThemes" in this.content.package_info) {
        return this.content.package_info.acceptsThemes;
      }
      return true;
    }

    /*
      The key used to look up data that this component may have saved to an item.
      This key will be look up on the item, and not on itself.
     */

  }, {
    key: "getClientDataKey",
    value: function getClientDataKey() {
      if (this.legacy_url) {
        return this.legacy_url;
      } else {
        return this.uuid;
      }
    }
  }, {
    key: "hasValidHostedUrl",
    value: function hasValidHostedUrl() {
      return this.hosted_url || this.legacy_url;
    }
  }, {
    key: "keysToIgnoreWhenCheckingContentEquality",
    value: function keysToIgnoreWhenCheckingContentEquality() {
      return ["active", "disassociatedItemIds", "associatedItemIds"].concat(_get(SNComponent.prototype.__proto__ || Object.getPrototypeOf(SNComponent.prototype), "keysToIgnoreWhenCheckingContentEquality", this).call(this));
    }

    /*
      An associative component depends on being explicitly activated for a given item, compared to a dissaciative component,
      which is enabled by default in areas unrelated to a certain item.
     */

  }, {
    key: "isAssociative",
    value: function isAssociative() {
      return Component.associativeAreas().includes(this.area);
    }
  }, {
    key: "associateWithItem",
    value: function associateWithItem(item) {
      this.associatedItemIds.push(item.uuid);
    }
  }, {
    key: "isExplicitlyEnabledForItem",
    value: function isExplicitlyEnabledForItem(item) {
      return this.associatedItemIds.indexOf(item.uuid) !== -1;
    }
  }, {
    key: "isExplicitlyDisabledForItem",
    value: function isExplicitlyDisabledForItem(item) {
      return this.disassociatedItemIds.indexOf(item.uuid) !== -1;
    }
  }, {
    key: "content_type",
    get: function get() {
      return "SN|Component";
    }
  }], [{
    key: "associativeAreas",
    value: function associativeAreas() {
      return ["editor-editor"];
    }
  }]);

  return SNComponent;
}(_standardFileJs.SFItem);

;
var SNEditor = exports.SNEditor = function (_SFItem2) {
  _inherits(SNEditor, _SFItem2);

  function SNEditor(json_obj) {
    _classCallCheck(this, SNEditor);

    var _this21 = _possibleConstructorReturn(this, (SNEditor.__proto__ || Object.getPrototypeOf(SNEditor)).call(this, json_obj));

    if (!_this21.notes) {
      _this21.notes = [];
    }
    if (!_this21.data) {
      _this21.data = {};
    }
    return _this21;
  }

  _createClass(SNEditor, [{
    key: "mapContentToLocalProperties",
    value: function mapContentToLocalProperties(content) {
      _get(SNEditor.prototype.__proto__ || Object.getPrototypeOf(SNEditor.prototype), "mapContentToLocalProperties", this).call(this, content);
      this.url = content.url;
      this.name = content.name;
      this.data = content.data || {};
      this.default = content.default;
      this.systemEditor = content.systemEditor;
    }
  }, {
    key: "structureParams",
    value: function structureParams() {
      var params = {
        url: this.url,
        name: this.name,
        data: this.data,
        default: this.default,
        systemEditor: this.systemEditor
      };

      var superParams = _get(SNEditor.prototype.__proto__ || Object.getPrototypeOf(SNEditor.prototype), "structureParams", this).call(this);
      Object.assign(superParams, params);
      return superParams;
    }
  }, {
    key: "referenceParams",
    value: function referenceParams() {
      var references = _.map(this.notes, function (note) {
        return { uuid: note.uuid, content_type: note.content_type };
      });

      return references;
    }
  }, {
    key: "addItemAsRelationship",
    value: function addItemAsRelationship(item) {
      if (item.content_type == "Note") {
        if (!_.find(this.notes, item)) {
          this.notes.push(item);
        }
      }
      _get(SNEditor.prototype.__proto__ || Object.getPrototypeOf(SNEditor.prototype), "addItemAsRelationship", this).call(this, item);
    }
  }, {
    key: "removeItemAsRelationship",
    value: function removeItemAsRelationship(item) {
      if (item.content_type == "Note") {
        _.pull(this.notes, item);
      }
      _get(SNEditor.prototype.__proto__ || Object.getPrototypeOf(SNEditor.prototype), "removeItemAsRelationship", this).call(this, item);
    }
  }, {
    key: "removeAndDirtyAllRelationships",
    value: function removeAndDirtyAllRelationships() {
      _get(SNEditor.prototype.__proto__ || Object.getPrototypeOf(SNEditor.prototype), "removeAndDirtyAllRelationships", this).call(this);
      this.notes = [];
    }
  }, {
    key: "removeReferencesNotPresentIn",
    value: function removeReferencesNotPresentIn(references) {
      _get(SNEditor.prototype.__proto__ || Object.getPrototypeOf(SNEditor.prototype), "removeReferencesNotPresentIn", this).call(this, references);

      var uuids = references.map(function (ref) {
        return ref.uuid;
      });
      this.notes.forEach(function (note) {
        if (!uuids.includes(note.uuid)) {
          _.remove(this.notes, { uuid: note.uuid });
        }
      }.bind(this));
    }
  }, {
    key: "potentialItemOfInterestHasChangedItsUUID",
    value: function potentialItemOfInterestHasChangedItsUUID(newItem, oldUUID, newUUID) {
      if (newItem.content_type === "Note" && _.find(this.notes, { uuid: oldUUID })) {
        _.remove(this.notes, { uuid: oldUUID });
        this.notes.push(newItem);
      }
    }
  }, {
    key: "setData",
    value: function setData(key, value) {
      var dataHasChanged = JSON.stringify(this.data[key]) !== JSON.stringify(value);
      if (dataHasChanged) {
        this.data[key] = value;
        return true;
      }
      return false;
    }
  }, {
    key: "dataForKey",
    value: function dataForKey(key) {
      return this.data[key] || {};
    }
  }, {
    key: "content_type",
    get: function get() {
      return "SN|Editor";
    }
  }]);

  return SNEditor;
}(_standardFileJs.SFItem);

;
var Action = exports.Action = function Action(json) {
  _classCallCheck(this, Action);

  _.merge(this, json);
  this.running = false; // in case running=true was synced with server since model is uploaded nondiscriminatory
  this.error = false;
  if (this.lastExecuted) {
    // is string
    this.lastExecuted = new Date(this.lastExecuted);
  }
};

var SNExtension = exports.SNExtension = function (_SFItem3) {
  _inherits(SNExtension, _SFItem3);

  function SNExtension(json) {
    _classCallCheck(this, SNExtension);

    var _this22 = _possibleConstructorReturn(this, (SNExtension.__proto__ || Object.getPrototypeOf(SNExtension)).call(this, json));

    if (json.actions) {
      _this22.actions = json.actions.map(function (action) {
        return new Action(action);
      });
    }

    if (!_this22.actions) {
      _this22.actions = [];
    }
    return _this22;
  }

  _createClass(SNExtension, [{
    key: "actionsWithContextForItem",
    value: function actionsWithContextForItem(item) {
      return this.actions.filter(function (action) {
        return action.context == item.content_type || action.context == "Item";
      });
    }
  }, {
    key: "mapContentToLocalProperties",
    value: function mapContentToLocalProperties(content) {
      _get(SNExtension.prototype.__proto__ || Object.getPrototypeOf(SNExtension.prototype), "mapContentToLocalProperties", this).call(this, content);
      this.description = content.description;
      this.url = content.url;
      this.name = content.name;
      this.package_info = content.package_info;
      this.supported_types = content.supported_types;
      if (content.actions) {
        this.actions = content.actions.map(function (action) {
          return new Action(action);
        });
      }
    }
  }, {
    key: "structureParams",
    value: function structureParams() {
      var params = {
        name: this.name,
        url: this.url,
        package_info: this.package_info,
        description: this.description,
        actions: this.actions.map(function (a) {
          return _.omit(a, ["subrows", "subactions"]);
        }),
        supported_types: this.supported_types
      };

      var superParams = _get(SNExtension.prototype.__proto__ || Object.getPrototypeOf(SNExtension.prototype), "structureParams", this).call(this);
      Object.assign(superParams, params);
      return superParams;
    }
  }, {
    key: "content_type",
    get: function get() {
      return "Extension";
    }
  }]);

  return SNExtension;
}(_standardFileJs.SFItem);

;
var SNNote = exports.SNNote = function (_SFItem4) {
  _inherits(SNNote, _SFItem4);

  function SNNote(json_obj) {
    _classCallCheck(this, SNNote);

    var _this23 = _possibleConstructorReturn(this, (SNNote.__proto__ || Object.getPrototypeOf(SNNote)).call(this, json_obj));

    if (!_this23.text) {
      // Some external editors can't handle a null value for text.
      // Notes created on mobile with no text have a null value for it,
      // so we'll just set a default here.
      _this23.text = "";
    }

    if (!_this23.tags) {
      _this23.tags = [];
    }
    return _this23;
  }

  _createClass(SNNote, [{
    key: "mapContentToLocalProperties",
    value: function mapContentToLocalProperties(content) {
      _get(SNNote.prototype.__proto__ || Object.getPrototypeOf(SNNote.prototype), "mapContentToLocalProperties", this).call(this, content);
      this.title = content.title;
      this.text = content.text;
    }
  }, {
    key: "structureParams",
    value: function structureParams() {
      var params = {
        title: this.title,
        text: this.text
      };

      var superParams = _get(SNNote.prototype.__proto__ || Object.getPrototypeOf(SNNote.prototype), "structureParams", this).call(this);
      Object.assign(superParams, params);
      return superParams;
    }
  }, {
    key: "addItemAsRelationship",
    value: function addItemAsRelationship(item) {
      /*
      Legacy.
      Previously, note/tag relationships were bidirectional, however in some cases there
      may be broken links such that a note has references to a tag and not vice versa.
      Now, only tags contain references to notes. For old notes that may have references to tags,
      we want to transfer them over to the tag.
       */
      if (item.content_type == "Tag") {
        item.addItemAsRelationship(this);
      }
      _get(SNNote.prototype.__proto__ || Object.getPrototypeOf(SNNote.prototype), "addItemAsRelationship", this).call(this, item);
    }
  }, {
    key: "setIsBeingReferencedBy",
    value: function setIsBeingReferencedBy(item) {
      _get(SNNote.prototype.__proto__ || Object.getPrototypeOf(SNNote.prototype), "setIsBeingReferencedBy", this).call(this, item);
      this.clearSavedTagsString();
    }
  }, {
    key: "setIsNoLongerBeingReferencedBy",
    value: function setIsNoLongerBeingReferencedBy(item) {
      _get(SNNote.prototype.__proto__ || Object.getPrototypeOf(SNNote.prototype), "setIsNoLongerBeingReferencedBy", this).call(this, item);
      this.clearSavedTagsString();
    }
  }, {
    key: "isBeingRemovedLocally",
    value: function isBeingRemovedLocally() {
      this.tags.forEach(function (tag) {
        _.remove(tag.notes, { uuid: this.uuid });
      }.bind(this));
      _get(SNNote.prototype.__proto__ || Object.getPrototypeOf(SNNote.prototype), "isBeingRemovedLocally", this).call(this);
    }
  }, {
    key: "informReferencesOfUUIDChange",
    value: function informReferencesOfUUIDChange(oldUUID, newUUID) {
      _get(SNNote.prototype.__proto__ || Object.getPrototypeOf(SNNote.prototype), "informReferencesOfUUIDChange", this).call(this);
      var _iteratorNormalCompletion32 = true;
      var _didIteratorError32 = false;
      var _iteratorError32 = undefined;

      try {
        for (var _iterator32 = this.tags[Symbol.iterator](), _step32; !(_iteratorNormalCompletion32 = (_step32 = _iterator32.next()).done); _iteratorNormalCompletion32 = true) {
          var tag = _step32.value;

          _.remove(tag.notes, { uuid: oldUUID });
          tag.notes.push(this);
        }
      } catch (err) {
        _didIteratorError32 = true;
        _iteratorError32 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion32 && _iterator32.return) {
            _iterator32.return();
          }
        } finally {
          if (_didIteratorError32) {
            throw _iteratorError32;
          }
        }
      }
    }
  }, {
    key: "tagDidFinishSyncing",
    value: function tagDidFinishSyncing(tag) {
      this.clearSavedTagsString();
    }
  }, {
    key: "safeText",
    value: function safeText() {
      return this.text || "";
    }
  }, {
    key: "safeTitle",
    value: function safeTitle() {
      return this.title || "";
    }
  }, {
    key: "clearSavedTagsString",
    value: function clearSavedTagsString() {
      this.savedTagsString = null;
    }
  }, {
    key: "tagsString",
    value: function tagsString() {
      this.savedTagsString = SNTag.arrayToDisplayString(this.tags);
      return this.savedTagsString;
    }
  }, {
    key: "content_type",
    get: function get() {
      return "Note";
    }
  }, {
    key: "displayName",
    get: function get() {
      return "Note";
    }
  }], [{
    key: "filterDummyNotes",
    value: function filterDummyNotes(notes) {
      var filtered = notes.filter(function (note) {
        return note.dummy == false || note.dummy == null;
      });
      return filtered;
    }
  }]);

  return SNNote;
}(_standardFileJs.SFItem);

;
var SNTag = exports.SNTag = function (_SFItem5) {
  _inherits(SNTag, _SFItem5);

  function SNTag(json_obj) {
    _classCallCheck(this, SNTag);

    var _this24 = _possibleConstructorReturn(this, (SNTag.__proto__ || Object.getPrototypeOf(SNTag)).call(this, json_obj));

    if (!_this24.content_type) {
      _this24.content_type = "Tag";
    }

    if (!_this24.notes) {
      _this24.notes = [];
    }
    return _this24;
  }

  _createClass(SNTag, [{
    key: "mapContentToLocalProperties",
    value: function mapContentToLocalProperties(content) {
      _get(SNTag.prototype.__proto__ || Object.getPrototypeOf(SNTag.prototype), "mapContentToLocalProperties", this).call(this, content);
      this.title = content.title;
    }
  }, {
    key: "structureParams",
    value: function structureParams() {
      var params = {
        title: this.title
      };

      var superParams = _get(SNTag.prototype.__proto__ || Object.getPrototypeOf(SNTag.prototype), "structureParams", this).call(this);
      Object.assign(superParams, params);
      return superParams;
    }
  }, {
    key: "addItemAsRelationship",
    value: function addItemAsRelationship(item) {
      if (item.content_type == "Note") {
        if (!_.find(this.notes, { uuid: item.uuid })) {
          this.notes.push(item);
          item.tags.push(this);
        }
      }
      _get(SNTag.prototype.__proto__ || Object.getPrototypeOf(SNTag.prototype), "addItemAsRelationship", this).call(this, item);
    }
  }, {
    key: "removeItemAsRelationship",
    value: function removeItemAsRelationship(item) {
      if (item.content_type == "Note") {
        _.remove(this.notes, { uuid: item.uuid });
        _.remove(item.tags, { uuid: this.uuid });
      }
      _get(SNTag.prototype.__proto__ || Object.getPrototypeOf(SNTag.prototype), "removeItemAsRelationship", this).call(this, item);
    }
  }, {
    key: "updateLocalRelationships",
    value: function updateLocalRelationships() {
      var references = this.content.references;

      var uuids = references.map(function (ref) {
        return ref.uuid;
      });
      this.notes.slice().forEach(function (note) {
        if (!uuids.includes(note.uuid)) {
          _.remove(note.tags, { uuid: this.uuid });
          _.remove(this.notes, { uuid: note.uuid });

          note.setIsNoLongerBeingReferencedBy(this);
        }
      }.bind(this));
    }
  }, {
    key: "isBeingRemovedLocally",
    value: function isBeingRemovedLocally() {
      var _this25 = this;

      this.notes.forEach(function (note) {
        _.remove(note.tags, { uuid: _this25.uuid });
        note.setIsNoLongerBeingReferencedBy(_this25);
      });

      this.notes.length = 0;

      _get(SNTag.prototype.__proto__ || Object.getPrototypeOf(SNTag.prototype), "isBeingRemovedLocally", this).call(this);
    }
  }, {
    key: "informReferencesOfUUIDChange",
    value: function informReferencesOfUUIDChange(oldUUID, newUUID) {
      var _iteratorNormalCompletion33 = true;
      var _didIteratorError33 = false;
      var _iteratorError33 = undefined;

      try {
        for (var _iterator33 = this.notes[Symbol.iterator](), _step33; !(_iteratorNormalCompletion33 = (_step33 = _iterator33.next()).done); _iteratorNormalCompletion33 = true) {
          var note = _step33.value;

          _.remove(note.tags, { uuid: oldUUID });
          note.tags.push(this);
        }
      } catch (err) {
        _didIteratorError33 = true;
        _iteratorError33 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion33 && _iterator33.return) {
            _iterator33.return();
          }
        } finally {
          if (_didIteratorError33) {
            throw _iteratorError33;
          }
        }
      }
    }
  }, {
    key: "didFinishSyncing",
    value: function didFinishSyncing() {
      var _iteratorNormalCompletion34 = true;
      var _didIteratorError34 = false;
      var _iteratorError34 = undefined;

      try {
        for (var _iterator34 = this.notes[Symbol.iterator](), _step34; !(_iteratorNormalCompletion34 = (_step34 = _iterator34.next()).done); _iteratorNormalCompletion34 = true) {
          var note = _step34.value;

          note.tagDidFinishSyncing(this);
        }
      } catch (err) {
        _didIteratorError34 = true;
        _iteratorError34 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion34 && _iterator34.return) {
            _iterator34.return();
          }
        } finally {
          if (_didIteratorError34) {
            throw _iteratorError34;
          }
        }
      }
    }
  }, {
    key: "isSmartTag",
    value: function isSmartTag() {
      return this.content_type == "SN|SmartTag";
    }
  }, {
    key: "displayName",
    get: function get() {
      return "Tag";
    }
  }], [{
    key: "arrayToDisplayString",
    value: function arrayToDisplayString(tags) {
      return tags.sort(function (a, b) {
        return a.title > b.title;
      }).map(function (tag, i) {
        return "#" + tag.title;
      }).join(" ");
    }
  }]);

  return SNTag;
}(_standardFileJs.SFItem);

;
var SNEncryptedStorage = exports.SNEncryptedStorage = function (_SFItem6) {
  _inherits(SNEncryptedStorage, _SFItem6);

  function SNEncryptedStorage() {
    _classCallCheck(this, SNEncryptedStorage);

    return _possibleConstructorReturn(this, (SNEncryptedStorage.__proto__ || Object.getPrototypeOf(SNEncryptedStorage)).apply(this, arguments));
  }

  _createClass(SNEncryptedStorage, [{
    key: "mapContentToLocalProperties",
    value: function mapContentToLocalProperties(content) {
      _get(SNEncryptedStorage.prototype.__proto__ || Object.getPrototypeOf(SNEncryptedStorage.prototype), "mapContentToLocalProperties", this).call(this, content);
      this.storage = content.storage;
    }
  }, {
    key: "content_type",
    get: function get() {
      return "SN|EncryptedStorage";
    }
  }]);

  return SNEncryptedStorage;
}(_standardFileJs.SFItem);

;
var SNMfa = exports.SNMfa = function (_SFItem7) {
  _inherits(SNMfa, _SFItem7);

  function SNMfa(json_obj) {
    _classCallCheck(this, SNMfa);

    return _possibleConstructorReturn(this, (SNMfa.__proto__ || Object.getPrototypeOf(SNMfa)).call(this, json_obj));
  }

  // mapContentToLocalProperties(content) {
  //   super.mapContentToLocalProperties(content)
  //   this.serverContent = content;
  // }
  //
  // structureParams() {
  //   return _.merge(this.serverContent, super.structureParams());
  // }

  _createClass(SNMfa, [{
    key: "doNotEncrypt",
    value: function doNotEncrypt() {
      return true;
    }
  }, {
    key: "content_type",
    get: function get() {
      return "SF|MFA";
    }
  }]);

  return SNMfa;
}(_standardFileJs.SFItem);

;
var SNServerExtension = exports.SNServerExtension = function (_SFItem8) {
  _inherits(SNServerExtension, _SFItem8);

  function SNServerExtension() {
    _classCallCheck(this, SNServerExtension);

    return _possibleConstructorReturn(this, (SNServerExtension.__proto__ || Object.getPrototypeOf(SNServerExtension)).apply(this, arguments));
  }

  _createClass(SNServerExtension, [{
    key: "mapContentToLocalProperties",
    value: function mapContentToLocalProperties(content) {
      _get(SNServerExtension.prototype.__proto__ || Object.getPrototypeOf(SNServerExtension.prototype), "mapContentToLocalProperties", this).call(this, content);
      this.url = content.url;
    }
  }, {
    key: "doNotEncrypt",
    value: function doNotEncrypt() {
      return true;
    }
  }, {
    key: "content_type",
    get: function get() {
      return "SF|Extension";
    }
  }]);

  return SNServerExtension;
}(_standardFileJs.SFItem);

;
var SNSmartTag = exports.SNSmartTag = function (_SNTag) {
  _inherits(SNSmartTag, _SNTag);

  function SNSmartTag(json_ob) {
    _classCallCheck(this, SNSmartTag);

    var _this29 = _possibleConstructorReturn(this, (SNSmartTag.__proto__ || Object.getPrototypeOf(SNSmartTag)).call(this, json_ob));

    _this29.content_type = "SN|SmartTag";
    return _this29;
  }

  _createClass(SNSmartTag, null, [{
    key: "systemSmartTags",
    value: function systemSmartTags() {
      return [new SNSmartTag({
        uuid: SNSmartTag.SystemSmartTagIdAllNotes,
        dummy: true,
        content: {
          title: "All notes",
          isSystemTag: true,
          isAllTag: true,
          predicate: new SFPredicate.fromArray(["content_type", "=", "Note"])
        }
      }), new SNSmartTag({
        uuid: SNSmartTag.SystemSmartTagIdArchivedNotes,
        dummy: true,
        content: {
          title: "Archived",
          isSystemTag: true,
          isArchiveTag: true,
          predicate: new SFPredicate.fromArray(["archived", "=", true])
        }
      }), new SNSmartTag({
        uuid: SNSmartTag.SystemSmartTagIdTrashedNotes,
        dummy: true,
        content: {
          title: "Trash",
          isSystemTag: true,
          isTrashTag: true,
          predicate: new SFPredicate.fromArray(["content.trashed", "=", true])
        }
      })];
    }
  }]);

  return SNSmartTag;
}(SNTag);

SNSmartTag.SystemSmartTagIdAllNotes = "all-notes";
SNSmartTag.SystemSmartTagIdArchivedNotes = "archived-notes";
SNSmartTag.SystemSmartTagIdTrashedNotes = "trashed-notes";
;
var SNTheme = exports.SNTheme = function (_SNComponent) {
  _inherits(SNTheme, _SNComponent);

  function SNTheme(json_obj) {
    _classCallCheck(this, SNTheme);

    var _this30 = _possibleConstructorReturn(this, (SNTheme.__proto__ || Object.getPrototypeOf(SNTheme)).call(this, json_obj));

    _this30.area = "themes";
    return _this30;
  }

  _createClass(SNTheme, [{
    key: "isLayerable",
    value: function isLayerable() {
      return this.package_info && this.package_info.layerable;
    }
  }, {
    key: "setMobileRules",
    value: function setMobileRules(rules) {
      this.setAppDataItem("mobileRules", rules);
    }
  }, {
    key: "getMobileRules",
    value: function getMobileRules() {
      return this.getAppDataItem("mobileRules") || { constants: {}, rules: {} };
    }

    // Same as getMobileRules but without default value

  }, {
    key: "hasMobileRules",
    value: function hasMobileRules() {
      return this.getAppDataItem("mobileRules");
    }
  }, {
    key: "setNotAvailOnMobile",
    value: function setNotAvailOnMobile(na) {
      this.setAppDataItem("notAvailableOnMobile", na);
    }
  }, {
    key: "getNotAvailOnMobile",
    value: function getNotAvailOnMobile() {
      return this.getAppDataItem("notAvailableOnMobile");
    }

    /* We must not use .active because if you set that to true, it will also activate that theme on desktop/web */

  }, {
    key: "setMobileActive",
    value: function setMobileActive(active) {
      this.setAppDataItem("mobileActive", active);
    }
  }, {
    key: "isMobileActive",
    value: function isMobileActive() {
      return this.getAppDataItem("mobileActive");
    }
  }, {
    key: "content_type",
    get: function get() {
      return "SN|Theme";
    }
  }, {
    key: "displayName",
    get: function get() {
      return "Theme";
    }
  }]);

  return SNTheme;
}(SNComponent);

;

if (typeof window !== 'undefined' && window !== null) {
  // window is for some reason defined in React Native, but throws an exception when you try to set to it
  try {
    window.SNNote = SNNote;
    window.SNTag = SNTag;
    window.SNSmartTag = SNSmartTag;
    window.SNMfa = SNMfa;
    window.SNServerExtension = SNServerExtension;
    window.SNComponent = SNComponent;
    window.SNEditor = SNEditor;
    window.SNExtension = SNExtension;
    window.SNTheme = SNTheme;
    window.SNEncryptedStorage = SNEncryptedStorage;
    window.SNComponentManager = SNComponentManager;
  } catch (e) {
    console.log("Exception while exporting snjs window variables", e);
  }
}
//# sourceMappingURL=transpiled.js.map
