import { SNRootKeyParams } from './../../protocol/key_params'
import { leftVersionGreaterThanOrEqualToRight, compareVersions } from '@standardnotes/applications'
import { SNRootKey } from '@Protocol/root_key'
import { extendArray } from '@standardnotes/utils'
import { SNItemsKey } from '@Lib/Models/ItemsKey/ItemsKey'
import { CreateItemFromPayload } from '@Lib/Models/Generator'
import { AnyKeyParamsContent, ContentType, ProtocolVersion } from '@standardnotes/common'
import { SNProtocolService } from './ProtocolService'
import { BackupFile, BackupFileType } from './BackupFile'
import { CreateAnyKeyParams } from '@Lib/protocol/key_params'
import { CreateSourcedPayloadFromObject, PayloadFormat } from '@Lib/../../payloads/dist'
import { PayloadSource, PurePayload, CreateMaxPayloadFromAnyObject } from '@standardnotes/payloads'
import { ClientDisplayableError } from '@Lib/ClientError'

export class BackupFileDecryptor {
  private inPayloads: PurePayload[]
  private backupType: BackupFileType
  private keyParams?: SNRootKeyParams

  constructor(
    private file: BackupFile,
    private protocolService: SNProtocolService,
    private password?: string,
  ) {
    this.inPayloads = file.items.map((rawItem) => {
      return CreateSourcedPayloadFromObject(rawItem, PayloadSource.FileImport)
    })

    if (file.keyParams || file.auth_params) {
      const keyParamsData = (this.file.keyParams || this.file.auth_params) as AnyKeyParamsContent
      this.keyParams = CreateAnyKeyParams(keyParamsData)
      this.backupType = BackupFileType.Encrypted
    } else {
      const hasEncryptedItem = this.inPayloads.find(
        (payload) => payload.format === PayloadFormat.EncryptedString,
      )
      const hasDecryptedItemsKey = this.inPayloads.find(
        (payload) =>
          payload.content_type === ContentType.ItemsKey &&
          payload.format === PayloadFormat.DecryptedBareObject,
      )

      if (hasEncryptedItem && hasDecryptedItemsKey) {
        this.backupType = BackupFileType.EncryptedWithNonEncryptedItemsKey
      } else if (!hasEncryptedItem) {
        this.backupType = BackupFileType.FullyDecrypted
      } else {
        this.backupType = BackupFileType.Corrupt
      }
    }
  }

  public destroy() {
    ;(this.protocolService as unknown) = undefined
    ;(this.password as unknown) = undefined
    ;(this.file as unknown) = undefined
    ;(this.inPayloads as unknown) = undefined
    ;(this.keyParams as unknown) = undefined
  }

  public async decrypt(): Promise<PurePayload[] | ClientDisplayableError> {
    switch (this.backupType) {
      case BackupFileType.Corrupt:
        return new ClientDisplayableError('Invalid backup file.')
      case BackupFileType.Encrypted: {
        return this.decryptEncrypted()
      }
      case BackupFileType.EncryptedWithNonEncryptedItemsKey:
        return this.decryptEncryptedWithNonEncryptedItemsKey()
      case BackupFileType.FullyDecrypted:
        return this.decryptFullyDecrypted()
    }
  }

  private decryptFullyDecrypted(): Promise<PurePayload[]> {
    return Promise.resolve(this.inPayloads)
  }

  private decryptEncryptedWithNonEncryptedItemsKey(): Promise<PurePayload[]> {
    const itemsKeys = this.inPayloads
      .filter((payload) => {
        return payload.content_type === ContentType.ItemsKey
      })
      .map((p) => CreateItemFromPayload<SNItemsKey>(p))
    return this.decryptWithItemsKeys(itemsKeys)
  }

  private findItemsKeyToUseForPayload(
    payload: PurePayload,
    availableKeys: SNItemsKey[],
    fallbackRootKey?: SNRootKey,
  ): SNItemsKey | SNRootKey | undefined {
    let itemsKey: SNItemsKey | SNRootKey | undefined

    if (payload.items_key_id) {
      itemsKey = this.protocolService.itemsKeyForPayload(payload)
      if (itemsKey) {
        return itemsKey
      }
    }

    itemsKey = availableKeys.find((itemsKeyPayload) => {
      return payload.items_key_id === itemsKeyPayload.uuid
    })

    if (itemsKey) {
      return itemsKey
    }

    const payloadVersion = payload.version as ProtocolVersion

    /**
     * Payloads with versions <= 003 use root key directly for encryption.
     * However, if the incoming key params are >= 004, this means we should
     * have an items key based off the 003 root key. We can't use the 004
     * root key directly because it's missing dataAuthenticationKey.
     */
    if (leftVersionGreaterThanOrEqualToRight(this.keyParams!.version, ProtocolVersion.V004)) {
      itemsKey = this.protocolService.defaultItemsKeyForItemVersion(payloadVersion, availableKeys)
    } else if (compareVersions(payloadVersion, ProtocolVersion.V003) <= 0) {
      itemsKey = fallbackRootKey
    }

    return itemsKey
  }

  private async decryptWithItemsKeys(
    itemsKeys: SNItemsKey[],
    fallbackRootKey?: SNRootKey,
  ): Promise<PurePayload[]> {
    const decryptedPayloads: PurePayload[] = []

    for (const encryptedPayload of this.inPayloads) {
      if (encryptedPayload.content_type === ContentType.ItemsKey) {
        continue
      }

      try {
        const itemsKey = this.findItemsKeyToUseForPayload(
          encryptedPayload,
          itemsKeys,
          fallbackRootKey,
        )

        const decryptedPayload = await this.protocolService.payloadByDecryptingPayload(
          encryptedPayload,
          itemsKey,
        )
        decryptedPayloads.push(decryptedPayload)
      } catch (e) {
        decryptedPayloads.push(
          CreateMaxPayloadFromAnyObject(encryptedPayload, {
            errorDecrypting: true,
            errorDecryptingValueChanged: !encryptedPayload.errorDecrypting,
          }),
        )
        console.error('Error decrypting payload', encryptedPayload, e)
      }
    }

    return decryptedPayloads
  }

  private async decryptEncrypted(): Promise<PurePayload[]> {
    if (!this.password) {
      throw Error('Attempting to decrypt encrypted file with no password')
    }

    const rootKey = await this.protocolService.computeRootKey(this.password, this.keyParams!)
    const itemsKeysPayloads = this.inPayloads.filter((payload) => {
      return payload.content_type === ContentType.ItemsKey
    })

    const decryptedItemsKeysPayloads = await this.protocolService.payloadsByDecryptingPayloads(
      itemsKeysPayloads,
      rootKey,
    )

    const results: PurePayload[] = []
    extendArray(results, decryptedItemsKeysPayloads)

    const decryptedPayloads = await this.decryptWithItemsKeys(
      decryptedItemsKeysPayloads.map((p) => CreateItemFromPayload(p) as SNItemsKey),
      rootKey,
    )
    extendArray(results, decryptedPayloads)

    return results
  }
}
