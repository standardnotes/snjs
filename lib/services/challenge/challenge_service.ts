import { SNProtocolService } from "../protocol_service";
import { SNStorageService } from "../storage_service";
import { PureService } from "@Lib/services/pure_service";
import { StorageKey } from "@Lib/storage_keys";
import { StorageValueModes } from "@Services/storage_service";
import {
  Challenge,
  ChallengeResponse,
  ChallengeType,
  ChallengeReason,
  ChallengeValue,
  ChallengeArtifacts,
} from "@Lib/challenges";
import { ChallengeOperation } from "./challenge_operation";

type ChallengeValidationResponse = {
  valid: boolean;
  artifacts?: ChallengeArtifacts;
};

export type ValueCallback = (value: ChallengeValue) => void;

/**
 * The challenge service creates, updates and keeps track of running challenge operations.
 */
export class ChallengeService extends PureService {
  private storageService?: SNStorageService;
  private protocolService?: SNProtocolService;
  private challengeOperations: Record<string, ChallengeOperation> = {};
  public sendChallenge?: (challenge: Challenge) => void;

  constructor(
    storageService: SNStorageService,
    protocolService: SNProtocolService
  ) {
    super();
    this.storageService = storageService;
    this.protocolService = protocolService;
  }

  /** @override */
  public deinit() {
    this.challengeOperations = {};
    this.storageService = undefined;
    this.protocolService = undefined;
    this.sendChallenge = undefined;
    super.deinit();
  }

  /**
   * Resolves when the challenge has been completed.
   */
  public promptForChallengeResponse(challenge: Challenge) {
    return new Promise<ChallengeResponse | null>((resolve) => {
      this.createOrGetChallengeOperation(challenge, resolve);
    });
  }

  /**
   * Resolves when the user has submitted values which the caller can use
   * to run custom validations.
   */
  public promptForChallengeResponseWithCustomValidation(challenge: Challenge) {
    const operation: ChallengeOperation = this.createOrGetChallengeOperation(
      challenge
    );
    return new Promise<ChallengeValue[]>((resolve) => {
      operation.customValidator = resolve;
    });
  }

  public validateChallengeValue(
    value: ChallengeValue
  ): Promise<ChallengeValidationResponse> {
    switch (value.type) {
      case ChallengeType.LocalPasscode:
        return this.protocolService!.validatePasscode(value.value as string);
      case ChallengeType.AccountPassword:
        return this.protocolService!.validateAccountPassword(
          value.value as string
        );
      case ChallengeType.Biometric:
        return Promise.resolve({ valid: value.value === true });
    }
  }

  public async getLaunchChallenge() {
    const types = [];
    const hasPasscode = this.protocolService!.hasPasscode();
    if (hasPasscode) {
      types.push(ChallengeType.LocalPasscode);
    }
    const biometricPrefs = await this.storageService!.getValue(
      StorageKey.BiometricPrefs,
      StorageValueModes.Nonwrapped
    );
    const biometricEnabled = biometricPrefs && biometricPrefs.enabled;
    if (biometricEnabled) {
      types.push(ChallengeType.Biometric);
    }
    if (types.length > 0) {
      return new Challenge(types, ChallengeReason.ApplicationUnlock);
    } else {
      return null;
    }
  }

  public isPasscodeLocked() {
    return this.protocolService!.rootKeyNeedsUnwrapping();
  }

  public async enableBiometrics() {
    await this.storageService!.setValue(
      StorageKey.BiometricPrefs,
      { enabled: true },
      StorageValueModes.Nonwrapped
    );
  }

  public setChallengeCallbacks(
    challenge: Challenge,
    onValidValue?: ValueCallback,
    onInvalidValue?: ValueCallback,
    onComplete?: () => void,
    onCancel?: () => void
  ) {
    const operation = this.getChallengeOperation(challenge);
    operation.onValidValue = onValidValue;
    operation.onInvalidValue = onInvalidValue;
    operation.onComplete = onComplete;
    operation.onCancel = onCancel;
  }

  private createOrGetChallengeOperation(
    challenge: Challenge,
    resolve?: (response: ChallengeResponse | null) => void
  ): ChallengeOperation {
    let operation = this.getChallengeOperation(challenge);
    if (!operation) {
      operation = new ChallengeOperation(challenge, resolve);
      this.challengeOperations[challenge.id] = operation;
      this.sendChallenge!(challenge);
    }
    operation.resolve = resolve;
    return operation;
  }

  private getChallengeOperation(challenge: Challenge) {
    return this.challengeOperations[challenge.id];
  }

  private deleteChallengeOperation(operation: ChallengeOperation) {
    delete this.challengeOperations[operation.challenge.id];
  }

  public cancelChallenge(challenge: Challenge) {
    const operation = this.challengeOperations[challenge.id];
    operation.cancel();
    this.deleteChallengeOperation(operation);
  }

  public async submitValuesForChallenge(
    challenge: Challenge,
    values: ChallengeValue[]
  ) {
    if (values.length === 0) {
      throw Error("Attempting to submit 0 values for challenge");
    }
    const operation = this.getChallengeOperation(challenge);
    if (operation.customValidator) {
      operation.customValidator(values);
    } else {
      for (const value of values) {
        const { valid, artifacts } = await this.validateChallengeValue(value);
        this.setValidationStatusForChallenge(
          challenge,
          value,
          valid,
          artifacts
        );
      }
    }
  }

  public setValidationStatusForChallenge(
    challenge: Challenge,
    value: ChallengeValue,
    valid: boolean,
    artifacts?: ChallengeArtifacts
  ) {
    const operation = this.getChallengeOperation(challenge);
    operation.setValueStatus(value, valid, artifacts);
    if (operation.isFinished()) {
      this.deleteChallengeOperation(operation);
    }
  }
}
