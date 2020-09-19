import { KeyParamsResponse } from './../services/api/responses';
import { ProtocolVersion } from './versions';
/**
 *  001, 002:
 *  - Nonce is not uploaded to server, instead used to compute salt locally and send to server
 *  - Salt is returned from server
 *  - Cost/iteration count is returned from the server
 *  - Account identifier is returned as 'email'
 *  003, 004:
 *  - Salt is computed locally via the seed (pw_nonce) returned from the server
 *  - Cost/iteration count is determined locally by the protocol version
 *  - Account identifier is returned as 'identifier'
 */
export declare enum KeyParamsOrigination {
    Registration = "registration",
    EmailChange = "email-change",
    PasswordChange = "password-change",
    ProtocolUpgrade = "protocol-upgrade",
    Passcode = "passcode",
    PasscodeChange = "passcode-change"
}
declare type BaseKeyParams = {
    /** Seconds since creation date */
    created?: string;
    /** The event that lead to the creation of these params */
    origination?: KeyParamsOrigination;
    version: ProtocolVersion;
};
export declare type KeyParamsContent001 = BaseKeyParams & {
    email: string;
    pw_cost: number;
    pw_salt: string;
};
export declare type KeyParamsContent002 = BaseKeyParams & {
    email: string;
    pw_cost: number;
    pw_salt: string;
};
export declare type KeyParamsContent003 = BaseKeyParams & {
    identifier: string;
    pw_nonce: string;
};
export declare type KeyParamsContent004 = Required<BaseKeyParams> & {
    identifier: string;
    pw_nonce: string;
};
export declare type AnyKeyParamsContent = KeyParamsContent001 | KeyParamsContent002 | KeyParamsContent003 | KeyParamsContent004;
export declare function Create001KeyParams(keyParams: KeyParamsContent001): SNRootKeyParams;
export declare function Create002KeyParams(keyParams: KeyParamsContent002): SNRootKeyParams;
export declare function Create003KeyParams(keyParams: KeyParamsContent003): SNRootKeyParams;
export declare function Create004KeyParams(keyParams: KeyParamsContent004): SNRootKeyParams;
export declare function CreateAnyKeyParams(keyParams: AnyKeyParamsContent): SNRootKeyParams;
export declare function KeyParamsFromApiResponse(response: KeyParamsResponse): SNRootKeyParams;
/**
 * Key params are public data that contain information about how a root key was created.
 * Given a keyParams object and a password, clients can compute a root key that was created
 * previously.
 */
export declare class SNRootKeyParams {
    readonly content: AnyKeyParamsContent;
    constructor(content: AnyKeyParamsContent);
    /**
     * For consumers to determine whether the object they are
     * working with is a proper RootKeyParams object.
     */
    get isKeyParamsObject(): boolean;
    get identifier(): string;
    get version(): ProtocolVersion;
    get content001(): KeyParamsContent001;
    get content002(): KeyParamsContent002;
    get content003(): KeyParamsContent003;
    get content004(): KeyParamsContent004;
    get createdDate(): Date | undefined;
    compare(other: SNRootKeyParams): boolean;
    /**
     * @access public
     * When saving in a file or communicating with server,
     * use the original values.
     */
    getPortableValue(): AnyKeyParamsContent;
}
export {};
