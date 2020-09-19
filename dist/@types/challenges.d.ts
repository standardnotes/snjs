import { SNRootKey } from './protocol/root_key';
export declare type ChallengeArtifacts = {
    wrappingKey?: SNRootKey;
    rootKey?: SNRootKey;
};
export declare enum ChallengeType {
    LocalPasscode = 1,
    AccountPassword = 2,
    Biometric = 3,
    Custom = 4
}
/** The source of the challenge */
export declare enum ChallengeReason {
    ApplicationUnlock = 1,
    ResaveRootKey = 2,
    ProtocolUpgrade = 3,
    Migration = 4,
    Custom = 5
}
/**
 * A challenge is a stateless description of what the client needs to provide
 * in order to proceed.
 */
export declare class Challenge {
    readonly types: ChallengeType[];
    readonly reason: ChallengeReason;
    readonly customPrompt?: string | undefined;
    readonly customReason?: string | undefined;
    readonly id: number;
    constructor(types: ChallengeType[], reason: ChallengeReason, customPrompt?: string | undefined, customReason?: string | undefined);
}
export declare class ChallengeValue {
    readonly type: ChallengeType;
    readonly value: string | boolean;
    constructor(type: ChallengeType, value: string | boolean);
}
export declare class ChallengeResponse {
    readonly challenge: Challenge;
    readonly values: ChallengeValue[];
    readonly artifacts?: ChallengeArtifacts | undefined;
    constructor(challenge: Challenge, values: ChallengeValue[], artifacts?: ChallengeArtifacts | undefined);
    getValueForType(type: ChallengeType): ChallengeValue;
    getDefaultValue(): ChallengeValue;
}
/**
 * @returns The UI-friendly title for this challenge
 */
export declare function challengeTypeToString(type: ChallengeType): string;
