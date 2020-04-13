declare type AccessType = 'encrypted' | 'decrypted';
declare type ActionVerb = 'get' | 'render' | 'show' | 'post' | 'nested';
/**
 * An in-memory only construct for displaying a list of actions, as part of SNActionsExtension.
 */
export declare class Action {
    label: string;
    desc: string;
    running: boolean;
    error: boolean;
    lastExecuted?: Date;
    context: string;
    verb: ActionVerb;
    url: string;
    access_type: AccessType;
    readonly subactions?: Action[];
    subrows?: any[];
    constructor(json: any);
}
export {};
