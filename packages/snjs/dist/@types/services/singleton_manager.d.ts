import { ContentType } from './../models/content_types';
import { ItemManager } from './item_manager';
import { SNPredicate } from '../models/core/predicate';
import { SNItem } from '../models/core/item';
import { PureService } from './pure_service';
import { PayloadContent } from '../protocol/payloads/generator';
import { SNSyncService } from './sync/sync_service';
/**
 * The singleton manager allow consumers to ensure that only 1 item exists of a certain
 * predicate. For example, consumers may want to ensure that only one item of contentType
 * UserPreferences exist. The singleton manager allows consumers to do this via 2 methods:
 * 1. Consumers may use `findOrCreateSingleton` to retrieve an item if it exists, or create
 *    it otherwise. While this method may serve most cases, it does not allow the consumer
 *    to subscribe to changes, such as if after this method is called, a UserPreferences object
 *    is downloaded from a remote source.
 * 2. Consumers may use `registerPredicate` in order to constantly monitor a particular
 *    predicate and ensure that only 1 value exists for that predicate. This may be used in
 *    tandem with `findOrCreateSingleton`, for example to monitor a predicate after we
 *    intitially create the item.
 */
export declare class SNSingletonManager extends PureService {
    private itemManager;
    private syncService;
    private resolveQueue;
    private registeredPredicates;
    private removeItemObserver;
    private removeSyncObserver;
    constructor(itemManager: ItemManager, syncService: SNSyncService);
    deinit(): void;
    private popResolveQueue;
    /**
     * We only want to resolve singletons for items that are newly created (because this
     * is when items proliferate). However, we don't want to resolve immediately on creation,
     * but instead wait for the next full sync to complete. This is so that when you download
     * a singleton and create the object, but the items key for the item has not yet been
     * downloaded, the singleton will be errorDecrypting, and would be mishandled in the
     * overall singleton logic. By waiting for a full sync to complete, we can be sure that
     * all items keys have been downloaded.
     */
    private addObservers;
    /**
     * Predicates registered are automatically observed. If global item state changes
     * such that the item(s) match the predicate, procedures will be followed such that
     * the end result is that only 1 item remains, and the others are deleted.
     */
    registerPredicate(predicate: SNPredicate): void;
    private validItemsMatchingPredicate;
    private resolveSingletonsForItems;
    private handleStrategy;
    findSingleton<T extends SNItem>(predicate: SNPredicate): T | undefined;
    findOrCreateSingleton<T extends SNItem = SNItem>(predicate: SNPredicate, createContentType: ContentType, createContent: PayloadContent): Promise<T>;
}
