import { SNRootKey } from './protocol/root_key';
export declare type ChallengeArtifacts = {
    wrappingKey?: SNRootKey;
    rootKey?: SNRootKey;
};
export declare enum ChallengeValidation {
    None = 0,
    LocalPasscode = 1,
    AccountPassword = 2,
    Biometric = 3,
    ProtectionSessionDuration = 4
}
/** The source of the challenge */
export declare enum ChallengeReason {
    ApplicationUnlock = 1,
    ResaveRootKey = 2,
    ProtocolUpgrade = 3,
    Migration = 4,
    Custom = 5,
    AccessProtectedNote = 6,
    ImportFile = 7,
    AddPasscode = 8,
    RemovePasscode = 9,
    ChangePasscode = 10,
    ChangeAutolockInterval = 11,
    CreateDecryptedBackupWithProtectedItems = 12,
    RevokeSession = 13,
    AccessCloudLink = 14,
    DecryptEncryptedFile = 15,
    ExportBackup = 16,
    DisableBiometrics = 17,
    UnprotectNote = 18,
    SearchProtectedNotesText = 19,
    SelectProtectedNote = 20,
    DisableMfa = 21
}
/** For mobile */
export declare enum ChallengeKeyboardType {
    Alphanumeric = "default",
    Numeric = "numeric"
}
/**
 * A challenge is a stateless description of what the client needs to provide
 * in order to proceed.
 */
export declare class Challenge {
    readonly prompts: ChallengePrompt[];
    readonly reason: ChallengeReason;
    readonly cancelable: boolean;
    readonly _heading?: string | undefined;
    readonly _subheading?: string | undefined;
    readonly id: number;
    constructor(prompts: ChallengePrompt[], reason: ChallengeReason, cancelable: boolean, _heading?: string | undefined, _subheading?: string | undefined);
    /** Outside of the modal, this is the title of the modal itself */
    get modalTitle(): string;
    /** Inside of the modal, this is the H1 */
    get heading(): string | undefined;
    /** Inside of the modal, this is the H2 */
    get subheading(): string | undefined;
    hasPromptForValidationType(type: ChallengeValidation): boolean;
}
declare type ChallengeRawValue = number | string | boolean;
/**
 * A Challenge can have many prompts. Each prompt represents a unique input,
 * such as a text field, or biometric scanner.
 */
export declare class ChallengePrompt {
    readonly validation: ChallengeValidation;
    readonly secureTextEntry: boolean;
    readonly keyboardType?: ChallengeKeyboardType | undefined;
    readonly initialValue?: string | number | boolean | undefined;
    readonly id: number;
    readonly placeholder: string;
    readonly title: string;
    readonly validates: boolean;
    constructor(validation: ChallengeValidation, title?: string, placeholder?: string, secureTextEntry?: boolean, keyboardType?: ChallengeKeyboardType | undefined, initialValue?: string | number | boolean | undefined);
}
export declare class ChallengeValue {
    readonly prompt: ChallengePrompt;
    readonly value: ChallengeRawValue;
    constructor(prompt: ChallengePrompt, value: ChallengeRawValue);
}
export declare class ChallengeResponse {
    readonly challenge: Challenge;
    readonly values: ChallengeValue[];
    readonly artifacts?: ChallengeArtifacts | undefined;
    constructor(challenge: Challenge, values: ChallengeValue[], artifacts?: ChallengeArtifacts | undefined);
    getValueForType(type: ChallengeValidation): ChallengeValue;
    getDefaultValue(): ChallengeValue;
}
export {};
