import { SNProtocolService } from '../protocol_service';
import { SNStorageService } from '../storage_service';
import { PureService } from '../../../../services/pure_service';
import { Challenge, ChallengeArtifacts, ChallengeReason, ChallengeResponse, ChallengeValue } from '../../../../challenges';
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
    private storageService;
    private protocolService;
    private challengeOperations;
    sendChallenge?: (challenge: Challenge) => void;
    private challengeObservers;
    constructor(storageService: SNStorageService, protocolService: SNProtocolService);
    /** @override */
    deinit(): void;
    /**
     * Resolves when the challenge has been completed.
     * For non-validated challenges, will resolve when the first value is submitted.
     */
    promptForChallengeResponse(challenge: Challenge): Promise<ChallengeResponse | undefined>;
    validateChallengeValue(value: ChallengeValue): Promise<ChallengeValidationResponse>;
    promptForCorrectPasscode(reason: ChallengeReason): Promise<string | undefined>;
    /**
     * Returns the wrapping key for operations that require resaving the root key
     * (changing the account password, signing in, registering, or upgrading protocol)
     * Returns empty object if no passcode is configured.
     * Otherwise returns {cancled: true} if the operation is canceled, or
     * {wrappingKey} with the result.
     * @param passcode - If the consumer already has access to the passcode,
     * they can pass it here so that the user is not prompted again.
     */
    getWrappingKeyIfApplicable(passcode?: string): Promise<{
        canceled?: undefined;
        wrappingKey?: undefined;
    } | {
        canceled: boolean;
        wrappingKey?: undefined;
    } | {
        wrappingKey: import("../..").SNRootKey;
        canceled?: undefined;
    }>;
    isPasscodeLocked(): Promise<boolean>;
    addChallengeObserver(challenge: Challenge, observer: ChallengeObserver): () => void;
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
    completeChallenge(challenge: Challenge): void;
    submitValuesForChallenge(challenge: Challenge, values: ChallengeValue[]): Promise<void>;
    setValidationStatusForChallenge(challenge: Challenge, value: ChallengeValue, valid: boolean, artifacts?: ChallengeArtifacts): void;
}
export {};
