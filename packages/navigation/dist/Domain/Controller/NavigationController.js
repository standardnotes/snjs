"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigationController = void 0;
const common_1 = require("@standardnotes/common");
const models_1 = require("@standardnotes/models");
const utils_1 = require("@standardnotes/utils");
const Types_1 = require("../Interface/Types");
class NavigationController {
    constructor(items, config = { supportsFileNavigation: false }, eventHandler) {
        this.items = items;
        this.config = config;
        this.eventHandler = eventHandler;
        this.notes = [];
        this.folders = [];
        this.files = [];
        this.selectedItems = new Set();
        this.disposers = [];
        this.disposers.push(items.addObserver(common_1.ContentType.Note, (stream) => {
            this.handleNotesStream(stream);
            if (!(0, models_1.isPayloadSourceNotInterestingToClients)(stream.source)) {
                this.handleSelectionUpdatesForStream(stream);
            }
        }), items.addObserver(Types_1.FolderContentTypes, (stream) => {
            this.handleFoldersStream(stream);
            if (!(0, models_1.isPayloadSourceNotInterestingToClients)(stream.source)) {
                this.handleSelectionUpdatesForStream(stream);
            }
        }), items.addObserver(common_1.ContentType.File, (stream) => {
            this.handleFilesStream(stream);
            if (!(0, models_1.isPayloadSourceNotInterestingToClients)(stream.source)) {
                this.handleSelectionUpdatesForStream(stream);
            }
        }));
        this.systemSmartViews = this.rebuildSystemSmartViews({});
        this.navigationDisplayController = items.createDisplayController([common_1.ContentType.Note, common_1.ContentType.File], {
            sortBy: 'created_at',
            sortDirection: 'dsc',
            hiddenContentTypes: !this.config.supportsFileNavigation ? [common_1.ContentType.File] : [],
        });
        this.folderDisplayController = items.createDisplayController(Types_1.FolderContentTypes, {
            sortBy: 'title',
            sortDirection: 'asc',
        });
        this.fileDisplayController = items.createDisplayController([common_1.ContentType.File], {
            sortBy: 'title',
            sortDirection: 'asc',
        });
    }
    deinit() {
        for (const disposer of this.disposers) {
            disposer();
        }
        ;
        this.disposers = undefined;
        this.eventHandler = undefined;
        this.notes = undefined;
        this.folders = undefined;
        this.files = undefined;
        this.selectedItems = undefined;
        this.systemSmartViews = undefined;
        this.navigationDisplayController = undefined;
        this.folderDisplayController = undefined;
        this.fileDisplayController = undefined;
    }
    handleNotesStream(_stream) {
        (0, utils_1.assert)(this.navigationDisplayController.contentTypes.length === 2);
        const fileContentTypeHidden = !this.config.supportsFileNavigation;
        if (fileContentTypeHidden) {
            this.notes = this.navigationDisplayController.items();
        }
        else {
            this.notes = this.navigationDisplayController.items().filter(models_1.isNote);
        }
        this.eventHandler.onNotes(this.notes);
    }
    handleFilesStream(_stream) {
        this.files = this.fileDisplayController.items();
        this.eventHandler.onFiles(this.files);
    }
    handleFoldersStream(_stream) {
        this.folders = [...this.systemSmartViews, ...this.folderDisplayController.items()];
        this.eventHandler.onFolders(this.folders);
    }
    handleSelectionUpdatesForStream(stream) {
        const { removed } = stream;
        this.deselectItems(removed);
    }
    selectItems(items, { multipleSelection } = { multipleSelection: false }) {
        if (!multipleSelection) {
            this.selectedItems.clear();
        }
        for (const item of items) {
            this.selectedItems.add(item.uuid);
        }
        this.notifyEventHandlerOfChangeInSelection(items);
    }
    deselectItems(items) {
        for (const item of items) {
            this.selectedItems.delete(item.uuid);
        }
        this.notifyEventHandlerOfChangeInSelection(items);
    }
    notifyEventHandlerOfChangeInSelection(concernedItems) {
        if (concernedItems.some((item) => item.content_type === common_1.ContentType.Note)) {
            this.eventHandler.onSelectedNotes(this.getSelectedNotes());
        }
        if (concernedItems.some((item) => Types_1.FolderContentTypes.includes(item.content_type))) {
            this.eventHandler.onSelectedFolders(this.getSelectedFolders());
        }
        if (concernedItems.some((item) => item.content_type === common_1.ContentType.File)) {
            this.eventHandler.onSelectedFiles(this.getSelectedFiles());
        }
    }
    getNotes() {
        return this.notes;
    }
    getFolders() {
        return this.folders;
    }
    getFiles() {
        return this.files;
    }
    getNotesAndFiles() {
        (0, utils_1.assert)(this.config.supportsFileNavigation);
        return this.navigationDisplayController.items();
    }
    allSelectedItems() {
        const uuids = Array.from(this.selectedItems.values());
        const items = [];
        for (const uuid of uuids) {
            const item = this.items.findItem(uuid);
            if (item) {
                items.push(item);
            }
        }
        return items;
    }
    getSelectedNotes() {
        return this.allSelectedItems().filter(models_1.isNote);
    }
    getSelectedNotesAndFiles() {
        const allSelected = this.allSelectedItems();
        return [...allSelected.filter(models_1.isNote), ...allSelected.filter(models_1.isFile)];
    }
    getSelectedFolders() {
        return this.allSelectedItems().filter(Types_1.isFolder);
    }
    getSelectedFiles() {
        return this.allSelectedItems().filter(models_1.isFile);
    }
    getFilesForSelectedNotes() {
        const selectedNotes = this.getSelectedNotes();
        const files = [];
        for (const note of selectedNotes) {
            (0, utils_1.extendArray)(files, this.items.getFilesForNote(note));
        }
        return files;
    }
    setDisplayOptions(options) {
        var _a, _b;
        const override = {};
        if (options.views && options.views.find((view) => view.uuid === models_1.SystemViewId.AllNotes)) {
            if (options.includeArchived == undefined) {
                override.includeArchived = false;
            }
            if (options.includeTrashed == undefined) {
                override.includeTrashed = false;
            }
        }
        if (options.views && options.views.find((view) => view.uuid === models_1.SystemViewId.ArchivedNotes)) {
            if (options.includeTrashed == undefined) {
                override.includeTrashed = false;
            }
        }
        if (options.views && options.views.find((view) => view.uuid === models_1.SystemViewId.TrashedNotes)) {
            if (options.includeArchived == undefined) {
                override.includeArchived = true;
            }
        }
        this.rebuildSystemSmartViews(Object.assign(Object.assign({}, options), override));
        const mostRecentVersionOfTags = (_a = options.tags) === null || _a === void 0 ? void 0 : _a.map((tag) => {
            return this.items.findItem(tag.uuid);
        }).filter((tag) => tag != undefined);
        const mostRecentVersionOfViews = (_b = options.views) === null || _b === void 0 ? void 0 : _b.map((view) => {
            if ((0, models_1.isSystemView)(view)) {
                return this.systemSmartViews.find((systemView) => systemView.uuid === view.uuid);
            }
            return this.items.findItem(view.uuid);
        }).filter((view) => view != undefined);
        const updatedOptions = Object.assign(Object.assign(Object.assign({}, options), override), {
            tags: mostRecentVersionOfTags,
            views: mostRecentVersionOfViews,
        });
        this.navigationDisplayController.setDisplayOptions(Object.assign({ customFilter: (0, models_1.computeUnifiedFilterForDisplayOptions)(updatedOptions, {
                elementsReferencingElement: this.items.itemsReferencingItem,
            }) }, updatedOptions));
    }
    rebuildSystemSmartViews(criteria) {
        this.systemSmartViews = (0, models_1.BuildSmartViews)(criteria, this.config);
        return this.systemSmartViews;
    }
    get allNotesSmartView() {
        return this.systemSmartViews.find((tag) => tag.uuid === models_1.SystemViewId.AllNotes);
    }
    get archivedSmartView() {
        return this.systemSmartViews.find((tag) => tag.uuid === models_1.SystemViewId.ArchivedNotes);
    }
    get trashSmartView() {
        return this.systemSmartViews.find((tag) => tag.uuid === models_1.SystemViewId.TrashedNotes);
    }
    get untaggedNotesSmartView() {
        return this.systemSmartViews.find((tag) => tag.uuid === models_1.SystemViewId.UntaggedNotes);
    }
}
exports.NavigationController = NavigationController;
