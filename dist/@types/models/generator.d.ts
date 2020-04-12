import { PayloadContent } from '../protocol/payloads/generator';
import { SNItem } from './core/item';
import { PurePayload } from '../protocol/payloads/pure_payload';
export declare function CreateItemFromPayload(payload: PurePayload): SNItem;
/**
 * Returns an array of uuids for the given items or payloads
 */
export declare function Uuids(items: SNItem[] | PurePayload[]): string[];
/**
 * Modifies the input object to fill in any missing required values from the
 * content body.
 */
export declare function FillItemContent(content: Record<string, any>): PayloadContent;
