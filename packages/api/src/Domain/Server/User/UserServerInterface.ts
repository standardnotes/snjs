import { UserRegistrationRequestParams } from '../../Request/User/UserRegistrationRequestParams'
import { UserRegistartionResponse } from '../../Response/User/UserRegistrationResponse'

export interface UserServerInterface {
  register(params: UserRegistrationRequestParams): Promise<UserRegistartionResponse>
}
