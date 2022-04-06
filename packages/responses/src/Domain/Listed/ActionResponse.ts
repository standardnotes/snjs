import { AnyKeyParamsContent, ContentType } from '@standardnotes/common'
import { Action, EncryptedTransferPayload } from '@standardnotes/models'
import { HttpResponse } from '../Http/HttpResponse'

export type ActionResponse = HttpResponse & {
  description: string
  supported_types: ContentType[]
  deprecation?: string
  actions: Action[]
  item?: EncryptedTransferPayload
  keyParams?: AnyKeyParamsContent
  auth_params?: AnyKeyParamsContent
}
