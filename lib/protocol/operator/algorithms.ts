export enum V001Algorithm {
  SaltSeedLength = 128,
  PbkdfMinCost = 3000,
  PbkdfOutputLength = 512,
  EncryptionKeyLength = 256,
}

export enum V002Algorithm {
  SaltSeedLength = 128,
  PbkdfMinCost = 3000,
  PbkdfOutputLength = 768,
  EncryptionKeyLength = 256,
  EncryptionIvLength = 128,
}

export enum V003Algorithm {
  SaltSeedLength = 256,
  PbkdfCost = 110000,
  PbkdfOutputLength = 768,
  EncryptionKeyLength = 256,
  EncryptionIvLength = 128,
}

export enum V004Algorithm {
  ArgonSaltSeedLength = 256,
  ArgonSaltLength = 128,
  ArgonIterations = 5,
  ArgonMemLimit = 67108864,
  ArgonOutputKeyBytes = 64,
  EncryptionKeyLength = 256,
  EncryptionNonceLength = 192,
}