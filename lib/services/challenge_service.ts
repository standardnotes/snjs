import { SNProtocolService } from './protocol_service';
import { SNStorageService } from './storage_service';
import { PureService } from '@Lib/services/pure_service';
import { StorageKey } from '@Lib/storage_keys';
import { StorageValueModes } from '@Services/storage_service';
import { removeFromArray } from '@Lib/utils';
import {
  Challenge,
  ChallengeResponse,
  ChallengeType,
  ChallengeReason,
  ChallengeValue,
  ChallengeArtifacts
} from '@Lib/challenges';

export type OrchestratorFill = {
  orchestrator?: ChallengeOrchestrator
}
type ChallengeValidationResponse = {
  valid: boolean
  artifacts?: ChallengeArtifacts
}
type ChallengeHandler = (
  challenge: Challenge,
  orchestrator: ChallengeOrchestrator
) => void
type SetClientFunctionsFunction = (
  onValidValue?: (valid: ChallengeValue) => void,
  onInvalidValue?: (valid: ChallengeValue) => void,
  onComplete?: () => void,
  onCancel?: () => void,
) => void;
type SubmitValuesFunction = (values: ChallengeValue[]) => void;
type SetValidationStatusFunction = (
  value: ChallengeValue,
  valid: boolean,
  artifacts?: ChallengeArtifacts
) => void;
type ValueCallback = (value: ChallengeValue) => void

/** The orchestrator gives this object to the client */
export class ChallengeOrchestrator {

  private setClientFunctions: SetClientFunctionsFunction

  /**
   * Called by client to submit values to the orchestrator
   */
  public submitValues: SubmitValuesFunction

  /**
   * Called by client to submit manual valid status for value
   */
  public setValidationStatus: SetValidationStatusFunction

  /**
   * Cancels this challenge if permissible
   */
  public cancel: () => void

  /**
   * Signatures for these functions match exactly the signatures
   * of the instance methods in this class.
   */
  constructor(
    setClientFunctions: SetClientFunctionsFunction,
    submitValues: SubmitValuesFunction,
    setValidationStatus: SetValidationStatusFunction,
    cancel: () => void,
  ) {
    this.setClientFunctions = setClientFunctions;
    this.submitValues = submitValues;
    this.setValidationStatus = setValidationStatus;
    this.cancel = cancel;
  }

  /**
   * Called by client to configure callbacks
   */
  public setCallbacks(
    onValidValue?: ValueCallback,
    onInvalidValue?: ValueCallback,
    onComplete?: () => void,
    onCancel?: () => void
  ) {
    this.setClientFunctions(
      onValidValue,
      onInvalidValue,
      onComplete,
      onCancel
    );
  }
}

/** The client gives this object to the orchestrator */
export class ChallengeClient {
  /**
   * Called by the orchestrator to let the client know of a valid value
   */
  public onValidValue: ValueCallback

  /**
   * Called by the orchestrator to let the client know of an invalid value
   */
  public onInvalidValue: ValueCallback

  /** 
   * Called by the orchestrator to let the client know the challenge has completed
   * successfully.
   */
  public onComplete: () => void 

  /** 
   * Called by the orchestrator to let the client know the challenge was canceled
   */
  public onCancel: () => void

  /**
   * Signatures for these functions match exactly the signatures
   * of the instance methods in this class.
   */
  constructor(
    onValidValue?: ValueCallback,
    onInvalidValue?: ValueCallback,
    onComplete?: () => void,
    onCancel?: () => void
  ) {
    this.onValidValue = onValidValue || ((_: ChallengeValue) => { });
    this.onInvalidValue = onInvalidValue || ((_: ChallengeValue) => { });
    this.onComplete = onComplete || (() => { });
    this.onCancel = onCancel || (() => { });
  }
}

export class ChallengeOperation {

  public challenge: Challenge
  public validate: boolean
  public validValues: ChallengeValue[] = []
  public invalidValues: ChallengeValue[] = []
  public artifacts: ChallengeArtifacts = {}
  public client!: ChallengeClient
  private resolve!: (response: any) => void
  public orchestrator!: ChallengeOrchestrator

  constructor(challenge: Challenge, validate: boolean) {
    this.challenge = challenge;
    this.validate = validate;
  }

  /** 
   * Sets the promise resolve function to be called 
   * when this challenge completes or cancels 
   */
  public setResolver(resolve: (response: ChallengeResponse) => void) {
    this.resolve = resolve;
  }

  /**
   * Mark this challenge as complete, triggering the resolve function, 
   * as well as notifying the client
   */
  public complete(response?: ChallengeResponse) {
    if (!response) {
      response = new ChallengeResponse(
        this.challenge,
        this.validValues,
        this.artifacts
      );
    }
    this.resolve(response);
    this.client?.onComplete();
  }

  /**
   * Mark this challenge as canceled, triggering the resolve function with a null response,
   * as well as notifying the client.
   */
  public cancel() {
    this.resolve(null);
    this.client?.onCancel();
  }

  /**
   * @returns Returns true if the challenge has received all valid responses
   */
  public isFinished() {
    return this.validValues.length === this.challenge.types.length;
  }

  /**
   * Called by challenge orchestrator to set up the orchestrator object.
   * This object will be used by the client to communicate with us.
   */
  public setOrchestratorFunctions(
    setClientFunctions: SetClientFunctionsFunction,
    setValidationStatus: SetValidationStatusFunction,
    submitValues: SubmitValuesFunction,
    cancel: () => void,
  ) {
    this.orchestrator = new ChallengeOrchestrator(
      setClientFunctions,
      submitValues,
      setValidationStatus,
      cancel
    );
  }

  /**
   * Sets the values validation status, as well as handles subsequent actions,
   * such as completing the operation if all valid values are supplied, as well as
   * notifying the client of this new value's validation status.
   */
  public setValueStatus(
    value: ChallengeValue,
    valid: boolean,
    artifacts?: ChallengeArtifacts
  ) {
    const valuesArray = valid ? this.validValues : this.invalidValues;
    const matching = valuesArray.find((v) => v.type === value.type);
    if (matching) {
      removeFromArray(valuesArray, matching);
    }
    valuesArray.push(value);
    if (valid) {
      this.validValues = valuesArray;
    } else {
      this.invalidValues = valuesArray;
    }
    Object.assign(this.artifacts, artifacts);
    if (this.isFinished()) {
      this.complete();
    } else {
      if (valid) {
        this.client?.onValidValue(value);
      } else {
        this.client?.onInvalidValue(value);
      }
    }
  }
}

export class ChallengeService extends PureService {

  private storageService?: SNStorageService
  private protocolService?: SNProtocolService
  private challengeOperations: Record<string, ChallengeOperation> = {}
  public challengeHandler?: ChallengeHandler

  constructor(
    storageService: SNStorageService,
    protocolService: SNProtocolService,
  ) {
    super();
    this.storageService = storageService;
    this.protocolService = protocolService;
  }

  /** @override */
  public deinit() {
    this.storageService = undefined;
    this.protocolService = undefined;
    this.challengeHandler = undefined;
    super.deinit();
  }

  /** 
   * @param orchestratorFill - An empty object which will be populated with
   * a .orchestrator property. The caller uses this funtion to communicate with us
   * via a selective API.
   */
  public async promptForChallengeResponse(
    challenge: Challenge,
    validate = true,
    orchestratorFill?: OrchestratorFill
  ) : Promise<ChallengeResponse> {
    let operation = this.getChallengeOperation(challenge);
    const isNew = !operation;
    if (!operation) {
      operation = this.createChallengeOperation(challenge, validate);
    }
    if (orchestratorFill) {
      orchestratorFill.orchestrator = operation.orchestrator;
    }
    return new Promise((resolve) => {
      operation.setResolver(resolve);
      if (isNew) {
        this.challengeHandler!(
          challenge,
          operation.orchestrator
        );
      }
    });
  }
  public async validateChallengeValue(value: ChallengeValue): Promise<ChallengeValidationResponse> {
    if (value.type === ChallengeType.LocalPasscode) {
      return this.protocolService!.validatePasscode(value.value as string);
    }
    else if (value.type === ChallengeType.AccountPassword) {
      return this.protocolService!.validateAccountPassword(value.value as string);
    }
    else if (value.type === ChallengeType.Biometric) {
      return { valid: value.value === true };
    }
    throw `Cannot validate challenge type ${value.type}`;
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

  private createChallengeOperation(challenge: Challenge, validate: boolean) {
    const operation = new ChallengeOperation(challenge, validate);
    operation.setOrchestratorFunctions(
      (
        onValidValue?: ValueCallback,
        onInvalidValue?: ValueCallback,
        onComplete?: () => void,
        onCancel?: () => void
      ) => {
        const client = new ChallengeClient(
          onValidValue,
          onInvalidValue,
          onComplete,
          onCancel
        );
        operation.client = client;
      },
      (value: ChallengeValue, valid: boolean, artifacts?: ChallengeArtifacts) => {
        this.setValidationStatusForChallenge(challenge, value, valid, artifacts);
      },
      (values: ChallengeValue[]) => {
        this.submitValuesForChallenge(challenge, values);
      },
      () => {
        this.cancelChallenge(challenge);
      }
    );
    this.setChallengeOperation(operation);
    return operation;
  }

  private getChallengeOperation(challenge: Challenge) {
    return this.challengeOperations[challenge.id];
  }

  private setChallengeOperation(operation: ChallengeOperation) {
    this.challengeOperations[operation.challenge.id] = operation;
  }

  private deleteChallengeOperation(operation: ChallengeOperation) {
    delete this.challengeOperations[operation.challenge.id];
  }

  private cancelChallenge(challenge: Challenge) {
    const operation = this.challengeOperations[challenge.id];
    operation.cancel();
    this.deleteChallengeOperation(operation);
  }

  private async submitValuesForChallenge(challenge: Challenge, values: ChallengeValue[]) {
    const operation = this.getChallengeOperation(challenge);
    if (operation.validate) {
      for (const value of values) {
        const { valid, artifacts } = await this.validateChallengeValue(value);
        this.setValidationStatusForChallenge(challenge, value, valid, artifacts);
      }
    } else {
      const response = new ChallengeResponse(challenge, values);
      operation.complete(response);
    }
  }

  private setValidationStatusForChallenge(
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
