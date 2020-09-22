import { ChallengePrompt } from './../../challenges';
import { SNProtocolService } from "../protocol_service";
import { SNStorageService } from "../storage_service";
import { PureService } from "@Lib/services/pure_service";
import { StorageKey } from "@Lib/storage_keys";
import { StorageValueModes } from "@Services/storage_service";
import {
  Challenge,
  ChallengeResponse,
  ChallengeValidation,
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

export type ChallengeObserver = {
  onValidValue?: ValueCallback,
  onInvalidValue?: ValueCallback,
  onNonvalidatedSubmit?: (response: ChallengeResponse) => void,
  onComplete?: (response: ChallengeResponse) => void,
  onCancel?: () => void
};

/**
 * The challenge service creates, updates and keeps track of running challenge operations.
 */
export class ChallengeService extends PureService {
  private storageService?: SNStorageService;
  private protocolService?: SNProtocolService;
  private challengeOperations: Record<string, ChallengeOperation> = {};
  public sendChallenge?: (challenge: Challenge) => void;
  private challengeObservers: Record<string, ChallengeObserver[]> = {}

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
    this.storageService = undefined;
    this.protocolService = undefined;
    this.sendChallenge = undefined;
    super.deinit();
  }

  /**
   * Resolves when the challenge has been completed.
   */
  public promptForChallengeResponse(challenge: Challenge) {
    return new Promise<ChallengeResponse | undefined>((resolve) => {
      this.createOrGetChallengeOperation(challenge, resolve);
      this.sendChallenge!(challenge);
    });
  }

  public validateChallengeValue(
    value: ChallengeValue
  ): Promise<ChallengeValidationResponse> {
    switch (value.prompt.validation) {
      case ChallengeValidation.LocalPasscode:
        return this.protocolService!.validatePasscode(value.value as string);
      case ChallengeValidation.AccountPassword:
        return this.protocolService!.validateAccountPassword(
          value.value as string
        );
      case ChallengeValidation.Biometric:
        return Promise.resolve({ valid: value.value === true });
      default:
        throw Error(`Unhandled validation mode ${value.prompt.validation}`)
    }
  }

  public async getLaunchChallenge() {
    const prompts = [];
    const hasPasscode = this.protocolService!.hasPasscode();
    if (hasPasscode) {
      prompts.push(new ChallengePrompt(ChallengeValidation.LocalPasscode));
    }
    const biometricEnabled = await this.hasBiometricsEnabled()
    if (biometricEnabled) {
      prompts.push(new ChallengePrompt(ChallengeValidation.Biometric));
    }
    if (prompts.length > 0) {
      return new Challenge(prompts, ChallengeReason.ApplicationUnlock);
    } else {
      return null;
    }
  }

  public async promptForPasscode() {
    const challenge = new Challenge(
      [new ChallengePrompt(ChallengeValidation.LocalPasscode)],
      ChallengeReason.ResaveRootKey);
    const response = await this.promptForChallengeResponse(challenge);
    if (!response) {
      return { canceled: true, passcode: undefined };
    }
    const value = response.getValueForType(ChallengeValidation.LocalPasscode);
    return { passcode: value.value as string, canceled: false }
  }

  public isPasscodeLocked() {
    return this.protocolService!.rootKeyNeedsUnwrapping();
  }

  public async hasBiometricsEnabled() {
    const biometricsState = await this.storageService!.getValue(
      StorageKey.BiometricsState,
      StorageValueModes.Nonwrapped
    );
    return Boolean(biometricsState);
  }

  public async enableBiometrics() {
    await this.storageService!.setValue(
      StorageKey.BiometricsState,
      true,
      StorageValueModes.Nonwrapped
    );
  }

  public async disableBiometrics() {
    await this.storageService!.setValue(
      StorageKey.BiometricsState,
      false,
      StorageValueModes.Nonwrapped
    );
  }

  public addChallengeObserver(
    challenge: Challenge,
    observer: ChallengeObserver
  ) {
    const observers = this.challengeObservers[challenge.id] || [];
    observers.push(observer);
    this.challengeObservers[challenge.id] = observers;
  }

  private createOrGetChallengeOperation(
    challenge: Challenge,
    resolve: (response: ChallengeResponse | undefined) => void
  ): ChallengeOperation {
    let operation = this.getChallengeOperation(challenge);
    if (!operation) {
      operation = new ChallengeOperation(
        challenge,
        (value: ChallengeValue) => {
          this.onChallengeValidValue(challenge, value);
        },
        (value: ChallengeValue) => {
          this.onChallengeInvalidValue(challenge, value);
        },
        (response: ChallengeResponse) => {
          this.onChallengeNonvalidatedSubmit(challenge, response);
          resolve(response);
        },
        (response: ChallengeResponse) => {
          this.onChallengeComplete(challenge, response);
          resolve(response);
        },
        () => {
          this.onChallengeCancel(challenge);
          resolve(undefined);
        }
      );
      this.challengeOperations[challenge.id] = operation;
    }
    return operation;
  }

  private performOnObservers(challenge: Challenge, perform: (observer: ChallengeObserver) => void) {
    const observers = this.challengeObservers[challenge.id] || [];
    for (const observer of observers) {
      perform(observer);
    }
  }

  private onChallengeValidValue(challenge: Challenge, value: ChallengeValue) {
    this.performOnObservers(challenge, (observer) => {
      observer.onValidValue?.(value);
    })
  }

  private onChallengeInvalidValue(challenge: Challenge, value: ChallengeValue) {
    this.performOnObservers(challenge, (observer) => {
      observer.onInvalidValue?.(value);
    })
  }

  private onChallengeNonvalidatedSubmit(challenge: Challenge, response: ChallengeResponse) {
    this.performOnObservers(challenge, (observer) => {
      observer.onNonvalidatedSubmit?.(response);
    })
  }

  private onChallengeComplete(challenge: Challenge, response: ChallengeResponse) {
    this.performOnObservers(challenge, (observer) => {
      observer.onComplete?.(response);
    })
  }

  private onChallengeCancel(challenge: Challenge) {
    this.performOnObservers(challenge, (observer) => {
      observer.onCancel?.();
    })
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
    for (const value of values) {
      if (!value.prompt.validates) {
        const operation = this.getChallengeOperation(challenge);
        operation.addNonvalidatedValue(value);
      } else {
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
      delete this.challengeObservers[operation.challenge.id];
    }
  }
}
