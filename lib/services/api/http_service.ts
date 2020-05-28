import { PureService } from '@Lib/services/pure_service';
import { isString, isObject } from '@Lib/utils';

export enum HttpVerb {
  Get = 'get',
  Post = 'post',
  Patch = 'patch'
}

export type HttpResponse = {
  status: number
  error?: any
  [key: string]: any
}

const REQUEST_READY_STATE_COMPLETED = 4;
const HTTP_STATUS_MIN_SUCCESS = 200;
const HTTP_STATUS_MAX_SUCCESS = 299;
const HTTP_STATUS_EXPIRED_ACCESS_TOKEN = 498;

type HttpParams = Record<string, any>

export type HttpRequest = {
  url: string,
  params?: HttpParams,
  verb: HttpVerb,
  authentication?: string
}

/**
 * A non-SNJS specific wrapper for XMLHttpRequests
 */
export class SNHttpService extends PureService {

  public async getAbsolute(
    url: string,
    params?: HttpParams,
    authentication?: string
  ): Promise<HttpResponse> {
    return this.runHttp({ url, params, verb: HttpVerb.Get, authentication });
  }

  public async postAbsolute(
    url: string,
    params?: HttpParams,
    authentication?: string
  ): Promise<HttpResponse> {
    return this.runHttp({ url, params, verb: HttpVerb.Post, authentication });
  }

  public async patchAbsolute(
    url: string,
    params: HttpParams,
    authentication?: string
  ): Promise<HttpResponse> {
    return this.runHttp({ url, params, verb: HttpVerb.Patch, authentication });
  }

  public async runHttp(httpRequest: HttpRequest): Promise<HttpResponse> {
    const request = this.createXmlRequest(httpRequest);
    return this.runRequest(request, httpRequest.verb, httpRequest.params);
  }

  private createXmlRequest(httpRequest: HttpRequest) {
    const request = new XMLHttpRequest();
    if (
      httpRequest.params &&
      httpRequest.verb === HttpVerb.Get
      && Object.keys(httpRequest.params).length > 0
    ) {
      httpRequest.url = this.urlForUrlAndParams(httpRequest.url, httpRequest.params);
    }
    request.open(httpRequest.verb, httpRequest.url, true);
    request.setRequestHeader('Content-type', 'application/json');
    if (httpRequest.authentication) {
      request.setRequestHeader('Authorization', 'Bearer ' + httpRequest.authentication);
    }
    return request;
  }

  private async runRequest(
    request: XMLHttpRequest,
    verb: HttpVerb,
    params?: HttpParams
  ): Promise<HttpResponse> {
    return new Promise((resolve, reject) => {
      request.onreadystatechange = () => {
        this.stateChangeHandlerForRequest(request, resolve, reject);
      };
      if (verb === HttpVerb.Post || verb === HttpVerb.Patch) {
        request.send(JSON.stringify(params));
      } else {
        request.send();
      }
    });
  }

  private stateChangeHandlerForRequest(
    request: XMLHttpRequest,
    resolve: any,
    reject: any
  ) {
    if (request.readyState !== REQUEST_READY_STATE_COMPLETED) {
      return;
    }
    const httpStatus = request.status;
    let response: HttpResponse = {
      status: httpStatus
    }
    try {
      const body = JSON.parse(request.responseText)
      Object.assign(response, body);
    } catch (error) { }
    if ((httpStatus >= HTTP_STATUS_MIN_SUCCESS
      && httpStatus <= HTTP_STATUS_MAX_SUCCESS)) {
      resolve(response);
    } else {
      if (!response.error) {
        response.error = { status: httpStatus };
      }
      reject(response);
    }
  }

  private urlForUrlAndParams(url: string, params: HttpParams) {
    const keyValueString = Object.keys(params).map((key) => {
      return key + '=' + encodeURIComponent(params[key]);
    }).join('&');

    if (url.includes('?')) {
      return url + '&' + keyValueString;
    } else {
      return url + '?' + keyValueString;
    }
  }

  public isErrorResponseExpiredToken(errorResponse: HttpResponse) {
    return errorResponse.status === HTTP_STATUS_EXPIRED_ACCESS_TOKEN;
  }

}
