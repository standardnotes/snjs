import { SNProtocolService } from "../protocol_service";
import { SNStorageService } from "../storage_service";
import { PureService } from "../pure_service";
import { Challenge, ChallengeResponse, ChallengeValue, ChallengeArtifacts } from "../../challenges";
declare type ChallengeValidationResponse = {
    valid: boolean;
    artifacts?: ChallengeArtifacts;
};
export declare type ValueCallback = (value: ChallengeValue) => void;
export declare type ChallengeObserver = {
    onValidValue?: ValueCallback;
    onInvalidValue?: ValueCallback;
    onNonvalidatedSubmit?: (response: ChallengeResponse) => void;
    onComplete?: (response: ChallengeResponse) => void;
    onCancel?: () => void;
};
/**
 * The challenge service creates, updates and keeps track of running challenge operations.
 */
export declare class ChallengeService extends PureService {
    private storageService?;
    private protocolService?;
    private challengeOperations;
    sendChallenge?: (challenge: Challenge) => void;
    private challengeObservers;
    constructor(storageService: SNStorageService, protocolService: SNProtocolService);
    /** @override */
    deinit(): void;
    /**
     * Resolves when the challenge has been completed.
     */
    promptForChallengeResponse(challenge: Challenge): Promise<ChallengeResponse | undefined>;
    validateChallengeValue(value: ChallengeValue): Promise<ChallengeValidationResponse>;
    getLaunchChallenge(): Promise<Challenge | null>;
    promptForPasscode(): Promise<{
        canceled: boolean;
        passcode: undefined;
    } | {
        passcode: string;
        canceled: boolean;
    }>;
    isPasscodeLocked(): Promise<boolean>;
    hasBiometricsEnabled(): Promise<boolean>;
    enableBiometrics(): Promise<void>;
    disableBiometrics(): Promise<void>;
    addChallengeObserver(challenge: Challenge, observer: ChallengeObserver): void;
    private createOrGetChallengeOperation;
    private performOnObservers;
    private onChallengeValidValue;
    private onChallengeInvalidValue;
    private onChallengeNonvalidatedSubmit;
    private onChallengeComplete;
    private onChallengeCancel;
    private getChallengeOperation;
    private deleteChallengeOperation;
    cancelChallenge(challenge: Challenge): void;
    submitValuesForChallenge(challenge: Challenge, values: ChallengeValue[]): Promise<void>;
    setValidationStatusForChallenge(challenge: Challenge, value: ChallengeValue, valid: boolean, artifacts?: ChallengeArtifacts): void;
}
export {};
