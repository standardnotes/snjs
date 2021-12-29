import { ContentReference } from '../../../../protocol/payloads/generator';
import { ItemMutator, SNItem } from '../../../../models/core/item';
import { PurePayload } from '../../../../protocol/payloads/pure_payload';
import { UuidString } from './../../types';
import { ItemContent } from './../core/item';
export interface TagContent extends ItemContent {
    title: string;
}
/**
 * Allows organization of notes into groups.
 * A tag can have many notes, and a note can have many tags.
 */
export declare class SNTag extends SNItem implements TagContent {
    readonly title: string;
    constructor(payload: PurePayload);
    get noteReferences(): ContentReference[];
    get noteCount(): number;
    get isSmartTag(): boolean;
    get isSystemSmartTag(): boolean;
    get isAllTag(): boolean;
    get isTrashTag(): boolean;
    get isArchiveTag(): boolean;
    get parentId(): UuidString | undefined;
    static arrayToDisplayString(tags: SNTag[]): string;
}
export declare class TagMutator extends ItemMutator {
    get typedContent(): TagContent;
    set title(title: string);
    makeChildOf(tag: SNTag): void;
}
