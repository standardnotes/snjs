import { ItemsKeyContent } from './../operator';
import { SNRootKey } from './../../root_key';
import { KeyParamsOrigination, SNRootKeyParams } from './../../key_params';
import { SNProtocolOperator002 } from '../002/operator_002';
import { ProtocolVersion } from '../../versions';
/**
 * @legacy
 * Non-expired operator but no longer used for generating new accounts.
 * This operator subclasses the 002 operator to share functionality that has not
 * changed, and overrides functions where behavior may differ.
 */
export declare class SNProtocolOperator003 extends SNProtocolOperator002 {
    get version(): ProtocolVersion;
    protected generateNewItemsKeyContent(): Promise<ItemsKeyContent>;
    computeRootKey(password: string, keyParams: SNRootKeyParams): Promise<SNRootKey>;
    protected deriveKey(password: string, keyParams: SNRootKeyParams): Promise<SNRootKey>;
    createRootKey(identifier: string, password: string, origination: KeyParamsOrigination): Promise<SNRootKey>;
    private generateSalt;
}
