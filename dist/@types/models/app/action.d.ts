export declare enum ActionAccessType {
    Encrypted = "encrypted",
    Decrypted = "decrypted"
}
export declare enum ActionVerb {
    Get = "get",
    Render = "render",
    Show = "show",
    Post = "post",
    Nested = "nested"
}
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
    access_type: ActionAccessType;
    readonly subactions?: Action[];
    subrows?: any[];
    constructor(json: any);
}
