import { SNRootKeyParams } from './../../key_params';
import { SNProtocolOperator002 } from '../002/operator_002';
import { ProtocolVersion } from '../../versions';
/**
 * @deprecated
 * Non-expired operator but no longer used for generating new accounts.
 * This operator subclasses the 002 operator to share functionality that has not
 * changed, and overrides functions where behavior may differ.
 */
export declare class SNProtocolOperator003 extends SNProtocolOperator002 {
    get version(): ProtocolVersion;
    computeRootKey(password: string, keyParams: SNRootKeyParams): Promise<import("../..").SNRootKey>;
    createRootKey(identifier: string, password: string): Promise<{
        key: import("../..").SNRootKey;
        keyParams: SNRootKeyParams;
    }>;
    private generateSalt;
}
