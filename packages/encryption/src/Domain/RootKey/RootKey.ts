import { RootKeyContentInStorage, RootKeyInKeychain } from './Types'
import { SNRootKeyParams } from './RootKeyParams'
import { RootKeyInterface, RootKeyContent, SNItem, PayloadInterface } from '@standardnotes/models'
import { ProtocolVersion } from '@standardnotes/common'
import { timingSafeEqual } from '@standardnotes/sncrypto-common'

/**
 * A root key is a local only construct that houses the key used for the encryption
 * and decryption of items keys. A root key extends SNItem for local convenience, but is
 * not part of the syncing or storage ecosystem—root keys are managed independently.
 */
export class SNRootKey extends SNItem<RootKeyContent> implements RootKeyInterface {
  public readonly keyParams: SNRootKeyParams

  constructor(payload: PayloadInterface<RootKeyContent>) {
    super(payload)

    this.keyParams = new SNRootKeyParams(payload.safeContent.keyParams)
  }

  public get keyVersion(): ProtocolVersion {
    return this.safeContent.version
  }

  /**
   * When the root key is used to encrypt items, we use the masterKey directly.
   */
  public get itemsKey(): string {
    return this.masterKey
  }

  public get masterKey(): string {
    return this.safeContent.masterKey
  }

  /**
   * serverPassword is not persisted as part of keychainValue, so if loaded from disk,
   * this value may be undefined.
   */
  public get serverPassword(): string | undefined {
    return this.safeContent.serverPassword
  }

  /** 003 and below only. */
  public get dataAuthenticationKey(): string | undefined {
    return this.safeContent.dataAuthenticationKey
  }

  public compare(otherKey: SNRootKey): boolean {
    if (this.keyVersion !== otherKey.keyVersion) {
      return false
    }

    if (this.serverPassword && otherKey.serverPassword) {
      return (
        timingSafeEqual(this.masterKey, otherKey.masterKey) &&
        timingSafeEqual(this.serverPassword, otherKey.serverPassword)
      )
    } else {
      return timingSafeEqual(this.masterKey, otherKey.masterKey)
    }
  }

  /**
   * @returns Object suitable for persist in storage when wrapped
   */
  public persistableValueWhenWrapping(): RootKeyContentInStorage {
    return {
      ...this.getKeychainValue(),
      keyParams: this.keyParams.getPortableValue(),
    }
  }

  /**
   * @returns Object that is suitable for persisting in a keychain
   */
  public getKeychainValue(): RootKeyInKeychain {
    const values: RootKeyInKeychain = {
      version: this.keyVersion,
      masterKey: this.masterKey,
    }

    if (this.dataAuthenticationKey) {
      values.dataAuthenticationKey = this.dataAuthenticationKey
    }

    return values
  }
}
