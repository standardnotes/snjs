import { FillItemContent } from '@Models/functions';
import { SNSessionManager } from './api/session_manager';
import { SNStorageService } from '@Services/storage_service';
import { SNProtocolService } from './protocol_service';
import { SNSingletonManager } from './singleton_manager';
import { PureService } from '@Lib/services/pure_service';
import { SNPredicate } from '@Models/core/predicate';
import { StorageKey } from '@Lib/storage_keys';
import { ContentType } from '@Lib/models';
import { PrivilegeCredential, ProtectedAction, SNPrivileges } from '@Models/app/privileges';
import { Challenge, ChallengeFormValue, ChallengePrompt, ChallengeReason, ChallengeValidation } from '@Lib/challenges';
import { ChallengeStrings, PromptTitles } from './api/messages';
import { ChallengeService } from './challenge/challenge_service';

export enum PrivilegeSessionLength {
  None = 0,
  FiveMinutes = 300,
  OneHour = 3600,
  OneWeek = 604800,
}

type CredentialAuthMapping = Partial<Record<PrivilegeCredential, string>>

const CredentialsMetadata = {
  [PrivilegeCredential.AccountPassword] : {
    label: 'Account Password',
    prompt: 'Please enter your account password.'
  },
  [PrivilegeCredential.LocalAuthentication] : {
    label: 'Application Passcode',
    prompt: 'Please enter your application passcode.'
  }
};

const ActionsMetadata = {
  [ProtectedAction.ManageExtensions]: {
    label: 'Manage Extensions'
  },
  [ProtectedAction.ManageBackups]: {
    label: 'Download/Import Backups'
  },
  [ProtectedAction.ViewProtectedNotes]: {
    label: 'View Protected Notes'
  },
  [ProtectedAction.ManagePrivileges]: {
    label: 'Manage Privileges'
  },
  [ProtectedAction.ManagePasscode]: {
    label: 'Manage Passcode'
  },
  [ProtectedAction.DeleteNote]: {
    label: 'Delete Notes'
  },
};

/**
 * Privileges allows certain actions within the application to require extra authentication.
 * For example, the privileges service exposes functions that allow the action of deleting
 * a note or viewing a note to require extra authentication.
 * Privileges are a superficial-level locking feature; they do not deal at all with underlying
 * data state. For example, viewing a protected note may require extra authentication,
 * but the underlying note data may already be decrypted in application memory, whether or not
 * the user has yet authenticated this action.
 */
export class SNPrivilegesService extends PureService {
  private challengeService?: ChallengeService
  private singletonManager?: SNSingletonManager
  private protocolService?: SNProtocolService
  private storageService?: SNStorageService
  private sessionManager?: SNSessionManager

  private availableActions: ProtectedAction[] = []
  private availableCredentials: PrivilegeCredential[] = []

  constructor(
    challengeService: ChallengeService,
    singletonManager: SNSingletonManager,
    protocolService: SNProtocolService,
    storageService: SNStorageService,
    sessionManager: SNSessionManager
  ) {
    super();
    this.challengeService = challengeService;
    this.singletonManager = singletonManager;
    this.protocolService = protocolService;
    this.storageService = storageService;
    this.sessionManager = sessionManager;
    this.loadDefaults();
  }

  public deinit() {
    this.challengeService = undefined;
    this.singletonManager = undefined;
    this.protocolService = undefined;
    this.storageService = undefined;
    this.sessionManager = undefined;
    super.deinit();
  }

  private loadDefaults() {
    this.availableActions = Object.keys(ProtectedAction).map((key) => {
      return (ProtectedAction as any)[key] as ProtectedAction;
    });

    this.availableCredentials = [
      PrivilegeCredential.AccountPassword,
      PrivilegeCredential.LocalAuthentication
    ];
  }

  getAvailableActions() {
    return this.availableActions;
  }

  getAvailableCredentials() {
    return this.availableCredentials;
  }

  /**
   * The credentials currently required to perform this action.
   */
  async netCredentialsForAction(action: ProtectedAction) {
    const privileges = await this.getPrivileges();
    const credentials = privileges.getCredentialsForAction(action);
    const netCredentials = [];
    for (const credential of credentials) {
      if (credential === PrivilegeCredential.AccountPassword) {
        const isOnline = this.sessionManager!.online();
        if (isOnline) {
          netCredentials.push(credential);
        }
      } else if (credential === PrivilegeCredential.LocalAuthentication) {
        if (await this.hasPasscode()) {
          netCredentials.push(credential);
        } else if (await this.hasBiometrics()) {
          netCredentials.push(credential);
        }
      }
    }
    return netCredentials;
  }

  async getPrivileges() {
    const contentType = ContentType.Privileges;
    const predicate = new SNPredicate('content_type', '=', contentType);
    return this.singletonManager!.findOrCreateSingleton(
      predicate,
      contentType,
      FillItemContent({})
    ) as Promise<SNPrivileges>;
  }

  async setSessionLength(length: PrivilegeSessionLength) {
    const addSecondsToNow = (seconds: number) => {
      const date = new Date();
      date.setSeconds(date.getSeconds() + seconds);
      return date;
    };
    const expiresAt = addSecondsToNow(length);
    await this.storageService!.setValue(
      StorageKey.PrivilegesExpirey,
      expiresAt
    );
    await this.storageService!.setValue(
      StorageKey.PrivilegesSessionLength,
      length
    );
  }

  async clearSession() {
    return this.setSessionLength(PrivilegeSessionLength.None);
  }

  async getSelectedSessionLength() {
    const length = await this.storageService!.getValue(
      StorageKey.PrivilegesSessionLength
    );
    if (length) {
      return length;
    } else {
      return PrivilegeSessionLength.None;
    }
  }

  async getSessionExpirey() {
    const expiresAt = await this.storageService!.getValue(
      StorageKey.PrivilegesExpirey
    );
    if (expiresAt) {
      return new Date(expiresAt);
    } else {
      return new Date();
    }
  }

  async actionHasPrivilegesConfigured(action: ProtectedAction) {
    return (await this.netCredentialsForAction(action)).length > 0;
  }

  /**
   * Whether the action requires present authentication.
   */
  async actionRequiresPrivilege(action: ProtectedAction) {
    const expiresAt = await this.getSessionExpirey();
    if (expiresAt > new Date()) {
      return false;
    }
    const netCredentials = await this.netCredentialsForAction(action);
    return netCredentials.length > 0;
  }

  /**
   * @deprecated
   */
  async authenticateAction(
    action: ProtectedAction,
    credentialAuthMapping: CredentialAuthMapping
  ) {
    const requiredCredentials = await this.netCredentialsForAction(action);
    const successfulCredentials = [];
    const failedCredentials = [];
    for (const credential of requiredCredentials) {
      const passesAuth = await this.verifyAuthenticationParameters(
        credential,
        credentialAuthMapping[credential]!
      );
      if (passesAuth) {
        successfulCredentials.push(credential);
      } else {
        failedCredentials.push(credential);
      }
    }
    return {
      success: failedCredentials.length === 0,
      successfulCredentials: successfulCredentials,
      failedCredentials: failedCredentials
    };
  }

  async authenticate(action: ProtectedAction): Promise<boolean> {
    const requiredCredentials = await this.netCredentialsForAction(action);

    if (requiredCredentials.length === 0) {
      return true;
    }

    const challengePrompts = []

    for (const credential of requiredCredentials) {
      if (credential === PrivilegeCredential.AccountPassword) {
        challengePrompts.push(new ChallengePrompt(
          ChallengeValidation.AccountPassword,
          undefined,
          ChallengeStrings.AccountPasswordPlaceholder
        ));
      }
      if (credential === PrivilegeCredential.LocalAuthentication) {
        if (await this.hasPasscode()) {
          challengePrompts.push(new ChallengePrompt(
            ChallengeValidation.LocalPasscode,
            undefined,
            ChallengeStrings.LocalPasscodePlaceholder
          ));
        }
        if (await this.hasBiometrics()) {
          challengePrompts.push(new ChallengePrompt(
            ChallengeValidation.Biometric
          ));
        }
      }
    }

    challengePrompts.push(new ChallengePrompt(ChallengeValidation.Form, PromptTitles.SessionLength, undefined, false, undefined, this.getSessionLengthOptions()));

    const response = await this.challengeService?.promptForChallengeResponse(new Challenge(challengePrompts, ChallengeReason.AuthenticatePrivilege, true));
    if (!response) {
      return false;
    }
    const value = response.getValueForType(ChallengeValidation.Form);
    if (value) {
      this.setSessionLength(value.value as number)
    }
    return true;
  }

   /**
   * @deprecated
   */
  async verifyAuthenticationParameters(
    credential: PrivilegeCredential,
    value: string
  ) {
    if (credential === PrivilegeCredential.AccountPassword) {
      const { valid } = await this.protocolService!.validateAccountPassword(value);
      return valid;
    } else if (credential === PrivilegeCredential.LocalAuthentication) {
      const { valid } = await this.protocolService!.validatePasscode(value);
      return valid;
    }
  }

  displayInfoForCredential(credential: PrivilegeCredential) {
    return CredentialsMetadata[credential];
  }

  displayInfoForAction(action: ProtectedAction) {
    return ActionsMetadata[action];
  }

  getSessionLengthOptions() {
    return [
      {
        value: PrivilegeSessionLength.None,
        label: "Don't Remember"
      },
      {
        value: PrivilegeSessionLength.FiveMinutes,
        label: '5 Minutes'
      },
      {
        value: PrivilegeSessionLength.OneHour,
        label: '1 Hour'
      },
      {
        value: PrivilegeSessionLength.OneWeek,
        label: '1 Week'
      }
    ];
  }

  private hasPasscode() {
    return this.protocolService!.hasRootKeyWrapper();
  }

  private hasBiometrics() {
    return this.challengeService?.hasBiometricsEnabled();
  }
}
