import { HttpResponse, MinimalHttpResponse } from '@standardnotes/responses'

export interface UserApi {
  deleteAccount(userUuid: string): Promise<HttpResponse | MinimalHttpResponse>
}
