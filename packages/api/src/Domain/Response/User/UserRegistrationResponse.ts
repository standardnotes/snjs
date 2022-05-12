import { KeyParamsData, SessionBody } from '@standardnotes/responses'

import { HttpErrorResponseBody } from '../../Http/HttpErrorResponseBody'
import { HttpResponse } from '../../Http/HttpResponse'

export interface UserRegistartionResponse extends HttpResponse {
  data:
    | HttpErrorResponseBody
    | {
        session: SessionBody
        key_params: KeyParamsData
        user: Record<string, unknown>
      }
}
