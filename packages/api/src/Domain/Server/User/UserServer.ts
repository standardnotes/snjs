import { joinPaths } from '@standardnotes/utils'
import { HttpServiceInterface } from '../../Http/HttpServiceInterface'
import { UserRegistrationRequestParams } from '../../Request/User/UserRegistrationRequestParams'
import { UserRegistrationResponse } from '../../Response/User/UserRegistrationResponse'
import { Paths } from './Paths'
import { UserServerInterface } from './UserServerInterface'

export class UserServer implements UserServerInterface {
  constructor(private httpService: HttpServiceInterface, private host: string) {}

  async register(params: UserRegistrationRequestParams): Promise<UserRegistrationResponse> {
    const url = joinPaths(this.host, Paths.v1.register)

    const response = await this.httpService.postAbsolute(url, params)

    return response as UserRegistrationResponse
  }
}
