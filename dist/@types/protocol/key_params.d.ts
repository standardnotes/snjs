import { ProtocolVersion } from './versions';
export declare type KeyParamsContent = {
    pw_cost: number;
    pw_nonce: string;
    identifier?: string;
    email?: string;
    pw_salt?: string;
    version: ProtocolVersion;
};
export declare function CreateKeyParams(keyParams: KeyParamsContent): SNRootKeyParams;
/**
 * Key params are public data that contain information about how a root key was created.
 * Given a keyParams object and a password, clients can compute a root key that was created
 * previously.
 */
export declare class SNRootKeyParams {
    readonly content: KeyParamsContent;
    constructor(content: KeyParamsContent);
    /**
     * For consumers to determine whether the object they are
     * working with is a proper RootKeyParams object.
     */
    get isKeyParamsObject(): boolean;
    get kdfIterations(): number;
    get seed(): string;
    get identifier(): string | undefined;
    get salt(): string | undefined;
    get version(): ProtocolVersion;
    /**
     * @access public
     * When saving in a file or communicating with server,
     * use the original values.
     */
    getPortableValue(): KeyParamsContent;
}
