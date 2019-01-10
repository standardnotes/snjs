"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SNTheme = exports.SNSmartTag = exports.SNServerExtension = exports.SNMfa = exports.SNEncryptedStorage = exports.SNTag = exports.SNNote = exports.SNExtension = exports.Action = exports.SNEditor = exports.SNComponent = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _standardFileJs = require("standard-file-js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var SNComponent = exports.SNComponent = function (_SFItem) {
  _inherits(SNComponent, _SFItem);

  function SNComponent(json_obj) {
    _classCallCheck(this, SNComponent);

    // If making a copy of an existing component (usually during sign in if you have a component active in the session),
    // which may have window set, you may get a cross-origin exception since you'll be trying to copy the window. So we clear it here.
    json_obj.window = null;

    var _this = _possibleConstructorReturn(this, (SNComponent.__proto__ || Object.getPrototypeOf(SNComponent)).call(this, json_obj));

    if (!_this.componentData) {
      _this.componentData = {};
    }

    if (!_this.disassociatedItemIds) {
      _this.disassociatedItemIds = [];
    }

    if (!_this.associatedItemIds) {
      _this.associatedItemIds = [];
    }
    return _this;
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
      return ["active"].concat(_get(SNComponent.prototype.__proto__ || Object.getPrototypeOf(SNComponent.prototype), "keysToIgnoreWhenCheckingContentEquality", this).call(this));
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

    var _this2 = _possibleConstructorReturn(this, (SNEditor.__proto__ || Object.getPrototypeOf(SNEditor)).call(this, json_obj));

    if (!_this2.notes) {
      _this2.notes = [];
    }
    if (!_this2.data) {
      _this2.data = {};
    }
    return _this2;
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

    var _this3 = _possibleConstructorReturn(this, (SNExtension.__proto__ || Object.getPrototypeOf(SNExtension)).call(this, json));

    if (json.actions) {
      _this3.actions = json.actions.map(function (action) {
        return new Action(action);
      });
    }

    if (!_this3.actions) {
      _this3.actions = [];
    }
    return _this3;
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

    var _this4 = _possibleConstructorReturn(this, (SNNote.__proto__ || Object.getPrototypeOf(SNNote)).call(this, json_obj));

    if (!_this4.text) {
      // Some external editors can't handle a null value for text.
      // Notes created on mobile with no text have a null value for it,
      // so we'll just set a default here.
      _this4.text = "";
    }

    if (!_this4.tags) {
      _this4.tags = [];
    }
    return _this4;
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
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.tags[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var tag = _step.value;

          _.remove(tag.notes, { uuid: oldUUID });
          tag.notes.push(this);
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

    var _this5 = _possibleConstructorReturn(this, (SNTag.__proto__ || Object.getPrototypeOf(SNTag)).call(this, json_obj));

    if (!_this5.content_type) {
      _this5.content_type = "Tag";
    }

    if (!_this5.notes) {
      _this5.notes = [];
    }
    return _this5;
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
      var _this6 = this;

      this.notes.forEach(function (note) {
        _.remove(note.tags, { uuid: _this6.uuid });
        note.setIsNoLongerBeingReferencedBy(_this6);
      });

      this.notes.length = 0;

      _get(SNTag.prototype.__proto__ || Object.getPrototypeOf(SNTag.prototype), "isBeingRemovedLocally", this).call(this);
    }
  }, {
    key: "informReferencesOfUUIDChange",
    value: function informReferencesOfUUIDChange(oldUUID, newUUID) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.notes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var note = _step2.value;

          _.remove(note.tags, { uuid: oldUUID });
          note.tags.push(this);
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
    }
  }, {
    key: "didFinishSyncing",
    value: function didFinishSyncing() {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.notes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var note = _step3.value;

          note.tagDidFinishSyncing(this);
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

  _createClass(SNSmartTag, [{
    key: "isReferencingArchivedNotes",
    value: function isReferencingArchivedNotes() {
      var predicate = this.content.predicate;
      if (Array.isArray(predicate)) {
        predicate = SFPredicate.fromArray(predicate);
      }
      return predicate.keypath.includes("archived");
    }
  }]);

  function SNSmartTag(json_ob) {
    _classCallCheck(this, SNSmartTag);

    var _this10 = _possibleConstructorReturn(this, (SNSmartTag.__proto__ || Object.getPrototypeOf(SNSmartTag)).call(this, json_ob));

    _this10.content_type = "SN|SmartTag";
    return _this10;
  }

  _createClass(SNSmartTag, null, [{
    key: "systemSmartTags",
    value: function systemSmartTags() {
      return [new SNSmartTag({
        uuid: SNSmartTag.SystemSmartTagIdAllNotes,
        content: {
          title: "All notes",
          isAllTag: true,
          predicate: new SFPredicate.fromArray(["content_type", "=", "Note"])
        }
      }), new SNSmartTag({
        uuid: SNSmartTag.SystemSmartTagIdArchivedNotes,
        content: {
          title: "Archived",
          isArchiveTag: true,
          predicate: new SFPredicate.fromArray(["archived", "=", true])
        }
      }), new SNSmartTag({
        uuid: SNSmartTag.SystemSmartTagIdTrashedNotes,
        content: {
          title: "Trash",
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

    var _this11 = _possibleConstructorReturn(this, (SNTheme.__proto__ || Object.getPrototypeOf(SNTheme)).call(this, json_obj));

    _this11.area = "themes";
    return _this11;
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
  } catch (e) {
    console.log("Exception while exporting sn-models window variables", e);
  }
}
//# sourceMappingURL=transpiled.js.map
