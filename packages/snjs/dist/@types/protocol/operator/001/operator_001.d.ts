import { ItemAuthenticatedData, LegacyAttachedData, RootKeyEncryptedAuthenticatedData } from './../../payloads/generator';
import { SNItemsKey } from '../../../models/app/items_key';
import { KeyParamsOrigination, SNRootKeyParams } from './../../key_params';
import { ItemsKeyContent } from './../operator';
import { SNProtocolOperator } from '../operator';
import { PayloadFormat } from '../../payloads/formats';
import { ProtocolVersion } from '../../versions';
import { SNRootKey } from '../../root_key';
import { PurePayload } from '../../payloads/pure_payload';
/**
 * @deprecated
 * A legacy operator no longer used to generate new accounts
 */
export declare class SNProtocolOperator001 extends SNProtocolOperator {
    getEncryptionDisplayName(): string;
    get version(): ProtocolVersion;
    protected generateNewItemsKeyContent(): Promise<ItemsKeyContent>;
    createRootKey(identifier: string, password: string, origination: KeyParamsOrigination): Promise<SNRootKey>;
    getPayloadAuthenticatedData(_payload: PurePayload): Promise<RootKeyEncryptedAuthenticatedData | ItemAuthenticatedData | LegacyAttachedData | undefined>;
    computeRootKey(password: string, keyParams: SNRootKeyParams): Promise<SNRootKey>;
    private decryptString;
    private encryptString;
    generateEncryptedParameters(payload: PurePayload, format: PayloadFormat, key?: SNItemsKey | SNRootKey): Promise<PurePayload>;
    generateDecryptedParameters(encryptedParameters: PurePayload, key?: SNItemsKey | SNRootKey): Promise<PurePayload>;
    private encryptionComponentsFromString;
    protected deriveKey(password: string, keyParams: SNRootKeyParams): Promise<SNRootKey>;
}
