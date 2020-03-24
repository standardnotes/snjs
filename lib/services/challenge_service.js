import { PureService } from '@Lib/services/pure_service';
import { StorageKeys } from '@Lib/storage_keys';
import { StorageValueModes } from '@Services/storage_service';
import { removeFromArray } from '@Lib/utils';
import {
  Challenge,
  ChallengeResponse,
  ChallengeType,
  ChallengeReason
} from '@Lib/challenges';

/** The orchestrator gives this object to the client */
export class ChallengeOrchestrator {
  /**
   * Signatures for these functions match exactly the signatures
   * of the instance methods in this class.
   */
  constructor({
    setClientFunctions,
    submitValues,
    setValidationStatus,
    cancel,
  }) {
    this.setClientFunctionsFn = setClientFunctions;
    this.submitValuesFn = submitValues;
    this.setValidationStatusFn = setValidationStatus;
    this.cancelFn = cancel;
  }

  /**
   * Called by client to configure callbacks
   * @access public
   */
  setCallbacks({
    onValidValue,
    onInvalidValue,
    onComplete,
    onCancel
  }) {
    this.setClientFunctionsFn({
      onValidValue,
      onInvalidValue,
      onComplete,
      onCancel
    });
  }

  /**
   * Called by client to submit values to the orchestrator
   * @access public
   * @param {Array.<ChallengeValue>} values 
   */
  submitValues(values) {
    this.submitValuesFn(values);
  }

  /**
   * Called by client to submit manual valid status for value
   * @access public
   * @param {ChallengeValue} value
   * @param {boolean} valid
   * @param {object} [artifacts]
   */
  setValidationStatus(value, valid, artifacts) {
    this.setValidationStatusFn(value, valid, artifacts);
  }

  /**
   * Cancels this challenge if permissible
   * @access public
   */
  cancel() {
    this.cancelFn();
  }
}

/** The client gives this object to the orchestrator */
export class ChallengeClient {
  /**
   * Signatures for these functions match exactly the signatures
   * of the instance methods in this class.
   */
  constructor({
    onValidValue,
    onInvalidValue,
    onComplete,
    onCancel
  } = {}) {
    this.onValidValueFn = onValidValue;
    this.onInvalidValueFn = onInvalidValue;
    this.onCompleteFn = onComplete;
    this.onCancelFn = onCancel;
  }

  /** 
   * Called by the orchestrator to let the client know of a valid value
   * @access public 
   * @param {ChallengeValue} value
   */
  onValidValue(value) {
    this.onValidValueFn && this.onValidValueFn(value);
  }

  /** 
   * Called by the orchestrator to let the client know of an invalid value
   * @access public 
   * @param {ChallengeValue} value
   */
  onInvalidValue(value) {
    this.onInvalidValueFn && this.onInvalidValueFn(value);
  }

  /** 
   * Called by the orchestrator to let the client know the challenge has completed
   * successfully.
   * @access public 
   */
  onComplete() {
    this.onCompleteFn && this.onCompleteFn();
  }

  /** 
   * Called by the orchestrator to let the client know the challenge was canceled
   * @access public 
   */
  onCancel() {
    this.onCancelFn && this.onCancelFn();
  }
}

export class ChallengeOperation {
  constructor(challenge, validate) {
    this.challenge = challenge;
    this.validate = validate;
    this.validValues = [];
    this.invalidValues = [];
    this.artifacts = {};
    /** Create default client in case client does not set callbacks */
    this.client = new ChallengeClient();
  }

  /** 
   * @access public
   * Sets the promise resolve function to be called 
   * when this challenge completes or cancels 
   * @param {function} resolve
   */
  setResolver(resolve) {
    this.resolve = resolve;
  }

  /**
   * @access public
   * Mark this challenge as complete, triggering the resolve function, 
   * as well as notifying the client
   */
  complete(response) {
    if (!response) {
      response = new ChallengeResponse(
        this.challenge,
        this.validValues,
        this.artifacts
      );
    }
    this.resolve(response);
    this.getClient().onComplete();
  }

  /**
   * @access public
   * Mark this challenge as canceled, triggering the resolve function with a null response,
   * as well as notifying the client.
   */
  cancel() {
    this.resolve(null);
    this.getClient().onCancel();
  }

  /**
   * @access public
   * @returns {boolean} Returns true if the challenge has received all valid responses
   */
  isFinished() {
    return this.validValues.length === this.challenge.types.length;
  }

  /**
   * @access public
   * Called by challenge orchestrator to set up the orchestrator object.
   * This object will be used by the client to communicate with us.
   */
  setOrchestratorFunctions({
    setClientFunctions,
    setValidationStatus,
    submitValues,
    cancel,
  }) {
    this.orchestrator = new ChallengeOrchestrator({
      setClientFunctions,
      setValidationStatus,
      submitValues,
      cancel
    });
  }

  /** @access private */
  getClient() {
    return this.client;
  }

  /** @access public */
  getOrchestrator() {
    return this.orchestrator;
  }

  /**
   * @access public
   * @param {ChallengeClient} client 
   */
  setClient(client) {
    this.client = client;
  }

  /**
   * Sets the values validation status, as well as handles subsequent actions,
   * such as completing the operation if all valid values are supplied, as well as
   * notifying the client of this new value's validation status.
   * @access public
   * @param {ChallengeValue} value 
   * @param {boolean} valid 
   * @param {object} artifacts 
   */
  setValueStatus(value, valid, artifacts) {
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
        this.getClient().onValidValue(value);
      } else {
        this.getClient().onInvalidValue(value);
      }
    }
  }
}

export class ChallengeService extends PureService {
  constructor({
    storageService,
    keyManager,
    protocolService,
  }) {
    super();
    this.storageService = storageService;
    this.keyManager = keyManager;
    this.protocolService = protocolService;
    this.challengeOperations = {};
  }

  /** @override */
  deinit() {
    this.storageService = null;
    this.keyManager = null;
    this.protocolService = null;
    this.challengeHandler = null;
    super.deinit();
  }

  /** @access public */
  setChallengeHandler(handler) {
    this.challengeHandler = handler;
  }

  /** 
   * @access public 
   * @param {Challenge} challenge
   * @param {boolean} validate
   * @param {object} orchestratorFill - An empty object which will be populated with
   * a .orchestrator property. The caller uses this funtion to communicate with us
   * via a selective API.
   */
  async promptForChallengeResponse(challenge, validate = true, orchestratorFill) {
    let operation = this.getChallengeOperation(challenge);
    const isNew = !operation;
    if (!operation) {
      operation = this.createChallengeOperation(challenge, validate);
    }
    if (orchestratorFill) {
      orchestratorFill.orchestrator = operation.getOrchestrator();
    }
    return new Promise((resolve) => {
      operation.setResolver(resolve);
      if (isNew) {
        this.challengeHandler.receiveChallenge(
          challenge,
          operation.getOrchestrator()
        );
      }
    });
  }

  /**
  * @access public
  * @returns {object} {valid, artifacts}
  */
  async validateChallengeValue(value) {
    if (value.type === ChallengeType.LocalPasscode) {
      return this.keyManager.validatePasscode(value.value);
    }
    else if (value.type === ChallengeType.AccountPassword) {
      return this.keyManager.validateAccountPassword(value.value);
    }
    else if (value.type === ChallengeType.Biometric) {
      return { valid: value.value === true };
    }
    throw `Cannot validate challenge type ${value.type}`;
  }

  /**
   * @access public
   * @returns {Challenge}
   */
  async getLaunchChallenge() {
    const types = [];
    const hasPasscode = await this.keyManager.hasPasscode();
    if (hasPasscode) {
      types.push(ChallengeType.LocalPasscode);
    }
    const biometricPrefs = await this.storageService.getValue(
      StorageKeys.BiometricPrefs,
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

  /** 
   * @access public 
   * @returns {boolean}
   */
  isPasscodeLocked() {
    return this.keyManager.rootKeyNeedsUnwrapping();
  }

  /** @access public */
  async enableBiometrics() {
    await this.storageService.setValue(
      StorageKeys.BiometricPrefs,
      { enabled: true },
      StorageValueModes.Nonwrapped
    );
  }

  /** @access private */
  createChallengeOperation(challenge, validate) {
    const operation = new ChallengeOperation(challenge, validate);
    operation.setOrchestratorFunctions({
      setClientFunctions: ({
        onValidValue,
        onInvalidValue,
        onComplete,
        onCancel
      }) => {
        const client = new ChallengeClient({
          onValidValue,
          onInvalidValue,
          onComplete,
          onCancel
        });
        operation.setClient(client);
      },
      submitValues: (values) => {
        this.submitValuesForChallenge(challenge, values);
      },
      setValidationStatus: (value, valid, artifacts) => {
        this.setValidationStatusForChallenge(challenge, value, valid, artifacts);
      },
      cancel: () => {
        this.cancelChallenge(challenge);
      }
    });
    this.setChallengeOperation(operation);
    return operation;
  }

  /** @access private */
  getChallengeOperation(challenge) {
    return this.challengeOperations[challenge.id];
  }

  /** @access private */
  setChallengeOperation(operation) {
    this.challengeOperations[operation.challenge.id] = operation;
  }

  /** @access private */
  deleteChallengeOperation(operation) {
    delete this.challengeOperations[operation.challenge.id];
  }

  /** @access private */
  cancelChallenge(challenge) {
    const operation = this.challengeOperations[challenge.id];
    operation.cancel();
    this.deleteChallengeOperation(operation);
  }

  /** @access private */
  async submitValuesForChallenge(challenge, values) {
    const operation = this.getChallengeOperation(challenge);
    if (operation.validate) {
      for (const value of values) {
        const { valid, artifacts } = await this.validateChallengeValue(value);
        this.setValidationStatusForChallenge(challenge, value, valid, artifacts);
      }
    } else {
      const response = new ChallengeResponse(challenge, values, null);
      operation.complete(response);
    }
  }

  /** @access private */
  setValidationStatusForChallenge(challenge, value, valid, artifacts) {
    const operation = this.getChallengeOperation(challenge);
    operation.setValueStatus(value, valid, artifacts);
    if (operation.isFinished()) {
      this.deleteChallengeOperation(operation);
    }
  }
}
