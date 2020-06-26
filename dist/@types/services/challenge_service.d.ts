import { SNProtocolService } from './protocol_service';
import { SNStorageService } from './storage_service';
import { PureService } from './pure_service';
import { Challenge, ChallengeResponse, ChallengeValue, ChallengeArtifacts } from '../challenges';
declare type ChallengeValidationResponse = {
    valid: boolean;
    artifacts?: ChallengeArtifacts;
};
declare type ChallengeHandler = (challenge: Challenge) => void;
export declare type SetValidationStatusFunction = (value: ChallengeValue, valid: boolean, artifacts?: ChallengeArtifacts) => void;
export declare type ValueCallback = (value: ChallengeValue) => void;
/** The client gives this object to the orchestrator */
export declare class ChallengeClient {
    onValidValue: ValueCallback;
    onInvalidValue: ValueCallback;
    onComplete: () => void;
    onCancel: () => void;
    constructor(onValidValue?: ValueCallback, onInvalidValue?: ValueCallback, onComplete?: () => void, onCancel?: () => void);
}
export declare class ChallengeOperation {
    challenge: Challenge;
    validate: boolean;
    private resolve;
    private validValues;
    private invalidValues;
    private artifacts;
    client: ChallengeClient;
    /**
     * @param resolve the promise resolve function to be called
     * when this challenge completes or cancels
     */
    constructor(challenge: Challenge, validate: boolean, resolve: (response: ChallengeResponse | null) => void);
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
    promptForChallengeResponse(challenge: Challenge, validate?: true): Promise<ChallengeResponse>;
    promptForChallengeResponse(challenge: Challenge, validate: false): Promise<[ChallengeResponse, SetValidationStatusFunction]>;
    validateChallengeValue(value: ChallengeValue): Promise<ChallengeValidationResponse>;
    getLaunchChallenge(): Promise<Challenge | null>;
    isPasscodeLocked(): Promise<boolean>;
    enableBiometrics(): Promise<void>;
    setChallengeCallbacks(challenge: Challenge, onValidValue?: ValueCallback, onInvalidValue?: ValueCallback, onComplete?: () => void, onCancel?: () => void): void;
    private createChallengeOperation;
    private getChallengeOperation;
    private deleteChallengeOperation;
    cancelChallenge(challenge: Challenge): void;
    submitValuesForChallenge(challenge: Challenge, values: ChallengeValue[]): Promise<void>;
    private setValidationStatusForChallenge;
}
export {};
