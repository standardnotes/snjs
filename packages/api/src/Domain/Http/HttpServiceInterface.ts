import { HttpRequestParams } from './HttpRequestParams'
import { HttpResponse } from './HttpResponse'

export interface HttpServiceInterface {
  getAbsolute(url: string, params?: HttpRequestParams, authentication?: string): Promise<HttpResponse>
  postAbsolute(url: string, params?: HttpRequestParams, authentication?: string): Promise<HttpResponse>
  putAbsolute(url: string, params?: HttpRequestParams, authentication?: string): Promise<HttpResponse>
  patchAbsolute(url: string, params: HttpRequestParams, authentication?: string): Promise<HttpResponse>
  deleteAbsolute(url: string, params?: HttpRequestParams, authentication?: string): Promise<HttpResponse>
}
