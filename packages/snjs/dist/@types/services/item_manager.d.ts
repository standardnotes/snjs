import { NotesDisplayCriteria } from '../protocol/collection/notes_display_criteria';
import { PureService } from './pure_service';
import { SNComponent } from '../models/app/component';
import { SNItemsKey } from '../models/app/items_key';
import { SNTag } from '../models/app/tag';
import { CollectionSort, SortDirection } from '../protocol/collection/item_collection';
import { ContentType } from '../models/content_types';
import { ComponentMutator } from './../models/app/component';
import { ActionsExtensionMutator, SNActionsExtension } from './../models/app/extension';
import { FeatureRepoMutator, SNFeatureRepo } from './../models/app/feature_repo';
import { ItemsKeyMutator } from './../models/app/items_key';
import { NoteMutator, SNNote } from './../models/app/note';
import { SmartTagPredicateContent, SNSmartTag } from './../models/app/smartTag';
import { TagMutator } from './../models/app/tag';
import { ItemMutator, MutationType, SNItem } from './../models/core/item';
import { SNPredicate } from './../models/core/predicate';
import { PayloadContent, PayloadOverride } from './../protocol/payloads/generator';
import { PurePayload } from './../protocol/payloads/pure_payload';
import { PayloadSource } from './../protocol/payloads/sources';
import { UuidString } from './../types';
import { PayloadManager } from './payload_manager';
declare type ObserverCallback = (
/** The items are pre-existing but have been changed */
changed: SNItem[], 
/** The items have been newly inserted */
inserted: SNItem[], 
/** The items have been deleted from local state (and remote state if applicable) */
discarded: SNItem[], 
/** Items for which encrypted overwrite protection is enabled and enacted */
ignored: SNItem[], source: PayloadSource, sourceKey?: string) => void;
export declare type TransactionalMutation = {
    itemUuid: UuidString;
    mutate: (mutator: ItemMutator) => void;
    mutationType?: MutationType;
};
/**
 * The item manager is backed by the Payload Manager. Think of the item manager as a
 * more user-friendly or item-specific interface to creating and updating data.
 * The item manager listens for change events from the global payload manager, and
 * converts any payloads to SNItems, then propagates those items to listeners on the
 * item  manager. When the item manager makes a change to an item, it will modify items
 * using a  mutator, then emit those payloads to the payload manager. The payload manager
 * will then notify  its observers (which is us), we'll convert the payloads to items,
 * and then  we'll propagate them to our listeners.
 */
export declare class ItemManager extends PureService {
    private payloadManager;
    private unsubChangeObserver;
    private observers;
    private collection;
    private notesView;
    private systemSmartTags;
    constructor(payloadManager: PayloadManager);
    private createCollection;
    setDisplayOptions(contentType: ContentType, sortBy?: CollectionSort, direction?: SortDirection, filter?: (element: any) => boolean): void;
    setNotesDisplayCriteria(criteria: NotesDisplayCriteria): void;
    getDisplayableItems(contentType: ContentType): SNItem[];
    deinit(): void;
    resetState(): void;
    /**
     * Returns an item for a given id
     */
    findItem<T extends SNItem = SNItem>(uuid: UuidString): T | undefined;
    /**
     * Returns all items matching given ids
     * @param includeBlanks If true and an item is not found, an `undefined` element
     * will be inserted into the array.
     */
    findItems(uuids: UuidString[], includeBlanks?: boolean): SNItem[];
    /**
     * Returns a detached array of all items
     */
    get items(): SNItem[];
    /**
     * Returns a detached array of all items which are not deleted
     */
    get nonDeletedItems(): SNItem[];
    /**
     * Returns all items that have not been able to decrypt.
     */
    get invalidItems(): SNItem[];
    /**
     * Returns all non-deleted items keys
     */
    itemsKeys(): SNItemsKey[];
    /**
     * Returns all non-deleted notes
     */
    get notes(): SNNote[];
    /**
     * Returns all non-deleted tags
     */
    get tags(): SNTag[];
    /**
     * Returns all non-deleted components
     */
    get components(): SNComponent[];
    addObserver(contentType: ContentType | ContentType[], callback: ObserverCallback): () => void;
    /**
     * Returns the items that reference the given item, or an empty array if no results.
     */
    itemsReferencingItem(uuid: UuidString): SNItem[];
    /**
     * Returns all items that an item directly references
     */
    referencesForItem(uuid: UuidString): SNItem[];
    private setPayloads;
    private notifyObservers;
    /**
     * Consumers wanting to modify an item should run it through this block,
     * so that data is properly mapped through our function, and latest state
     * is properly reconciled.
     * @param itemOrUuid If an item is passed, the values of that item will be directly used,
     * and the mutation will be applied on that item and propagated. This means that if you pass
     * an old item reference and mutate that, the new value will be outdated. In this case, always
     * pass the uuid of the item if you want to mutate the latest version of the item.
     */
    changeItem<M extends ItemMutator = ItemMutator>(uuid: UuidString, mutate?: (mutator: M) => void, mutationType?: MutationType, payloadSource?: PayloadSource, payloadSourceKey?: string): Promise<SNItem | undefined>;
    /**
     * @param mutate If not supplied, the intention would simply be to mark the item as dirty.
     */
    changeItems<M extends ItemMutator = ItemMutator>(uuids: UuidString[], mutate?: (mutator: M) => void, mutationType?: MutationType, payloadSource?: PayloadSource, payloadSourceKey?: string): Promise<(SNItem | undefined)[]>;
    /**
     * Run unique mutations per each item in the array, then only propagate all changes
     * once all mutations have been run. This differs from `changeItems` in that changeItems
     * runs the same mutation on all items.
     */
    runTransactionalMutations(transactions: TransactionalMutation[], payloadSource?: PayloadSource, payloadSourceKey?: string): Promise<(SNItem | undefined)[]>;
    runTransactionalMutation(transaction: TransactionalMutation, payloadSource?: PayloadSource, payloadSourceKey?: string): Promise<SNItem | undefined>;
    changeNote(uuid: UuidString, mutate: (mutator: NoteMutator) => void, mutationType?: MutationType, payloadSource?: PayloadSource, payloadSourceKey?: string): Promise<PurePayload[]>;
    changeTag(uuid: UuidString, mutate: (mutator: TagMutator) => void, mutationType?: MutationType, payloadSource?: PayloadSource, payloadSourceKey?: string): Promise<SNTag>;
    changeComponent(uuid: UuidString, mutate: (mutator: ComponentMutator) => void, mutationType?: MutationType, payloadSource?: PayloadSource, payloadSourceKey?: string): Promise<SNComponent>;
    changeFeatureRepo(uuid: UuidString, mutate: (mutator: FeatureRepoMutator) => void, mutationType?: MutationType, payloadSource?: PayloadSource, payloadSourceKey?: string): Promise<SNFeatureRepo>;
    changeActionsExtension(uuid: UuidString, mutate: (mutator: ActionsExtensionMutator) => void, mutationType?: MutationType, payloadSource?: PayloadSource, payloadSourceKey?: string): Promise<SNActionsExtension>;
    changeItemsKey(uuid: UuidString, mutate: (mutator: ItemsKeyMutator) => void, mutationType?: MutationType, payloadSource?: PayloadSource, payloadSourceKey?: string): Promise<SNItemsKey>;
    private applyTransform;
    /**
     * Sets the item as needing sync. The item is then run through the mapping function,
     * and propagated to mapping observers.
     * @param updateClientDate - Whether to update the item's "user modified date"
     */
    setItemDirty(uuid: UuidString, isUserModified?: boolean): Promise<SNItem | undefined>;
    /**
     * Similar to `setItemDirty`, but acts on an array of items as the first param.
     */
    setItemsDirty(uuids: UuidString[], isUserModified?: boolean): Promise<(SNItem | undefined)[]>;
    /**
     * Returns an array of items that need to be synced.
     */
    getDirtyItems(): SNItem[];
    /**
     * Duplicates an item and maps it, thus propagating the item to observers.
     * @param isConflict - Whether to mark the duplicate as a conflict of the original.
     */
    duplicateItem<T extends SNItem>(uuid: UuidString, isConflict?: boolean, additionalContent?: Partial<PayloadContent>): Promise<T>;
    /**
     * Creates an item and conditionally maps it and marks it as dirty.
     * @param needsSync - Whether to mark the item as needing sync
     */
    createItem(contentType: ContentType, content?: PayloadContent, needsSync?: boolean, override?: PayloadOverride): Promise<SNItem>;
    /**
     * Create an unmanaged item that can later be inserted via `insertItem`
     */
    createTemplateItem(contentType: ContentType, content?: PayloadContent): Promise<SNItem>;
    /**
     * @param item item to be checked
     * @returns Whether the item is a template (unmanaged)
     */
    isTemplateItem(item: SNItem): boolean;
    /**
     * Inserts the item as-is by reading its payload value. This function will not
     * modify item in any way (such as marking it as dirty). It is up to the caller
     * to pass in a dirtied item if that is their intention.
     */
    insertItem(item: SNItem): Promise<SNItem>;
    insertItems(items: SNItem[]): Promise<SNItem[]>;
    emitItemFromPayload(payload: PurePayload, source?: PayloadSource): Promise<SNItem>;
    emitItemsFromPayloads(payloads: PurePayload[], source?: PayloadSource): Promise<SNItem[]>;
    /**
     * Marks the item as deleted and needing sync.
     */
    setItemToBeDeleted(uuid: UuidString, source?: PayloadSource): Promise<SNItem | undefined>;
    /**
     * Like `setItemToBeDeleted`, but acts on an array of items.
     */
    setItemsToBeDeleted(uuids: UuidString[]): Promise<(SNItem | undefined)[]>;
    /**
     * Returns all items of a certain type
     * @param contentType - A string or array of strings representing
     *    content types.
     */
    getItems(contentType: ContentType | ContentType[], nonerroredOnly?: boolean): SNItem[];
    /**
     * Returns all items which are properly decrypted
     */
    nonErroredItemsForContentType(contentType: ContentType): SNItem[];
    /**
     * Returns all items matching a given predicate
     */
    itemsMatchingPredicate(predicate: SNPredicate): SNItem[];
    /**
     * Returns all items matching an array of predicates
     */
    itemsMatchingPredicates(predicates: SNPredicate[]): SNItem[];
    /**
     * Performs actual predicate filtering for public methods above.
     * Does not return deleted items.
     */
    subItemsMatchingPredicates(items: SNItem[], predicates: SNPredicate[]): SNItem[];
    /**
     * Finds the first tag matching a given title
     */
    findTagByTitle(title: string): SNTag | undefined;
    /**
     * Finds tags with title or component starting with a search query and (optionally) not associated with a note
     * @param searchQuery - The query string to match
     * @param note - The note whose tags should be omitted from results
     * @returns Array containing tags matching search query and not associated with note
     */
    searchTags(searchQuery: string, note?: SNNote): SNTag[];
    getTagParent(tagUuid: UuidString): SNTag | undefined;
    /**
     * @returns Array of tags where the front of the array represents the top of the tree.
     */
    getTagParentChain(tagUuid: UuidString): SNTag[];
    getTagChildren(tagUuid: UuidString): SNTag[];
    isTagAncestor(tagUuid: UuidString, childUuid: UuidString): boolean;
    isValidTagParent(parentTagUuid: UuidString, childTagUuid: UuidString): boolean;
    /**
     * @returns The changed child tag
     */
    setTagParent(parentTag: SNTag, childTag: SNTag): Promise<SNTag>;
    /**
     * @returns The changed child tag
     */
    unsetTagParent(childTag: SNTag): Promise<SNTag>;
    addTagToNote(note: SNNote, tag: SNTag): Promise<SNTag>;
    addTagHierarchyToNote(note: SNNote, tag: SNTag): Promise<SNTag[]>;
    /**
     * Get tags for a note sorted in natural order
     * @param note - The note whose tags will be returned
     * @returns Array containing tags associated with a note
     */
    getSortedTagsForNote(note: SNNote): SNTag[];
    createTag(title: string): Promise<SNTag>;
    createSmartTag(title: string, predicate: SmartTagPredicateContent): Promise<SNSmartTag>;
    createSmartTagFromDSL(dsl: string): Promise<SNSmartTag>;
    createTagOrSmartTag(title: string): Promise<SNTag | SNSmartTag>;
    isSmartTagTitle(title: string): boolean;
    /**
     * Finds or creates a tag with a given title
     */
    findOrCreateTagByTitle(title: string): Promise<SNTag>;
    /**
     * Returns all notes matching the smart tag
     */
    notesMatchingSmartTag(smartTag: SNSmartTag): SNNote[];
    /**
     * Returns the smart tag corresponding to the "Trash" tag.
     */
    get trashSmartTag(): SNSmartTag;
    /**
     * Returns all items currently in the trash
     */
    get trashedItems(): SNNote[];
    /**
     * Permanently deletes any items currently in the trash. Consumer must manually call sync.
     */
    emptyTrash(): Promise<(SNItem | undefined)[]>;
    /**
     * Returns all smart tags, sorted by title.
     */
    getSmartTags(): SNSmartTag[];
    /**
     * The number of notes currently managed
     */
    get noteCount(): number;
    /**
     * Immediately removes all items from mapping state and notifies observers
     * Used primarily when signing into an account and wanting to discard any current
     * local data.
     */
    removeAllItemsFromMemory(): Promise<void>;
    removeItemLocally(item: SNItem): void;
}
export {};
