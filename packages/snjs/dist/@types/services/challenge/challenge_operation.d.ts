import { Challenge, ChallengeArtifacts, ChallengeResponse, ChallengeValue } from '../../challenges';
import { ValueCallback } from './challenge_service';
/**
 * A challenge operation stores user-submitted values and callbacks.
 * When its values are updated, it will trigger the associated callbacks (valid/invalid/complete)
 */
export declare class ChallengeOperation {
    challenge: Challenge;
    onValidValue: ValueCallback;
    onInvalidValue: ValueCallback;
    onNonvalidatedSubmit: (response: ChallengeResponse) => void;
    onComplete: (response: ChallengeResponse) => void;
    onCancel: () => void;
    private nonvalidatedValues;
    private validValues;
    private invalidValues;
    private artifacts;
    /**
     * @param resolve the promise resolve function to be called
     * when this challenge completes or cancels
     */
    constructor(challenge: Challenge, onValidValue: ValueCallback, onInvalidValue: ValueCallback, onNonvalidatedSubmit: (response: ChallengeResponse) => void, onComplete: (response: ChallengeResponse) => void, onCancel: () => void);
    /**
     * Mark this challenge as complete, triggering the resolve function,
     * as well as notifying the client
     */
    complete(response?: ChallengeResponse): void;
    nonvalidatedSubmit(): void;
    cancel(): void;
    /**
     * @returns Returns true if the challenge has received all valid responses
     */
    isFinished(): boolean;
    private nonvalidatedPrompts;
    addNonvalidatedValue(value: ChallengeValue): void;
    /**
     * Sets the values validation status, as well as handles subsequent actions,
     * such as completing the operation if all valid values are supplied, as well as
     * notifying the client of this new value's validation status.
     */
    setValueStatus(value: ChallengeValue, valid: boolean, artifacts?: ChallengeArtifacts): void;
}
