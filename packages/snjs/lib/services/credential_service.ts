import { SNProtectionService } from './protection_service';
import { Uuid } from '@Lib/uuid';
import {
  Challenge,
  ChallengeReason,
  ChallengeValidation,
} from './../challenges';
import { ChallengePrompt } from '@Lib/challenges';
import { SNRootKey } from '@Protocol/root_key';
import { SNAlertService } from '@Services/alert_service';
import {
  KeyParamsOrigination,
  SNRootKeyParams,
} from './../protocol/key_params';
import {
  CredentialsChangeStrings,
  INVALID_PASSWORD,
  InsufficientPasswordMessage,
  ChallengeStrings,
  DO_NOT_CLOSE_APPLICATION,
  UPGRADING_ENCRYPTION,
  SETTING_PASSCODE,
  REMOVING_PASSCODE,
  CHANGING_PASSCODE,
  ProtocolUpgradeStrings,
} from './api/messages';
import { HttpResponse, SignInResponse, User } from './api/responses';
import { SNProtocolService } from '@Lib/services/protocol_service';
import { ItemManager } from '@Services/item_manager';
import {
  SNStorageService,
  StoragePersistencePolicies,
} from '@Services/storage_service';
import { SNSyncService } from './sync/sync_service';
import {
  SNSessionManager,
  MINIMUM_PASSWORD_LENGTH,
} from './api/session_manager';
import { PureService } from '@Services/pure_service';
import { ChallengeService } from './challenge/challenge_service';
import { SNItemsKey } from '@Lib/models';

const MINIMUM_PASSCODE_LENGTH = 1;

export type CredentialsChangeFunctionResponse = { error?: { message: string } };
export type AccountServiceResponse = HttpResponse;

export const enum AccountEvent {
  SignedInOrRegistered = 'SignedInOrRegistered',
}

export class SNCredentialService extends PureService<AccountEvent> {
  private signingIn = false;
  private registering = false;

  constructor(
    private sessionManager: SNSessionManager,
    private syncService: SNSyncService,
    private storageService: SNStorageService,
    private itemManager: ItemManager,
    private protocolService: SNProtocolService,
    private alertService: SNAlertService,
    private challengeService: ChallengeService,
    private protectionService: SNProtectionService
  ) {
    super();
  }

  public deinit(): void {
    super.deinit();
    (this.sessionManager as unknown) = undefined;
    (this.syncService as unknown) = undefined;
    (this.storageService as unknown) = undefined;
    (this.itemManager as unknown) = undefined;
    (this.protocolService as unknown) = undefined;
    (this.alertService as unknown) = undefined;
    (this.challengeService as unknown) = undefined;
    (this.protectionService as unknown) = undefined;
  }

  /**
   *  @param mergeLocal  Whether to merge existing offline data into account. If false,
   *                     any pre-existing data will be fully deleted upon success.
   */
  public async register(
    email: string,
    password: string,
    ephemeral = false,
    mergeLocal = true
  ): Promise<AccountServiceResponse> {
    if (this.protocolService.hasAccount()) {
      throw Error('Tried to register when an account already exists.');
    }
    if (this.registering) {
      throw Error('Already registering.');
    }
    this.registering = true;
    try {
      this.lockSyncing();
      const result = await this.sessionManager.register(
        email,
        password,
        ephemeral
      );
      if (!result.response.error) {
        this.syncService.resetSyncState();
        await this.storageService.setPersistencePolicy(
          ephemeral
            ? StoragePersistencePolicies.Ephemeral
            : StoragePersistencePolicies.Default
        );
        if (mergeLocal) {
          await this.syncService.markAllItemsAsNeedingSync();
        } else {
          this.itemManager.removeAllItemsFromMemory();
          await this.clearDatabase();
        }
        await this.notifyEvent(AccountEvent.SignedInOrRegistered);
        this.unlockSyncing();
        await this.syncService.downloadFirstSync(300);
        this.protocolService.decryptErroredItems();
      } else {
        this.unlockSyncing();
      }
      return result.response;
    } finally {
      this.registering = false;
    }
  }

  /**
   * @param mergeLocal  Whether to merge existing offline data into account.
   * If false, any pre-existing data will be fully deleted upon success.
   */
  public async signIn(
    email: string,
    password: string,
    strict = false,
    ephemeral = false,
    mergeLocal = true,
    awaitSync = false
  ): Promise<AccountServiceResponse> {
    if (this.protocolService.hasAccount()) {
      throw Error('Tried to sign in when an account already exists.');
    }
    if (this.signingIn) {
      throw Error('Already signing in.');
    }
    this.signingIn = true;
    try {
      /** Prevent a timed sync from occuring while signing in. */
      this.lockSyncing();
      const result = await this.sessionManager.signIn(
        email,
        password,
        strict,
        ephemeral
      );
      if (!result.response.error) {
        this.syncService.resetSyncState();
        await this.storageService.setPersistencePolicy(
          ephemeral
            ? StoragePersistencePolicies.Ephemeral
            : StoragePersistencePolicies.Default
        );
        if (mergeLocal) {
          await this.syncService.markAllItemsAsNeedingSync();
        } else {
          void this.itemManager.removeAllItemsFromMemory();
          await this.clearDatabase();
        }
        await this.notifyEvent(AccountEvent.SignedInOrRegistered);
        this.unlockSyncing();
        const syncPromise = this.syncService
          .downloadFirstSync(1_000, {
            checkIntegrity: true,
            awaitAll: awaitSync,
          })
          .then(() => {
            if (!awaitSync) {
              this.protocolService.decryptErroredItems();
            }
          });
        if (awaitSync) {
          await syncPromise;
          await this.protocolService.decryptErroredItems();
        }
      } else {
        this.unlockSyncing();
      }
      return result.response;
    } finally {
      this.signingIn = false;
    }
  }

  /**
   * A sign in request that occurs while the user was previously signed in, to correct
   * for missing keys or storage values. Unlike regular sign in, this doesn't worry about
   * performing one of marking all items as needing sync or deleting all local data.
   */
  public async correctiveSignIn(rootKey: SNRootKey): Promise<HttpResponse | SignInResponse> {
    this.lockSyncing();
    const response = await this.sessionManager.bypassChecksAndSignInWithRootKey(
      rootKey.keyParams.identifier,
      rootKey
    );
    if (!response.error) {
      await this.notifyEvent(AccountEvent.SignedInOrRegistered);
      this.unlockSyncing();
      void this.syncService.downloadFirstSync(1_000, {
        checkIntegrity: true,
      });
      void this.protocolService.decryptErroredItems();
    }
    this.unlockSyncing();
    return response;
  }

  /**
   * @param passcode - Changing the account password or email requires the local
   * passcode if configured (to rewrap the account key with passcode). If the passcode
   * is not passed in, the user will be prompted for the passcode. However if the consumer
   * already has reference to the passcode, they can pass it in here so that the user
   * is not prompted again.
   */
  public async changeCredentials(
    parameters: {
      currentPassword: string,
      origination: KeyParamsOrigination,
      validateNewPasswordStrength: boolean
      newEmail?: string,
      newPassword?: string,
      passcode?: string,
    }
  ): Promise<CredentialsChangeFunctionResponse> {
    const result = await this.performCredentialsChange(parameters);
    if (result.error) {
      void this.alertService.alert(result.error.message);
    }
    return result;
  }

  public async signOut(): Promise<void> {
    await this.sessionManager.signOut();
    await this.protocolService.clearLocalKeyState();
    await this.storageService.clearAllData();
  }

  public async performProtocolUpgrade(): Promise<{
    success?: true;
    canceled?: true;
    error?: { message: string };
  }> {
    const hasPasscode = this.protocolService.hasPasscode();
    const hasAccount = this.protocolService.hasAccount();
    const prompts = [];
    if (hasPasscode) {
      prompts.push(
        new ChallengePrompt(
          ChallengeValidation.LocalPasscode,
          undefined,
          ChallengeStrings.LocalPasscodePlaceholder
        )
      );
    }
    if (hasAccount) {
      prompts.push(
        new ChallengePrompt(
          ChallengeValidation.AccountPassword,
          undefined,
          ChallengeStrings.AccountPasswordPlaceholder
        )
      );
    }
    const challenge = new Challenge(
      prompts,
      ChallengeReason.ProtocolUpgrade,
      true
    );
    const response = await this.challengeService.promptForChallengeResponse(
      challenge
    );
    if (!response) {
      return { canceled: true };
    }
    const dismissBlockingDialog = await this.alertService.blockingDialog(
      DO_NOT_CLOSE_APPLICATION,
      UPGRADING_ENCRYPTION
    );
    try {
      let passcode: string | undefined;
      if (hasPasscode) {
        /* Upgrade passcode version */
        const value = response.getValueForType(
          ChallengeValidation.LocalPasscode
        );
        passcode = value.value as string;
      }
      if (hasAccount) {
        /* Upgrade account version */
        const value = response.getValueForType(
          ChallengeValidation.AccountPassword
        );
        const password = value.value as string;
        const changeResponse = await this.changeCredentials({
          currentPassword: password,
          newPassword: password,
          passcode,
          origination: KeyParamsOrigination.ProtocolUpgrade,
          validateNewPasswordStrength: false
        });
        if (changeResponse?.error) {
          return { error: changeResponse.error };
        }
      }
      if (hasPasscode) {
        /* Upgrade passcode version */
        await this.removePasscodeWithoutWarning();
        await this.setPasscodeWithoutWarning(
          passcode as string,
          KeyParamsOrigination.ProtocolUpgrade
        );
      }
      return { success: true };
    } catch (error) {
      return { error };
    } finally {
      dismissBlockingDialog();
    }
  }

  public async addPasscode(passcode: string): Promise<boolean> {
    if (passcode.length < MINIMUM_PASSCODE_LENGTH) {
      return false;
    }
    if (!(await this.protectionService.authorizeAddingPasscode())) {
      return false;
    }

    const dismissBlockingDialog = await this.alertService.blockingDialog(
      DO_NOT_CLOSE_APPLICATION,
      SETTING_PASSCODE
    );
    try {
      await this.setPasscodeWithoutWarning(
        passcode,
        KeyParamsOrigination.PasscodeCreate
      );
      return true;
    } finally {
      dismissBlockingDialog();
    }
  }

  public async removePasscode(): Promise<boolean> {
    if (!(await this.protectionService.authorizeRemovingPasscode())) {
      return false;
    }

    const dismissBlockingDialog = await this.alertService.blockingDialog(
      DO_NOT_CLOSE_APPLICATION,
      REMOVING_PASSCODE
    );
    try {
      await this.removePasscodeWithoutWarning();
      return true;
    } finally {
      dismissBlockingDialog();
    }
  }

  /**
   * @returns whether the passcode was successfuly changed or not
   */
  public async changePasscode(
    newPasscode: string,
    origination = KeyParamsOrigination.PasscodeChange
  ): Promise<boolean> {
    if (newPasscode.length < MINIMUM_PASSCODE_LENGTH) {
      return false;
    }
    if (!(await this.protectionService.authorizeChangingPasscode())) {
      return false;
    }

    const dismissBlockingDialog = await this.alertService.blockingDialog(
      DO_NOT_CLOSE_APPLICATION,
      origination === KeyParamsOrigination.ProtocolUpgrade
        ? ProtocolUpgradeStrings.UpgradingPasscode
        : CHANGING_PASSCODE
    );
    try {
      await this.removePasscodeWithoutWarning();
      await this.setPasscodeWithoutWarning(newPasscode, origination);
      return true;
    } finally {
      dismissBlockingDialog();
    }
  }

  private async setPasscodeWithoutWarning(
    passcode: string,
    origination: KeyParamsOrigination
  ) {
    const identifier = await Uuid.GenerateUuid();
    const key = await this.protocolService.createRootKey(
      identifier,
      passcode,
      origination
    );
    await this.protocolService.setNewRootKeyWrapper(key);
    await this.rewriteItemsKeys();
    await this.syncService.sync();
  }

  private async removePasscodeWithoutWarning() {
    await this.protocolService.removeRootKeyWrapper();
    await this.rewriteItemsKeys();
  }

  /**
   * Allows items keys to be rewritten to local db on local credential status change,
   * such as if passcode is added, changed, or removed.
   * This allows IndexedDB unencrypted logs to be deleted
   * `deletePayloads` will remove data from backing store,
   * but not from working memory See:
   * https://github.com/standardnotes/desktop/issues/131
   */
  private async rewriteItemsKeys() {
    const itemsKeys = this.itemManager.itemsKeys();
    const payloads = itemsKeys.map((key) => key.payloadRepresentation());
    await this.storageService.deletePayloads(payloads);
    await this.syncService.persistPayloads(payloads);
  }

  private lockSyncing(): void {
    this.syncService.lockSyncing();
  }

  private unlockSyncing(): void {
    this.syncService.unlockSyncing();
  }

  private async clearDatabase(): Promise<void> {
    return this.storageService.clearAllPayloads();
  }

  private async performCredentialsChange(
    parameters: {
      currentPassword: string,
      origination: KeyParamsOrigination,
      validateNewPasswordStrength: boolean
      newEmail?: string,
      newPassword?: string,
      passcode?: string,
    }
  ): Promise<CredentialsChangeFunctionResponse> {
    const {
      wrappingKey,
      canceled,
    } = await this.challengeService.getWrappingKeyIfApplicable(parameters.passcode);
    if (canceled) {
      return { error: Error(CredentialsChangeStrings.PasscodeRequired) };
    }
    if (parameters.newPassword !== undefined && parameters.validateNewPasswordStrength) {
      if (parameters.newPassword.length < MINIMUM_PASSWORD_LENGTH) {
        return {
          error: Error(InsufficientPasswordMessage(MINIMUM_PASSWORD_LENGTH)),
        };
      }
    }
    const accountPasswordValidation = await this.protocolService.validateAccountPassword(
      parameters.currentPassword
    );
    if (!accountPasswordValidation.valid) {
      return {
        error: Error(INVALID_PASSWORD),
      };
    }
    const user = this.sessionManager.getUser() as User;
    const currentEmail = user.email;
    const rootKeys = await this.recomputeRootKeysForCredentialChange({
      currentPassword: parameters.currentPassword,
      currentEmail,
      origination: parameters.origination,
      newEmail: parameters.newEmail,
      newPassword: parameters.newPassword,
    });

    this.lockSyncing();
    /** Now, change the credentials on the server. Roll back on failure */
    const result = await this.sessionManager.changeCredentials({
      currentServerPassword: rootKeys.currentRootKey.serverPassword as string,
      newRootKey: rootKeys.newRootKey,
      wrappingKey,
      newEmail: parameters.newEmail,
    });
    this.unlockSyncing();
    if (!result.response.error) {
      const rollback = await this.protocolService.createNewItemsKeyWithRollback();
      await this.protocolService.reencryptItemsKeys();
      await this.syncService.sync({ awaitAll: true });
      const defaultItemsKey = this.protocolService.getDefaultItemsKey() as SNItemsKey;
      const itemsKeyWasSynced = !defaultItemsKey.neverSynced;
      if (!itemsKeyWasSynced) {
        const emailShouldBeRolledBack = parameters.newEmail !== undefined && parameters.newEmail !== currentEmail;
        await this.sessionManager.changeCredentials({
          currentServerPassword: rootKeys.newRootKey.serverPassword as string,
          newRootKey: rootKeys.currentRootKey,
          wrappingKey,
          newEmail: emailShouldBeRolledBack ? currentEmail : undefined
        });
        await this.protocolService.reencryptItemsKeys();
        await rollback();
        await this.syncService.sync({ awaitAll: true });

        return { error: Error(CredentialsChangeStrings.Failed) };
      }
    }

    return result.response;
  }

  private async recomputeRootKeysForCredentialChange(parameters: {
    currentPassword: string,
    currentEmail: string,
    origination: KeyParamsOrigination,
    newEmail?: string,
    newPassword?: string,
  }): Promise<{currentRootKey: SNRootKey, newRootKey: SNRootKey}> {
    const currentRootKey = await this.protocolService.computeRootKey(
      parameters.currentPassword,
      (await this.protocolService.getRootKeyParams()) as SNRootKeyParams
    );
    const newRootKey = await this.protocolService.createRootKey(
      parameters.newEmail ?? parameters.currentEmail,
      parameters.newPassword ?? parameters.currentPassword,
      parameters.origination
    );

    return {
      currentRootKey,
      newRootKey,
    };
  }
}
