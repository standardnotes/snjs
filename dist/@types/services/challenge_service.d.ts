import { SNProtocolService } from './protocol_service';
import { SNStorageService } from './storage_service';
import { PureService } from './pure_service';
import { Challenge, ChallengeResponse, ChallengeValue, ChallengeArtifacts } from '../challenges';
export declare type OrchestratorFill = {
    orchestrator?: ChallengeOrchestrator;
};
declare type ChallengeValidationResponse = {
    valid: boolean;
    artifacts?: ChallengeArtifacts;
};
declare type ChallengeHandler = (challenge: Challenge, orchestrator: ChallengeOrchestrator) => void;
declare type SetClientFunctionsFunction = (onValidValue?: (valid: ChallengeValue) => void, onInvalidValue?: (valid: ChallengeValue) => void, onComplete?: () => void, onCancel?: () => void) => void;
declare type SubmitValuesFunction = (values: ChallengeValue[]) => void;
declare type SetValidationStatusFunction = (value: ChallengeValue, valid: boolean, artifacts?: ChallengeArtifacts) => void;
declare type ValueCallback = (value: ChallengeValue) => void;
/** The orchestrator gives this object to the client */
export declare class ChallengeOrchestrator {
    private setClientFunctions;
    /**
     * Called by client to submit values to the orchestrator
     */
    submitValues: SubmitValuesFunction;
    /**
     * Called by client to submit manual valid status for value
     */
    setValidationStatus: SetValidationStatusFunction;
    /**
     * Cancels this challenge if permissible
     */
    cancel: () => void;
    /**
     * Signatures for these functions match exactly the signatures
     * of the instance methods in this class.
     */
    constructor(setClientFunctions: SetClientFunctionsFunction, submitValues: SubmitValuesFunction, setValidationStatus: SetValidationStatusFunction, cancel: () => void);
    /**
     * Called by client to configure callbacks
     */
    setCallbacks(onValidValue?: ValueCallback, onInvalidValue?: ValueCallback, onComplete?: () => void, onCancel?: () => void): void;
}
/** The client gives this object to the orchestrator */
export declare class ChallengeClient {
    /**
     * Called by the orchestrator to let the client know of a valid value
     */
    onValidValue: ValueCallback;
    /**
     * Called by the orchestrator to let the client know of an invalid value
     */
    onInvalidValue: ValueCallback;
    /**
     * Called by the orchestrator to let the client know the challenge has completed
     * successfully.
     */
    onComplete: () => void;
    /**
     * Called by the orchestrator to let the client know the challenge was canceled
     */
    onCancel: () => void;
    /**
     * Signatures for these functions match exactly the signatures
     * of the instance methods in this class.
     */
    constructor(onValidValue?: ValueCallback, onInvalidValue?: ValueCallback, onComplete?: () => void, onCancel?: () => void);
}
export declare class ChallengeOperation {
    challenge: Challenge;
    validate: boolean;
    validValues: ChallengeValue[];
    invalidValues: ChallengeValue[];
    artifacts: ChallengeArtifacts;
    client: ChallengeClient;
    private resolve;
    orchestrator: ChallengeOrchestrator;
    constructor(challenge: Challenge, validate: boolean);
    /**
     * Sets the promise resolve function to be called
     * when this challenge completes or cancels
     */
    setResolver(resolve: (response: ChallengeResponse) => void): void;
    /**
     * Mark this challenge as complete, triggering the resolve function,
     * as well as notifying the client
     */
    complete(response?: ChallengeResponse): void;
    /**
     * Mark this challenge as canceled, triggering the resolve function with a null response,
     * as well as notifying the client.
     */
    cancel(): void;
    /**
     * @returns Returns true if the challenge has received all valid responses
     */
    isFinished(): boolean;
    /**
     * Called by challenge orchestrator to set up the orchestrator object.
     * This object will be used by the client to communicate with us.
     */
    setOrchestratorFunctions(setClientFunctions: SetClientFunctionsFunction, setValidationStatus: SetValidationStatusFunction, submitValues: SubmitValuesFunction, cancel: () => void): void;
    /**
     * Sets the values validation status, as well as handles subsequent actions,
     * such as completing the operation if all valid values are supplied, as well as
     * notifying the client of this new value's validation status.
     */
    setValueStatus(value: ChallengeValue, valid: boolean, artifacts?: ChallengeArtifacts): void;
}
export declare class ChallengeService extends PureService {
    private storageService?;
    private protocolService?;
    private challengeOperations;
    challengeHandler?: ChallengeHandler;
    constructor(storageService: SNStorageService, protocolService: SNProtocolService);
    /** @override */
    deinit(): void;
    /**
     * @param orchestratorFill - An empty object which will be populated with
     * a .orchestrator property. The caller uses this funtion to communicate with us
     * via a selective API.
     */
    promptForChallengeResponse(challenge: Challenge, validate?: boolean, orchestratorFill?: OrchestratorFill): Promise<ChallengeResponse>;
    validateChallengeValue(value: ChallengeValue): Promise<ChallengeValidationResponse>;
    getLaunchChallenge(): Promise<Challenge | null>;
    isPasscodeLocked(): Promise<boolean>;
    enableBiometrics(): Promise<void>;
    private createChallengeOperation;
    private getChallengeOperation;
    private setChallengeOperation;
    private deleteChallengeOperation;
    private cancelChallenge;
    private submitValuesForChallenge;
    private setValidationStatusForChallenge;
}
export {};
