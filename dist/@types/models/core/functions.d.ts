import { SNItem } from './item';
import { PayloadContent } from '../../protocol/payloads/generator';
export declare function ItemContentsEqual(leftContent: PayloadContent, rightContent: PayloadContent, keysToIgnore: string[], appDataKeysToIgnore: string[]): boolean;
export declare function ItemContentsDiffer(item1: SNItem, item2: SNItem, excludeContentKeys?: string[]): boolean;
