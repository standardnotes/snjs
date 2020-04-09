import { SNItem } from '../core/item';
import { SNPredicate } from '../core/predicate';
export declare class SNUserPrefs extends SNItem {
    get isSingleton(): boolean;
    get singletonPredicate(): SNPredicate;
}
