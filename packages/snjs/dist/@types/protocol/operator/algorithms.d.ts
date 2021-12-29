export declare const V001Algorithm: Readonly<{
    SaltSeedLength: number;
    /**
     * V001 supported a variable PBKDF2 cost
     */
    PbkdfMinCost: number;
    PbkdfCostsUsed: number[];
    PbkdfOutputLength: number;
    EncryptionKeyLength: number;
}>;
export declare const V002Algorithm: Readonly<{
    SaltSeedLength: number;
    /**
     * V002 supported a variable PBKDF2 cost
     */
    PbkdfMinCost: number;
    /**
     * While some 002 accounts also used costs in V001.PbkdfCostsUsed,
     * the vast majority used costs >= 100,000
     */
    PbkdfCostsUsed: number[];
    /** Possible costs used, but statistically more likely these were 001 accounts */
    ImprobablePbkdfCostsUsed: number[];
    PbkdfOutputLength: number;
    EncryptionKeyLength: number;
    EncryptionIvLength: number;
}>;
export declare enum V003Algorithm {
    SaltSeedLength = 256,
    PbkdfCost = 110000,
    PbkdfOutputLength = 768,
    EncryptionKeyLength = 256,
    EncryptionIvLength = 128
}
export declare enum V004Algorithm {
    ArgonSaltSeedLength = 256,
    ArgonSaltLength = 128,
    ArgonIterations = 5,
    ArgonMemLimit = 67108864,
    ArgonOutputKeyBytes = 64,
    EncryptionKeyLength = 256,
    EncryptionNonceLength = 192
}
