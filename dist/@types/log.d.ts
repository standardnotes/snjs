export declare class SNLog {
    static log(...message: any): void;
    static error(error: Error): Error;
    static onLog: (...message: any) => void;
    static onError: (error: Error) => void;
}
