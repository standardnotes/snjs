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
    readonly hidePreview = false;
    readonly preview_plain: string;
    readonly preview_html: string;
    constructor(payload: PurePayload);
    safeText(): string;
    safeTitle(): string;
    get prefersPlainEditor(): any;
    static filterDummyNotes(notes: SNNote[]): SNNote[];
}
export declare class NoteMutator extends ItemMutator {
    set title(title: string);
    set text(text: string);
    set hidePreview(hidePreview: boolean);
    set preview_plain(preview_plain: string);
    set preview_html(preview_html: string | undefined);
    set prefersPlainEditor(prefersPlainEditor: boolean);
}
