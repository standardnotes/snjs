import { CollectionSort, SortDirection } from '../protocol/collection/item_collection';
import { SNItemsKey } from '../models/app/items_key';
import { ItemsKeyMutator } from './../models/app/items_key';
import { SNTag } from '../models/app/tag';
import { SNNote, NoteMutator } from './../models/app/note';
import { ActionsExtensionMutator } from './../models/app/extension';
import { SNSmartTag } from './../models/app/smartTag';
import { SNPredicate } from './../models/core/predicate';
import { UuidString } from './../types';
import { PureService } from './pure_service';
import { ComponentMutator } from './../models/app/component';
import { SNComponent } from '../models/app/component';
import { PayloadOverride, PayloadContent } from './../protocol/payloads/generator';
import { SNItem, ItemMutator, MutationType } from './../models/core/item';
import { PayloadSource } from './../protocol/payloads/sources';
import { PurePayload } from './../protocol/payloads/pure_payload';
import { PayloadManager } from './model_manager';
import { ContentType } from '../models/content_types';
declare type ObserverCallback = (
/** The items are pre-existing but have been changed */
changed: SNItem[], 
/** The items have been newly inserted */
inserted: SNItem[], 
/** The items have been deleted from local state (and remote state if applicable) */
discarded: SNItem[], source?: PayloadSource, sourceKey?: string) => void;
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
    private modelManager?;
    private unsubChangeObserver;
    private observers;
    private collection;
    private notesView;
    private systemSmartTags;
    constructor(modelManager: PayloadManager);
    private createCollection;
    setDisplayOptions(contentType: ContentType, sortBy?: CollectionSort, direction?: SortDirection, filter?: (element: any) => boolean): void;
    setNotesDisplayOptions(tag?: SNTag, sortBy?: CollectionSort, direction?: SortDirection, filter?: (element: any) => boolean): void;
    getDisplayableItems(contentType: ContentType): (SNItem | undefined)[];
    deinit(): void;
    resetState(): void;
    /**
     * Returns an item for a given id
     */
    findItem(uuid: UuidString): SNItem | undefined;
    /**
     * Returns all items matching given ids
     * @param includeBlanks If true and an item is not found, an `undefined` element
     * will be inserted into the array.
     */
    findItems(uuids: UuidString[], includeBlanks?: boolean): (SNItem | undefined)[];
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
    itemsReferencingItem(uuid: UuidString): (SNItem | undefined)[];
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
    private createMutatorForItem;
    /**
     * @param mutate If not supplied, the intention would simply be to mark the item as dirty.
     */
    changeItems<M extends ItemMutator = ItemMutator>(uuids: UuidString[], mutate?: (mutator: M) => void, mutationType?: MutationType, payloadSource?: PayloadSource, payloadSourceKey?: string): Promise<(SNItem | undefined)[]>;
    changeNote(uuid: UuidString, mutate: (mutator: NoteMutator) => void, mutationType?: MutationType, payloadSource?: PayloadSource, payloadSourceKey?: string): Promise<PurePayload[]>;
    changeComponent(uuid: UuidString, mutate: (mutator: ComponentMutator) => void, mutationType?: MutationType, payloadSource?: PayloadSource, payloadSourceKey?: string): Promise<PurePayload[]>;
    changeActionsExtension(uuid: UuidString, mutate: (mutator: ActionsExtensionMutator) => void, mutationType?: MutationType, payloadSource?: PayloadSource, payloadSourceKey?: string): Promise<PurePayload[]>;
    changeItemsKey(uuid: UuidString, mutate: (mutator: ItemsKeyMutator) => void, mutationType?: MutationType, payloadSource?: PayloadSource, payloadSourceKey?: string): Promise<PurePayload[]>;
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
     * Inserts the item as-is by reading its payload value. This function will not
     * modify item in any way (such as marking it as dirty). It is up to the caller
     * to pass in a dirtied item if that is their intention.
     */
    insertItem(item: SNItem): Promise<SNItem>;
    /**
     * Duplicates an item and maps it, thus propagating the item to observers.
     * @param isConflict - Whether to mark the duplicate as a conflict of the original.
     */
    duplicateItem(uuid: UuidString, isConflict?: boolean): Promise<SNItem>;
    /**
     * Creates an item and conditionally maps it and marks it as dirty.
     * @param needsSync - Whether to mark the item as needing sync
     */
    createItem(contentType: ContentType, content?: PayloadContent, needsSync?: boolean, override?: PayloadOverride): Promise<SNItem>;
    createTemplateItem(contentType: ContentType, content?: PayloadContent): Promise<SNItem>;
    emitItemFromPayload(payload: PurePayload, source?: PayloadSource): Promise<SNItem>;
    emitItemsFromPayloads(payloads: PurePayload[], source?: PayloadSource): Promise<(SNItem | undefined)[]>;
    /**
     * Marks the item as deleted and needing sync.
     */
    setItemToBeDeleted(uuid: UuidString): Promise<SNItem | undefined>;
    /**
     * Like `setItemToBeDeleted`, but acts on an array of items.
     */
    setItemsToBeDeleted(uuids: UuidString[]): Promise<(SNItem | undefined)[]>;
    /**
     * Returns all items of a certain type
     * @param contentType - A string or array of strings representing
     *    content types.
     */
    getItems(contentType: ContentType | ContentType[]): SNItem[];
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
