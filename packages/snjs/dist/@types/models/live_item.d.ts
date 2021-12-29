import { SNApplication } from './../application';
import { SNItem } from './core/item';
/** Keeps an item reference up to date with changes */
export declare class LiveItem<T extends SNItem> {
    item: T;
    private removeObserver;
    constructor(uuid: string, application: SNApplication, onChange?: (item: T) => void);
    deinit(): void;
}
