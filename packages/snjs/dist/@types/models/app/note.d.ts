import { ItemMutator, SNItem } from '../core/item';
import { PurePayload } from './../../protocol/payloads/pure_payload';
export interface NoteContent {
    title: string;
    text: string;
    mobilePrefersPlainEditor?: boolean;
    hidePreview: boolean;
    preview_plain?: string;
    preview_html?: string;
}
/** A note item */
export declare class SNNote extends SNItem implements NoteContent {
    readonly title: string;
    readonly text: string;
    readonly mobilePrefersPlainEditor?: boolean;
    readonly hidePreview = false;
    readonly preview_plain: string;
    readonly preview_html: string;
    readonly prefersPlainEditor: boolean;
    constructor(payload: PurePayload);
    safeText(): string;
    safeTitle(): string;
}
export declare class NoteMutator extends ItemMutator {
    get typedContent(): Partial<NoteContent>;
    set title(title: string);
    set text(text: string);
    set hidePreview(hidePreview: boolean);
    set preview_plain(preview_plain: string);
    set preview_html(preview_html: string | undefined);
    set prefersPlainEditor(prefersPlainEditor: boolean);
}
