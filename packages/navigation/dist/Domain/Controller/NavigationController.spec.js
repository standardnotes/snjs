"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NavigationController_1 = require("./NavigationController");
describe('navigation controller', () => {
    let itemManager;
    let defaultEventHandler;
    const createController = (eventHandler) => {
        return new NavigationController_1.NavigationController(itemManager, { supportsFileNavigation: true }, eventHandler);
    };
    beforeEach(() => {
        itemManager = {};
        itemManager.addObserver = jest.fn();
        itemManager.createDisplayController = jest.fn();
        itemManager.getFilesForNote = jest.fn();
        itemManager.itemsReferencingItem = jest.fn();
        itemManager.findItem = jest.fn();
        defaultEventHandler = {
            onNotes(_notes) { },
            onFolders(_tags) { },
            onFiles(_files) { },
            onSelectedNotes(_selectedNotes) { },
            onSelectedFolders(_selectedFolders) { },
            onSelectedFiles(_selectedFiles) { },
        };
    });
    it('passes', () => {
        createController(defaultEventHandler);
    });
});
