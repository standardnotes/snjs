import { SNItem, ItemMutator } from '../core/item';
import { PurePayload } from './../../protocol/payloads/pure_payload';
/**
 * Allows organization of notes into groups. A tag can have many notes, and a note
 * can have many tags.
 */
export declare class SNTag extends SNItem {
    readonly title: string;
    constructor(payload: PurePayload);
    get noteCount(): number;
    isSmartTag(): boolean;
    get isAllTag(): any;
    get isTrashTag(): any;
    get isArchiveTag(): any;
    static arrayToDisplayString(tags: SNTag[]): string;
}
export declare class TagMutator extends ItemMutator {
    set title(title: string);
}
