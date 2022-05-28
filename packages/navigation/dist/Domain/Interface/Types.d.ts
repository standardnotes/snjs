import { ContentType } from '@standardnotes/common';
import { FileItem, ItemInterface, SmartView, SNNote, SNTag } from '@standardnotes/models';
export declare type NavigationControllerConfig = {
    supportsFileNavigation: boolean;
};
export declare type SupportedItem = SNNote | FileItem | SNTag | SmartView;
export declare type Folder = SNTag | SmartView;
export declare const FolderContentTypes: ContentType[];
export declare function isFolder(x: ItemInterface): x is Folder;
