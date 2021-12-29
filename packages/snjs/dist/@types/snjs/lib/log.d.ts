export declare class SNLog {
    static log(...message: any): void;
    static error<T extends Error>(error: T): T;
    static onLog: (...message: any) => void;
    static onError: (error: Error) => void;
}
