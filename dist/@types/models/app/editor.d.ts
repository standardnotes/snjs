import { PurePayload } from './../../protocol/payloads/pure_payload';
import { SNNote } from './note';
import { SNItem } from '../core/item';
/**
 * @deprecated
 * Editor objects are depracated in favor of SNComponent objects
 */
export declare class SNEditor extends SNItem {
    readonly notes: SNNote[];
    readonly data: Record<string, any>;
    readonly url: string;
    readonly name: string;
    readonly isDefault: boolean;
    readonly systemEditor: boolean;
    constructor(payload: PurePayload);
}
