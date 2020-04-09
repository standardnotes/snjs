import { ItemsKeyContent } from './../operator';
import { SNItemsKey } from '../../../models/app/items_key';
import { PurePayload } from './../../payloads/pure_payload';
import { SNRootKeyParams } from './../../key_params';
import { SNProtocolOperator001 } from '../001/operator_001';
import { PayloadFormat } from '../../payloads/formats';
import { ProtocolVersion } from '../../versions';
import { SNRootKey } from '../../root_key';
/**
 * @deprecated
 * A legacy operator no longer used to generate new accounts.
 */
export declare class SNProtocolOperator002 extends SNProtocolOperator001 {
    get version(): ProtocolVersion;
    protected generateNewItemsKeyContent(): Promise<ItemsKeyContent>;
    createRootKey(identifier: string, password: string): Promise<{
        key: SNRootKey;
        keyParams: SNRootKeyParams;
    }>;
    /**
     * Note that version 002 supported "dynamic" iteration counts. Some accounts
     * may have had costs of 5000, and others of 101000. Therefore, when computing
     * the root key, we must use the value returned by the server.
     */
    computeRootKey(password: string, keyParams: SNRootKeyParams): Promise<SNRootKey>;
    private decryptString002;
    private encryptString002;
    encryptTextParams(string: string, encryptionKey: string, authKey: string, uuid: string, version: ProtocolVersion): Promise<string>;
    decryptTextParams(ciphertextToAuth: string, contentCiphertext: string, encryptionKey: string, iv: string, authHash: string, authKey: string): Promise<string | null>;
    generateEncryptedParameters(payload: PurePayload, format: PayloadFormat, key?: SNItemsKey | SNRootKey): Promise<PurePayload>;
    generateDecryptedParameters(encryptedParameters: PurePayload, key?: SNItemsKey | SNRootKey): Promise<PurePayload>;
    protected deriveKey(password: string, pwSalt: string, pwCost: number): Promise<SNRootKey>;
    encryptionComponentsFromString002(string: string, encryptionKey: string, authKey: string): {
        encryptionVersion: string;
        authHash: string;
        uuid: string;
        iv: string;
        contentCiphertext: string;
        authParams: string;
        ciphertextToAuth: string;
        encryptionKey: string;
        authKey: string;
    };
}
