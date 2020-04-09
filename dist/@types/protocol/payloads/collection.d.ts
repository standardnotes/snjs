import { PayloadSource } from './sources';
import { UuidMap } from './uuid_map';
import { SNItem } from './../../models/core/item';
import { ContentType } from '../../models/content_types';
import { UuidString } from './../../types';
import { PurePayload } from './pure_payload';
declare type Payloadable = PurePayload | SNItem;
export declare class MutableCollection<T extends Payloadable> {
    protected readonly map: Partial<Record<UuidString, T>>;
    protected readonly typedMap: Partial<Record<ContentType, T[]>>;
    /** Maintains an index where the direct map for each item id is an array
     * of item ids that the item references. This is essentially equivalent to
     * item.content.references, but keeps state even when the item is deleted.
     * So if tag A references Note B, referenceMap.directMap[A.uuid] == [B.uuid].
     * The inverse map for each item is an array of item ids where the items reference the
     * key item. So if tag A references Note B, referenceMap.inverseMap[B.uuid] == [A.uuid].
     * This allows callers to determine for a given item, who references it?
     * It would be prohibitive to look this up on demand */
    protected readonly referenceMap: UuidMap;
    /** Maintains an index for each item uuid where the value is an array of uuids that are
     * conflicts of that item. So if Note B and C are conflicts of Note A,
     * conflictMap[A.uuid] == [B.uuid, C.uuid] */
    protected readonly conflictMap: UuidMap;
    constructor(elements?: T[], copy?: boolean, mapCopy?: Partial<Record<UuidString, T>>, typedMapCopy?: Partial<Record<ContentType, T[]>>, referenceMapCopy?: UuidMap, conflictMapCopy?: UuidMap);
    immutablePayloadCopy(): ImmutablePayloadCollection;
    uuids(): string[];
    all(contentType?: ContentType): T[];
    find(uuid: UuidString): T | undefined;
    /**
     * @param includeBlanks If true and an item is not found, an `undefined` element
     * will be inserted into the array.
     */
    findAll(uuids: UuidString[], includeBlanks?: boolean): (T | undefined)[];
    set(elements: T | T[]): void;
    discard(elements: T | T[]): void;
    private setToTypedMap;
    private deleteFromTypedMap;
    uuidsThatReferenceUuid(uuid: UuidString): string[];
    elementsReferencingElement(element: T): T[];
    conflictsOf(uuid: UuidString): T[];
}
/**
 * A collection of payloads coming from a single source.
 */
export declare class ImmutablePayloadCollection extends MutableCollection<PurePayload> {
    readonly source?: PayloadSource;
    constructor(payloads?: PurePayload[], source?: PayloadSource, copy?: boolean, mapCopy?: Partial<Record<UuidString, PurePayload>>, typedMapCopy?: Partial<Record<ContentType, PurePayload[]>>, referenceMapCopy?: UuidMap, conflictMapCopy?: UuidMap);
    get payloads(): PurePayload[];
}
export {};
