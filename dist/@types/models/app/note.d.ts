import { SNItem, ItemMutator } from '../core/item';
import { PurePayload } from './../../protocol/payloads/pure_payload';
export interface NoteContent {
    title: string;
    text: string;
}
/** A note item */
export declare class SNNote extends SNItem implements NoteContent {
    readonly title: string;
    readonly text: string;
    readonly mobilePrefersPlainEditor?: boolean;
    constructor(payload: PurePayload);
    safeText(): string;
    safeTitle(): string;
    static filterDummyNotes(notes: SNNote[]): SNNote[];
}
export declare class NoteMutator extends ItemMutator {
    set title(title: string);
    set text(text: string);
}
