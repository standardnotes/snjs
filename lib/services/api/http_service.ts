import { PureService } from '@Lib/services/pure_service';
import { isString, isObject } from '@Lib/utils';

enum HttpVerb {
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

type Params = Record<string, any>

/**
 * A non-SNJS specific wrapper for XMLHttpRequests
 */
export class SNHttpService extends PureService {

  public async getAbsolute(
    url: string,
    params?: Params,
    authentication?: string
  ): Promise<HttpResponse> {
    return this.runHttp(HttpVerb.Get, url, params, authentication);
  }

  public async postAbsolute(
    url: string,
    params?: Params,
    authentication?: string
  ): Promise<HttpResponse> {
    return this.runHttp(HttpVerb.Post, url, params, authentication);
  }

  public async patchAbsolute(
    url: string,
    params: Params,
    authentication?: string
  ): Promise<HttpResponse> {
    return this.runHttp(HttpVerb.Patch, url, params, authentication);
  }

  private async runHttp(
    verb: HttpVerb,
    url: string,
    params?: Params,
    authentication?: string
  ): Promise<HttpResponse> {
    const request = this.createRequest(
      verb,
      url,
      params,
      authentication
    );
    return this.runRequest(request, verb, params);
  }

  private createRequest(
    verb: HttpVerb,
    url: string,
    params?: Params,
    authentication?: string
  ) {
    const request = new XMLHttpRequest();
    if (
      params &&
      verb === HttpVerb.Get
      && Object.keys(params).length > 0
    ) {
      url = this.urlForUrlAndParams(url, params);
    }
    request.open(verb, url, true);
    request.setRequestHeader('Content-type', 'application/json');
    if (authentication) {
      request.setRequestHeader('Authorization', 'Bearer ' + authentication);
    }
    return request;
  }

  private async runRequest(
    request: XMLHttpRequest,
    verb: HttpVerb,
    params?: Params
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

  private urlForUrlAndParams(url: string, params: Params) {
    const keyValueString = Object.keys(params).map((key) => {
      return key + '=' + encodeURIComponent(params[key]);
    }).join('&');

    if (url.includes('?')) {
      return url + '&' + keyValueString;
    } else {
      return url + '?' + keyValueString;
    }
  }
}
