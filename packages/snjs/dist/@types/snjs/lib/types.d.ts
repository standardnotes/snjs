export declare type AnyRecord = Partial<Record<string, any>>;
export declare type UuidString = string;
export declare type ApplicationIdentifier = string;
export declare enum DeinitSource {
    SignOut = 1,
    Lock = 2,
    AppGroupUnload = 3
}
export declare type ErrorObject = {
    error: string;
};
export declare type ApplicationEventPayload = Partial<{}>;
