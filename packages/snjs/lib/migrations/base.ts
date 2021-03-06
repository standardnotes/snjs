import { SNLog } from '@Lib/log';
import { ContentTypeUsesRootKeyEncryption } from '@Lib/protocol/intents';
import { CreateMaxPayloadFromAnyObject } from '@Payloads/generator';
import { ChallengeReason, ChallengeValidation } from './../challenges';
import {
  KeychainRecoveryStrings,
  SessionStrings,
} from './../services/api/messages';
import { Challenge, ChallengePrompt } from '@Lib/challenges';
import {
  PreviousSnjsVersion1_0_0,
  PreviousSnjsVersion2_0_0,
  SnjsVersion,
} from './../version';
import { Migration } from '@Lib/migrations/migration';
import { RawStorageKey, namespacedKey } from '@Lib/storage_keys';
import { ApplicationStage } from '@Lib/stages';
import { isNullOrUndefined } from '@Lib/utils';
import { CreateReader } from './readers/functions';
import { StorageReader } from './readers/reader';

/** A key that was briefly present in Snjs version 2.0.0 but removed in 2.0.1 */
const LastMigrationTimeStampKey2_0_0 = 'last_migration_timestamp';

/**
 * The base migration always runs during app initialization. It is meant as a way
 * to set up all other migrations.
 */
export class BaseMigration extends Migration {
  private reader?: StorageReader;
  private didPreRun = false;

  public async preRun() {
    await this.storeVersionNumber();
    this.didPreRun = true;
  }

  protected registerStageHandlers() {
    this.registerStageHandler(
      ApplicationStage.PreparingForLaunch_0,
      async () => {
        if (await this.needsKeychainRepair()) {
          await this.repairMissingKeychain();
        }
        this.markDone();
      }
    );
  }

  private getStoredVersion() {
    const storageKey = namespacedKey(
      this.services.identifier,
      RawStorageKey.SnjsVersion
    );
    return this.services.deviceInterface.getRawStorageValue(storageKey);
  }

  /**
   * In Snjs 1.x, and Snjs 2.0.0, version numbers were not stored (as they were introduced
   * in 2.0.1). Because migrations can now rely on this value, we want to establish a base
   * value if we do not find it in storage.
   */
  private async storeVersionNumber() {
    const storageKey = namespacedKey(
      this.services.identifier,
      RawStorageKey.SnjsVersion
    );
    const version = await this.getStoredVersion();
    if (!version) {
      /** Determine if we are 1.0.0 or 2.0.0 */
      /** If any of these keys exist in raw storage, we are coming from a 1.x architecture */
      const possibleLegacyKeys = [
        'migrations',
        'ephemeral',
        'user',
        'cachedThemes',
        'syncToken',
        'encryptedStorage',
      ];
      let hasLegacyValue = false;
      for (const legacyKey of possibleLegacyKeys) {
        const value = await this.services.deviceInterface.getRawStorageValue(
          legacyKey
        );
        if (value) {
          hasLegacyValue = true;
          break;
        }
      }
      if (hasLegacyValue) {
        /** Coming from 1.0.0 */
        await this.services.deviceInterface.setRawStorageValue(
          storageKey,
          PreviousSnjsVersion1_0_0
        );
      } else {
        /** Coming from 2.0.0 (which did not store version) OR is brand new application */
        const migrationKey = namespacedKey(
          this.services!.identifier,
          LastMigrationTimeStampKey2_0_0
        );
        const migrationValue = await this.services.deviceInterface.getRawStorageValue(
          migrationKey
        );
        const is_2_0_0_application = !isNullOrUndefined(migrationValue);
        if (is_2_0_0_application) {
          await this.services.deviceInterface.setRawStorageValue(
            storageKey,
            PreviousSnjsVersion2_0_0
          );
          await this.services.deviceInterface.removeRawStorageValue(
            LastMigrationTimeStampKey2_0_0
          );
        } else {
          /** Is new application, use current version as not to run any migrations */
          await this.services.deviceInterface.setRawStorageValue(
            storageKey,
            SnjsVersion
          );
        }
      }
    }
  }

  private async loadReader() {
    if (this.reader) {
      return;
    }
    const version = (await this.getStoredVersion())!;
    this.reader = CreateReader(
      version,
      this.services.deviceInterface,
      this.services.identifier,
      this.services.environment
    );
  }

  /**
   * If the keychain is empty, and the user does not have a passcode,
   * AND there appear to be stored account key params, this indicates
   * a launch where the keychain was wiped due to restoring device
   * from cloud backup which did not include keychain. This typically occurs
   * on mobile when restoring from iCloud, but we'll also follow this same behavior
   * on desktop/web as well, since we recently introduced keychain to desktop.
   *
   * We must prompt user for account password, and validate based on ability to decrypt
   * an item. We cannot validate based on storage because 1.x mobile applications did
   * not use encrypted storage, although we did on 2.x. But instead of having two methods
   * of validations best to use one that works on both.
   *
   * The item is randomly chosen, but for 2.x applications, it must be an items key item
   * (since only item keys are encrypted directly with account password)
   */

  public async needsKeychainRepair() {
    if (!this.didPreRun) {
      throw Error('Attempting to access specialized function before prerun');
    }
    if (!this.reader) {
      await this.loadReader();
    }

    const usesKeychain = this.reader!.usesKeychain;
    if (!usesKeychain) {
      /** Doesn't apply if this version did not use a keychain to begin with */
      return false;
    }

    const rawAccountParams = await this.reader!.getAccountKeyParams();
    const hasAccountKeyParams = !isNullOrUndefined(rawAccountParams);
    if (!hasAccountKeyParams) {
      /** Doesn't apply if account is not involved */
      return false;
    }

    const hasPasscode = await this.reader!.hasPasscode();
    if (hasPasscode) {
      /** Doesn't apply if using passcode, as keychain would be bypassed in that case */
      return false;
    }

    const accountKeysMissing = !(await this.reader!.hasNonWrappedAccountKeys());
    if (!accountKeysMissing) {
      return false;
    }

    return true;
  }

  private async repairMissingKeychain() {
    const version = (await this.getStoredVersion())!;
    const rawAccountParams = await this.reader!.getAccountKeyParams();
    /** Challenge for account password */
    const challenge = new Challenge(
      [
        new ChallengePrompt(
          ChallengeValidation.None,
          undefined,
          SessionStrings.PasswordInputPlaceholder,
          true
        ),
      ],
      ChallengeReason.Custom,
      false,
      KeychainRecoveryStrings.Title,
      KeychainRecoveryStrings.Text
    );
    return new Promise((resolve) => {
      this.services.challengeService.addChallengeObserver(challenge, {
        onNonvalidatedSubmit: async (challengeResponse) => {
          const password = challengeResponse.values[0].value as string;
          const accountParams = this.services.protocolService.createKeyParams(
            rawAccountParams as any
          );
          const rootKey = await this.services.protocolService.computeRootKey(
            password,
            accountParams
          );
          /** Choose an item to decrypt */
          const allItems = (await this.services.deviceInterface.getAllRawDatabasePayloads(
            this.services.identifier
          )) as any[];
          let itemToDecrypt = allItems.find((item) => {
            const payload = CreateMaxPayloadFromAnyObject(item);
            return ContentTypeUsesRootKeyEncryption(payload.content_type);
          });
          if (!itemToDecrypt) {
            /** If no root key encrypted item, just choose any item */
            itemToDecrypt = allItems[0];
          }
          if (!itemToDecrypt) {
            throw SNLog.error(
              Error(
                'Attempting keychain recovery validation but no items present.'
              )
            );
          }
          const decryptedItem = await this.services.protocolService.payloadByDecryptingPayload(
            CreateMaxPayloadFromAnyObject(itemToDecrypt),
            rootKey
          );
          if (decryptedItem.errorDecrypting) {
            /** Wrong password, try again */
            this.services.challengeService.setValidationStatusForChallenge(
              challenge,
              challengeResponse!.values[0],
              false
            );
          } else {
            /**
             * If decryption succeeds, store the generated account key where it is expected,
             * either in top-level keychain in 1.0.0, and namespaced location in 2.0.0+.
             */
            if (version === PreviousSnjsVersion1_0_0) {
              /** Store in top level keychain */
              await this.services.deviceInterface.legacy_setRawKeychainValue({
                mk: rootKey.masterKey,
                ak: rootKey.dataAuthenticationKey,
                version: accountParams.version,
              });
            } else {
              /** Store in namespaced location */
              const rawKey = rootKey.getKeychainValue();
              await this.services.deviceInterface.setNamespacedKeychainValue(
                rawKey,
                this.services.identifier
              );
            }
            resolve();
            this.services.challengeService.completeChallenge(challenge);
          }
        },
      });
      this.services.challengeService.promptForChallengeResponse(challenge);
    });
  }
}
