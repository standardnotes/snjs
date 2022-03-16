import { HttpResponse, MinimalHttpResponse } from '@standardnotes/responses'

export interface UserServerApi {
  deleteAccount(userUuid: string): Promise<HttpResponse | MinimalHttpResponse>
}
