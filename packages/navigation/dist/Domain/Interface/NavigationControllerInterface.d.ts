import { DisplayOptions, FileItem, SmartView, SNNote } from '@standardnotes/models';
import { SupportedItem, Folder } from './Types';
export interface NavigationControllerInterface {
    selectItems(items: SupportedItem[], { multipleSelection }: {
        multipleSelection: boolean;
    }): void;
    deselectItems(items: SupportedItem[]): void;
    getNotes(): SNNote[];
    getNotesAndFiles(): (SNNote | FileItem)[];
    getFolders(): Folder[];
    getFiles(): FileItem[];
    getSelectedNotes(): SNNote[];
    getSelectedNotesAndFiles(): (SNNote | FileItem)[];
    getSelectedFolders(): Folder[];
    getSelectedFiles(): FileItem[];
    getFilesForSelectedNotes(): FileItem[];
    get allNotesSmartView(): SmartView;
    get archivedSmartView(): SmartView;
    get trashSmartView(): SmartView;
    get untaggedNotesSmartView(): SmartView;
    setDisplayOptions(options: DisplayOptions): void;
    deinit(): void;
}
