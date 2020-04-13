import { PayloadContent } from '../protocol/payloads/generator';
/**
 * Returns an array of uuids for the given items or payloads
 */
export declare function Uuids(items: any[]): string[];
/**
 * Modifies the input object to fill in any missing required values from the
 * content body.
 */
export declare function FillItemContent(content: Record<string, any>): PayloadContent;
