/**
 * An in-memory only construct for displaying a list of actions, as part of SNActionsExtension.
 */
declare type AccessType = 'encrypted' | 'decrypted';
export declare class Action {
    running: boolean;
    error: boolean;
    lastExecuted?: Date;
    context: string;
    verb: string;
    url: string;
    access_type: AccessType;
    constructor(json: any);
}
export {};
