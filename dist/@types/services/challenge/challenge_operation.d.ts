import { Challenge, ChallengeResponse, ChallengeValue, ChallengeArtifacts } from "../../challenges";
import { ValueCallback } from "./challenge_service";
/**
 * A challenge operation stores user-submitted values and callbacks.
 * When its values are updated, it will trigger the associated callbacks (valid/invalid/complete)
 */
export declare class ChallengeOperation {
    challenge: Challenge;
    resolve?: ((response: ChallengeResponse | null) => void) | undefined;
    private validValues;
    private invalidValues;
    private artifacts;
    customValidator?: (values: ChallengeValue[]) => void;
    onValidValue?: ValueCallback;
    onInvalidValue?: ValueCallback;
    onComplete?: () => void;
    onCancel?: () => void;
    /**
     * @param resolve the promise resolve function to be called
     * when this challenge completes or cancels
     */
    constructor(challenge: Challenge, resolve?: ((response: ChallengeResponse | null) => void) | undefined);
    /**
     * Mark this challenge as complete, triggering the resolve function,
     * as well as notifying the client
     */
    complete(response?: ChallengeResponse): void;
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
