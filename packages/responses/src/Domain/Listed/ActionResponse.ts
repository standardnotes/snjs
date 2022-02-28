/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpResponse } from '../Http/HttpResponse'

export type ActionResponse = HttpResponse & {
  description: string
  supported_types: string[]
  deprecation?: string
  actions: any[]
  item?: any
  keyParams?: any
  auth_params?: any
}
