/**
 * An abstract class with no instance methods. Used globally to generate uuids by any
 * consumer. Application must call SetGenerators before use.
 */
export declare class Uuid {
    private static syncUuidFunc?;
    private static asyncUuidFunc;
    /**
     * Dynamically feed both a syncronous and asyncronous implementation of a UUID generator function.
     * Feeding it this way allows platforms to implement their own uuid generation schemes, without
     * this class having to import any global functions.
     * @param {function} asyncImpl - An asyncronous function that returns a UUID.
     * @param {function} syncImpl - A syncronous function that returns a UUID.
     */
    static SetGenerators(asyncImpl: () => Promise<string>, syncImpl?: () => string): void;
    /**
     * Whether there is a syncronous UUID generation function available.
     */
    static canGenSync(): boolean;
    /**
     * Generates a UUID string asyncronously.
     */
    static GenerateUuid(): Promise<string>;
    /**
     * Generates a UUID string syncronously.
     */
    static GenerateUuidSynchronously(): string;
}
