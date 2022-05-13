import { HttpErrorResponseBody } from '../../Http/HttpErrorResponseBody'
import { HttpResponse } from '../../Http/HttpResponse'
import { UserRegistartionResponseBody } from './UserRegistrationResponseBody'

export interface UserRegistartionResponse extends HttpResponse {
  data: UserRegistartionResponseBody | HttpErrorResponseBody
}
