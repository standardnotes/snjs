import { CreateItemFromPayload } from '@Models/generator';
import { ApplicationStage } from './../stages';
import { PayloadField } from './../protocol/payloads/fields';
import { StorageKey } from '@Lib/storage_keys';
import { RawPayload, CreateMaxPayloadFromAnyObject } from '@Payloads/generator';
import { KeyRecoveryStrings } from './api/messages';
import { SNStorageService, StorageValueModes } from './storage_service';
import { SNRootKeyParams } from './../protocol/key_params';
import { SNSessionManager } from './api/session_manager';
import { PayloadManager } from './model_manager';
import { Challenge, ChallengeType, ChallengeReason } from './../challenges';
import { SNAlertService } from './alert_service';
import { ChallengeService } from './challenge/challenge_service';
import { SNRootKey } from '@Protocol/root_key';
import { SNProtocolService } from '@Lib/services/protocol_service';
import { SNApiService } from '@Lib/services/api/api_service';
import { SNItemsKey } from './../models/app/items_key';
import { ContentType } from './../models/content_types';
import { ItemManager } from './item_manager';
import { PureService } from '@Services/pure_service';
import { dateSorted, findInArray } from '@Lib/utils';
import { isNull } from 'lodash';
import { KeyParamsFromApiResponse } from '@Lib/protocol/key_params';
import { leftVersionGreaterThanOrEqualToRight } from '@Lib/protocol/versions';
import { PayloadSource } from '@Lib/protocol/payloads';
import { UuidString } from '@Lib/types';

/**
 * The key recovery service listens to items key changes to detect any that cannot be decrypted.
 * If it detects an items key that is not properly decrypted, it will present a key recovery
 * wizard (using existing UI like Challenges and AlertService) that will attempt to recover
 * the root key for those keys.
 *
 * When we encounter an items key we cannot decrypt, this is a sign that the user's password may
 * have recently changed (even though their session is still valid). If the user has been
 * previously signed in, we take this opportunity to reach out to the server to get the
 * user's current key_params. We ensure these key params' version is equal to or greater than our own.

 * - If this key's key params are equal to the retrieved parameters,
    and this keys created date is greater than any existing valid items key,
    or if we do not have any items keys:
       1. Use the decryption of this key as a source of validation
       2. If valid, replace our local root key with this new root key and emit the decrypted items key
 * - Else, if the key params are not equal,
     or its created date is less than an existing valid items key
        1. Attempt to decrypt this key using its attached key paramas
        2. If valid, emit decrypted items key. DO NOT replace local root key.
 * - If by the end we did not find an items key with matching key params to the retrieved
     key params, AND the retrieved key params are newer than what we have locally, we must
     issue a sign in request to the server.

 * If the user is not signed in and we detect an undecryptable items key, we present a detached
 * recovery wizard that doesn't affect our local root key.
 *
 * When an items key is emitted, protocol service will automatically try to decrypt any
 * related items that are in an errored state.
 *
 * In the item observer, `ignored` items represent items who have encrypted overwrite
 * protection enabled (only items keys). This means that if the incoming payload is errored,
 * but our current copy is not, we will ignore the incoming value until we can properly
 * decrypt it.
 */

type UndecryptableItemsStorage = Record<UuidString, RawPayload>;

export class SNKeyRecoveryService extends PureService {
  private removeItemObserver: any

  constructor(
    private itemManager: ItemManager,
    private modelManager: PayloadManager,
    private apiService: SNApiService,
    private sessionManager: SNSessionManager,
    private protocolService: SNProtocolService,
    private challengeService: ChallengeService,
    private alertService: SNAlertService,
    private storageService: SNStorageService
  ) {
    super();
    this.removeItemObserver = this.itemManager.addObserver(
      [ContentType.ItemsKey],
      (changed, inserted, _discarded, ignored) => {
        const changedOrInserted = changed.concat(inserted).filter(k => k.errorDecrypting) as SNItemsKey[];
        if (changedOrInserted.length > 0) {
          this.handleUndecryptableItemsKeys(changedOrInserted);
        }
        if (ignored.length > 0) {
          this.handleIgnoredItemsKeys(ignored as SNItemsKey[]);
        }
      }
    );
  }

  public deinit() {
    (this.itemManager as any) = undefined;
    (this.modelManager as any) = undefined;
    (this.apiService as any) = undefined;
    (this.sessionManager as any) = undefined;
    (this.protocolService as any) = undefined;
    (this.challengeService as any) = undefined;
    (this.alertService as any) = undefined;
    this.removeItemObserver();
    this.removeItemObserver = undefined;
    super.deinit();
  }

  async handleApplicationStage(stage: ApplicationStage) {
    super.handleApplicationStage(stage);
    if (stage === ApplicationStage.LoadedDatabase_12) {
      this.processPersistedUndecryptables();
    }
  }

  /**
   * Ignored items keys are items keys which arrived from a remote source, which we were
   * not able to decrypt, and for which we already had an existing items key that was
   * properly decrypted. Since items keys key contents are immutable, if we already have a
   * successfully decrypted version, yet we can't decrypt the new version, we should should
   * temporarily ignore the new version until we can properly decrypt it (through the recovery flow),
   * and not overwrite the local copy.
   *
   * Ignored items are persisted to disk in isolated storage so that they may be decrypted
   * whenever. When they are finally decryptable, we will emit them and update our database
   * with the new decrypted value.
   *
   * When the app first launches, we will query the isolated storage to see if there are any
   * keys we need to decrypt.
   */
  async handleIgnoredItemsKeys(keys: SNItemsKey[], persistIncoming = true) {
    /**
     * Persist the keys locally in isolated storage, so that if we don't properly decrypt
     * them in this app session, the user has a chance to later. If there already exists
     * the same items key in this storage, replace it with this latest incoming value.
     */
    if (persistIncoming) {
      await this.saveToUndecryptables(keys);
    }

    /** Try decrypting the keys now */
    for (const key of keys) {
      const result = await this.tryDecryptingKey(key);
      if (result.success) {
        /** If it succeeds, remove the key from isolated storage. */
        await this.removeFromUndecryptables(key);
      }
    }
  }

  private async processPersistedUndecryptables() {
    const record = await this.getUndecryptables();
    const rawPayloads = Object.values(record);
    if (rawPayloads.length === 0) {
      return;
    }
    const keys = rawPayloads
      .map(raw => CreateMaxPayloadFromAnyObject(raw))
      .map(p => CreateItemFromPayload(p)) as SNItemsKey[];

    return this.handleIgnoredItemsKeys(keys, false);
  }

  private async getUndecryptables() {
    return this.storageService.getValue(
      StorageKey.KeyRecoveryUndecryptableItems,
      StorageValueModes.Default,
      {}
    ) as Promise<UndecryptableItemsStorage>;
  }

  private async persistUndecryptables(record: UndecryptableItemsStorage) {
    await this.storageService.setValue(
      StorageKey.KeyRecoveryUndecryptableItems,
      record
    );
  }

  private async saveToUndecryptables(keys: SNItemsKey[]) {
    /** Get the current persisted value */
    const record = await this.getUndecryptables();
    /** Persist incoming keys */
    for (const key of keys) {
      record[key.uuid] = key.payload.ejected();
    }
    await this.persistUndecryptables(record);
  }

  private async removeFromUndecryptables(key: SNItemsKey) {
    /** Get the current persisted value */
    const record = await this.getUndecryptables();
    delete record[key.uuid];
    await this.persistUndecryptables(record);
  }

  async handleUndecryptableItemsKeys(keys: SNItemsKey[]) {
    /** Get the latest items key we _can_ decrypt */
    const latest = dateSorted(
      this.itemManager.nonErroredItemsForContentType(ContentType.ItemsKey) as SNItemsKey[],
      'created_at',
      false
    )[0];

    const hasLocalItemsKey = !isNull(latest);

    /** Get our own account params */
    const clientParams = await this.protocolService.getAccountKeyParams();
    if (!clientParams) {
      /** The user is not signed in. Present a detached recovery wizard per key and return */
      await this.tryDecryptingKeys(keys);
      return;
    }

    /** Get the user's latest key params from the server */
    const paramsResponse = await this.apiService.getAccountKeyParams(
      clientParams.identifier
    );
    /**
     * If we do not get a response here, it means we can't authenticate with the server
     * and have no way of knowing if any key's key params are the latest. We can only
     * perform detached decryption.
     */
    if (paramsResponse.error) {
      await this.tryDecryptingKeys(keys);
      return;
    }

    const serverParams = KeyParamsFromApiResponse(paramsResponse);

    /** Compare with our own */
    const serverKeyParamsAreSafe = leftVersionGreaterThanOrEqualToRight(
      serverParams.version,
      clientParams.version
    );
    let serverParamsDifferFromClients = !serverParams.compare(clientParams);

    for (const erroredKey of keys) {
      const isNewerThanLatest = erroredKey.created_at > latest?.created_at;
      const keyParams = await this.protocolService.getKeyEmbeddedKeyParams(erroredKey);
      const matchesServerParams = keyParams?.compare(serverParams);
      const replacesRootKey =
        matchesServerParams &&
        serverKeyParamsAreSafe &&
        (!hasLocalItemsKey || isNewerThanLatest);
      if (replacesRootKey) {
        const result = await this.tryDecryptingKey(erroredKey);
        if (result.success) {
          serverParamsDifferFromClients = false;
          /** Replace our root key with the generated root key */
          await this.replaceClientRootKey(result.rootKey!);
        }
      } else {
        await this.tryDecryptingKeys([erroredKey]);
      }
    }

    if (serverKeyParamsAreSafe && serverParamsDifferFromClients) {
      /**
       * The only way left to validate our password is to sign in with the server,
       * creating an all new session.
       */
      this.performServerSignIn(serverParams);
    }
  }

  async performServerSignIn(keyParams: SNRootKeyParams): Promise<void> {
    /** Get the user's account password */
    const challenge = new Challenge(
      [ChallengeType.Custom],
      ChallengeReason.Custom,
      KeyRecoveryStrings.KeyRecoveryLoginFlowPrompt(keyParams),
      KeyRecoveryStrings.KeyRecoveryLoginFlowReason,
    );
    const challengeResponse = await this.challengeService
      .promptForChallengeResponseWithCustomValidation(challenge);
    const password = challengeResponse[0]?.value as string;
    if (!password) {
      return;
    }
    /** Generate a root key using the input */
    const rootKey = await this.protocolService.computeRootKey(
      password,
      keyParams
    );
    const signInResponse = await this.sessionManager.signInWithServerPassword(
      keyParams.identifier,
      rootKey.serverPassword
    );
    if (!signInResponse.error) {
      await this.replaceClientRootKey(rootKey);
    } else {
      await this.alertService.alert(
        KeyRecoveryStrings.KeyRecoveryLoginFlowInvalidPassword
      );
      return this.performServerSignIn(keyParams);
    }
  }

  /**
   * When we've successfully validated a root key that matches server params,
   * we replace our current client root key with the newly generated key
   */
  async replaceClientRootKey(rootKey: SNRootKey): Promise<void> {
    const wrappingKey = await this.getWrappingKeyIfApplicable();
    await this.protocolService.setNewRootKey(
      rootKey,
      wrappingKey
    )
    this.alertService.alert(
      KeyRecoveryStrings.KeyRecoveryRootKeyReplaced
    );
  }

  async getWrappingKeyIfApplicable(): Promise<SNRootKey | undefined> {
    if (!this.protocolService.hasPasscode()) {
      return undefined;
    }
    const result = await this.challengeService.promptForPasscode();
    if (result.canceled) {
      /** Show an alert saying they must enter the correct passcode to update
       * their root key, and try again */
      await this.alertService.alert(
        KeyRecoveryStrings.KeyRecoveryPasscodeRequiredText,
        KeyRecoveryStrings.KeyRecoveryPasscodeRequiredTitle
      );
      return this.getWrappingKeyIfApplicable();
    }
    return this.protocolService!.computeWrappingKey(result.passcode!);
  }

  /** A detached recovery does not affect our local items key */
  async tryDecryptingKeys(keys: SNItemsKey[]) {
    for (const key of keys) {
      await this.tryDecryptingKey(key);
    }
  }

  /**
   * If this function succeeds, it will emit the items key, and
   * return the decrypted key payload, as well as the root key used to decrypt the key.
   * If it fails, it will keep trying until the user aborts.
   */
  async tryDecryptingKey(key: SNItemsKey): Promise<{
    rootKey?: SNRootKey
    success: boolean
  }> {
    /** Prompt the user for their account password using the key's attached key params */
    const keyParams = await this.protocolService.getKeyEmbeddedKeyParams(key);
    if (!keyParams) {
      return { success: false };
    }
    const challenge = new Challenge(
      [ChallengeType.Custom],
      ChallengeReason.Custom,
      KeyRecoveryStrings.KeyRecoveryLoginFlowPrompt(keyParams),
      KeyRecoveryStrings.KeyRecoveryPasswordRequired
    );
    const response = await this.challengeService
      .promptForChallengeResponseWithCustomValidation(challenge);
    const password = response[0]?.value as string;
    if (!password) {
      return { success: false };
    }
    /** Generate a root key using the input */
    const rootKey = await this.protocolService.computeRootKey(
      password,
      keyParams
    );
    /** Attempt to decrypt this items key using the root key */
    const decryptedPayload = await this.protocolService.payloadByDecryptingPayload(
      key.payload,
      rootKey
    );
    /** If it succeeds, re-emit this items key */
    if (!decryptedPayload.errorDecrypting) {
      this.modelManager.emitPayload(
        decryptedPayload,
        PayloadSource.DecryptedTransient
      );
      await this.storageService.savePayload(decryptedPayload);
      this.alertService.alert(
        KeyRecoveryStrings.KeyRecoveryKeyRecovered
      );
      return { success: true, rootKey }
    } else {
      this.alertService.alert(
        KeyRecoveryStrings.KeyRecoveryUnableToRecover
      );
      /** If it fails, try again */
      return this.tryDecryptingKey(key);
    }
  }
}
