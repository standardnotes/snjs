import { SNRootKeyParams } from '@standardnotes/encryption'
import { UserRegistartionResponse } from '../../Response/User/UserRegistrationResponse'

export interface UserApiServiceInterface {
  register(
    email: string,
    serverPassword: string,
    keyParams: SNRootKeyParams,
    ephemeral: boolean,
  ): Promise<UserRegistartionResponse>
}
