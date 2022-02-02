import { ChallengePrompt } from './../../challenges';
import { SNProtocolService } from '../protocol_service';
import { SNStorageService } from '../storage_service';
import { PureService } from '@Lib/services/pure_service';
import {
  Challenge,
  ChallengeArtifacts,
  ChallengeReason,
  ChallengeResponse,
  ChallengeValidation,
  ChallengeValue,
} from '@Lib/challenges';
import { ChallengeOperation } from './challenge_operation';
import { removeFromArray } from '@Lib/utils';
import { isValidProtectionSessionLength } from '../protection_service';

type ChallengeValidationResponse = {
  valid: boolean;
  artifacts?: ChallengeArtifacts;
};

export type ValueCallback = (value: ChallengeValue) => void;

export type ChallengeObserver = {
  onValidValue?: ValueCallback;
  onInvalidValue?: ValueCallback;
  onNonvalidatedSubmit?: (response: ChallengeResponse) => void;
  onComplete?: (response: ChallengeResponse) => void;
  onCancel?: () => void;
};

/**
 * The challenge service creates, updates and keeps track of running challenge operations.
 */
export class ChallengeService extends PureService {
  private challengeOperations: Record<string, ChallengeOperation> = {};
  public sendChallenge?: (challenge: Challenge) => void;
  private challengeObservers: Record<string, ChallengeObserver[]> = {};

  constructor(
    private storageService: SNStorageService,
    private protocolService: SNProtocolService
  ) {
    super();
  }

  /** @override */
  public deinit() {
    (this.storageService as any) = undefined;
    (this.protocolService as any) = undefined;
    this.sendChallenge = undefined;
    (this.challengeOperations as any) = undefined;
    (this.challengeObservers as any) = undefined;
    super.deinit();
  }

  /**
   * Resolves when the challenge has been completed.
   * For non-validated challenges, will resolve when the first value is submitted.
   */
  public promptForChallengeResponse(
    challenge: Challenge
  ): Promise<ChallengeResponse | undefined> {
    return new Promise<ChallengeResponse | undefined>((resolve) => {
      this.createOrGetChallengeOperation(challenge, resolve);
      this.sendChallenge!(challenge);
    });
  }

  public async validateChallengeValue(
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
        return { valid: value.value === true };
      case ChallengeValidation.ProtectionSessionDuration:
        return { valid: isValidProtectionSessionLength(value.value) };
      default:
        throw Error(`Unhandled validation mode ${value.prompt.validation}`);
    }
  }

  public async promptForCorrectPasscode(
    reason: ChallengeReason
  ): Promise<string | undefined> {
    const challenge = new Challenge(
      [new ChallengePrompt(ChallengeValidation.LocalPasscode)],
      reason,
      true
    );
    const response = await this.promptForChallengeResponse(challenge);
    if (!response) {
      return undefined;
    }
    const value = response.getValueForType(ChallengeValidation.LocalPasscode);
    return value.value as string;
  }

  /**
   * Returns the wrapping key for operations that require resaving the root key
   * (changing the account password, signing in, registering, or upgrading protocol)
   * Returns empty object if no passcode is configured.
   * Otherwise returns {cancled: true} if the operation is canceled, or
   * {wrappingKey} with the result.
   * @param passcode - If the consumer already has access to the passcode,
   * they can pass it here so that the user is not prompted again.
   */
  async getWrappingKeyIfApplicable(passcode?: string) {
    if (!this.protocolService.hasPasscode()) {
      return {};
    }
    if (!passcode) {
      passcode = await this.promptForCorrectPasscode(
        ChallengeReason.ResaveRootKey
      );
      if (!passcode) {
        return { canceled: true };
      }
    }
    const wrappingKey = await this.protocolService.computeWrappingKey(passcode);
    return { wrappingKey };
  }

  public isPasscodeLocked() {
    return this.protocolService!.rootKeyNeedsUnwrapping();
  }

  public addChallengeObserver(
    challenge: Challenge,
    observer: ChallengeObserver
  ) {
    const observers = this.challengeObservers[challenge.id] || [];
    observers.push(observer);
    this.challengeObservers[challenge.id] = observers;
    return () => {
      removeFromArray(observers, observer);
    };
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

  private performOnObservers(
    challenge: Challenge,
    perform: (observer: ChallengeObserver) => void
  ) {
    const observers = this.challengeObservers[challenge.id] || [];
    for (const observer of observers) {
      perform(observer);
    }
  }

  private onChallengeValidValue(challenge: Challenge, value: ChallengeValue) {
    this.performOnObservers(challenge, (observer) => {
      observer.onValidValue?.(value);
    });
  }

  private onChallengeInvalidValue(challenge: Challenge, value: ChallengeValue) {
    this.performOnObservers(challenge, (observer) => {
      observer.onInvalidValue?.(value);
    });
  }

  private onChallengeNonvalidatedSubmit(
    challenge: Challenge,
    response: ChallengeResponse
  ) {
    this.performOnObservers(challenge, (observer) => {
      observer.onNonvalidatedSubmit?.(response);
    });
  }

  private onChallengeComplete(
    challenge: Challenge,
    response: ChallengeResponse
  ) {
    this.performOnObservers(challenge, (observer) => {
      observer.onComplete?.(response);
    });
  }

  private onChallengeCancel(challenge: Challenge) {
    this.performOnObservers(challenge, (observer) => {
      observer.onCancel?.();
    });
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

  public completeChallenge(challenge: Challenge) {
    const operation = this.challengeOperations[challenge.id];
    operation.complete();
    this.deleteChallengeOperation(operation);
  }

  public async submitValuesForChallenge(
    challenge: Challenge,
    values: ChallengeValue[]
  ) {
    if (values.length === 0) {
      throw Error('Attempting to submit 0 values for challenge');
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
