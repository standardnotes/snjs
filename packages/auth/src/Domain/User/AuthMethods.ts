import { Uuid } from '../Uuid/Uuid'

export type AuthMethods = {
  totp?: {
    mfaSecretUuid: Uuid,
  },
}
