import { SNRootKey } from './protocol/root_key';
export declare type ChallengeArtifacts = {
    wrappingKey?: SNRootKey;
    rootKey?: SNRootKey;
};
export declare enum ChallengeType {
    LocalPasscode = 1,
    AccountPassword = 2,
    Biometric = 3
}
/** The source of the challenge */
export declare enum ChallengeReason {
    ApplicationUnlock = 1,
    ResaveRootKey = 2,
    ProtocolUpgrade = 3,
    Migration = 4
}
export declare class Challenge {
    types: ChallengeType[];
    reason: ChallengeReason;
    id: any;
    constructor(types: ChallengeType[], reason: ChallengeReason);
}
export declare class ChallengeValue {
    type: ChallengeType;
    value: string | boolean;
    constructor(type: ChallengeType, value: string | boolean);
}
export declare class ChallengeResponse {
    challenge: Challenge;
    values: ChallengeValue[];
    artifacts?: ChallengeArtifacts;
    constructor(challenge: Challenge, values: ChallengeValue[], artifacts?: ChallengeArtifacts);
    getValueForType(type: ChallengeType): ChallengeValue;
}
/**
 * @returns The UI-friendly title for this challenge
 */
export declare function challengeTypeToString(type: ChallengeType): string;
