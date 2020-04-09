export declare class Session {
    token: string;
    static FromRaw(raw: any): Session;
    constructor(token: string);
}
