import { SNProtocolService } from "../protocol_service";
import { SNStorageService } from "../storage_service";
import { PureService } from "../pure_service";
import { Challenge, ChallengeResponse, ChallengeValue, ChallengeArtifacts } from "../../challenges";
declare type ChallengeValidationResponse = {
    valid: boolean;
    artifacts?: ChallengeArtifacts;
};
export declare type ValueCallback = (value: ChallengeValue) => void;
/**
 * The challenge service creates, updates and keeps track of running challenge operations.
 */
export declare class ChallengeService extends PureService {
    private storageService?;
    private protocolService?;
    private challengeOperations;
    sendChallenge?: (challenge: Challenge) => void;
    constructor(storageService: SNStorageService, protocolService: SNProtocolService);
    /** @override */
    deinit(): void;
    /**
     * Resolves when the challenge has been completed.
     */
    promptForChallengeResponse(challenge: Challenge): Promise<ChallengeResponse | null>;
    /**
     * Resolves when the user has submitted values which the caller can use
     * to run custom validations.
     */
    promptForChallengeResponseWithCustomValidation(challenge: Challenge): Promise<ChallengeValue[]>;
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
    setChallengeCallbacks(challenge: Challenge, onValidValue?: ValueCallback, onInvalidValue?: ValueCallback, onComplete?: () => void, onCancel?: () => void): void;
    private createOrGetChallengeOperation;
    private getChallengeOperation;
    private deleteChallengeOperation;
    cancelChallenge(challenge: Challenge): void;
    submitValuesForChallenge(challenge: Challenge, values: ChallengeValue[]): Promise<void>;
    setValidationStatusForChallenge(challenge: Challenge, value: ChallengeValue, valid: boolean, artifacts?: ChallengeArtifacts): void;
}
export {};
