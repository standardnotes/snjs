import { PurePayload } from './../../protocol/payloads/pure_payload';
import { SNItem } from '../../../../models/core/item';
import { SNNote } from './note';
/**
 * @deprecated
 * Editor objects are depracated in favor of SNComponent objects
 */
export declare class SNEditor extends SNItem {
    readonly notes: SNNote[];
    readonly data: Record<string, unknown>;
    readonly url: string;
    readonly name: string;
    readonly isDefault: boolean;
    readonly systemEditor: boolean;
    constructor(payload: PurePayload);
}
