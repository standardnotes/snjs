import { ErrorTag } from './ErrorTag'
import { HttpStatusCode } from './HttpStatusCode'

export type HttpErrorResponseBody = {
  message: string
  status: HttpStatusCode
  tag?: ErrorTag
}
