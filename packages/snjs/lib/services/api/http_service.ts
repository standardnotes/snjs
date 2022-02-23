import { API_MESSAGE_RATE_LIMITED, UNKNOWN_ERROR } from './messages';
import { HttpResponse, StatusCode } from './responses';
import { isNullOrUndefined, isString } from '@standardnotes/utils';
import { SnjsVersion } from '@Lib/version';
import { Environment } from '@Lib/platforms';
import { AbstractService } from '@standardnotes/services';

export enum HttpVerb {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Patch = 'PATCH',
  Delete = 'DELETE',
}

export enum ErrorTag {
  RevokedSession = 'revoked-session',
}

const REQUEST_READY_STATE_COMPLETED = 4;

export type HttpParams = Record<string, unknown>;

export type HttpRequest = {
  url: string;
  params?: HttpParams;
  verb: HttpVerb;
  authentication?: string;
  customHeaders?: Record<string, string>[];
  responseType?: XMLHttpRequestResponseType;
};

/**
 * A non-SNJS specific wrapper for XMLHttpRequests
 */
export class SNHttpService extends AbstractService {
  constructor(
    private readonly environment: Environment,
    private readonly appVersion: string
  ) {
    super();
  }
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

  public async putAbsolute(
    url: string,
    params?: HttpParams,
    authentication?: string
  ): Promise<HttpResponse> {
    return this.runHttp({ url, params, verb: HttpVerb.Put, authentication });
  }

  public async patchAbsolute(
    url: string,
    params: HttpParams,
    authentication?: string
  ): Promise<HttpResponse> {
    return this.runHttp({ url, params, verb: HttpVerb.Patch, authentication });
  }

  public async deleteAbsolute(
    url: string,
    params?: HttpParams,
    authentication?: string
  ): Promise<HttpResponse> {
    return this.runHttp({ url, params, verb: HttpVerb.Delete, authentication });
  }

  public async runHttp(httpRequest: HttpRequest): Promise<HttpResponse> {
    const request = this.createXmlRequest(httpRequest);
    return this.runRequest(request, httpRequest.verb, httpRequest.params);
  }

  private createXmlRequest(httpRequest: HttpRequest) {
    const request = new XMLHttpRequest();
    if (
      httpRequest.params &&
      httpRequest.verb === HttpVerb.Get &&
      Object.keys(httpRequest.params).length > 0
    ) {
      httpRequest.url = this.urlForUrlAndParams(
        httpRequest.url,
        httpRequest.params
      );
    }
    request.open(httpRequest.verb, httpRequest.url, true);
    request.responseType = httpRequest.responseType ?? '';

    request.setRequestHeader('Content-type', 'application/json');
    request.setRequestHeader('X-SNJS-Version', SnjsVersion);

    const appVersionHeaderValue = `${Environment[this.environment]}-${
      this.appVersion
    }`;
    request.setRequestHeader('X-Application-Version', appVersionHeaderValue);

    if (httpRequest.authentication) {
      request.setRequestHeader(
        'Authorization',
        'Bearer ' + httpRequest.authentication
      );
    }

    if (httpRequest.customHeaders && httpRequest.customHeaders.length > 0) {
      httpRequest.customHeaders.forEach(({ key, value }) => {
        request.setRequestHeader(key, value);
      });
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
      if (
        verb === HttpVerb.Post ||
        verb === HttpVerb.Put ||
        verb === HttpVerb.Patch ||
        verb === HttpVerb.Delete
      ) {
        request.send(JSON.stringify(params));
      } else {
        request.send();
      }
    });
  }

  private stateChangeHandlerForRequest(
    request: XMLHttpRequest,
    resolve: (response: HttpResponse) => void,
    reject: (response: HttpResponse) => void
  ) {
    if (request.readyState !== REQUEST_READY_STATE_COMPLETED) {
      return;
    }
    const httpStatus = request.status;
    const response: HttpResponse = {
      status: httpStatus,
      headers: new Map<string, string | null>(),
    };

    const responseHeaderLines = request
      .getAllResponseHeaders()
      .trim()
      .split(/[\r\n]+/);
    responseHeaderLines.forEach((responseHeaderLine) => {
      const parts = responseHeaderLine.split(': ');
      const name = parts.shift() as string;
      const value = parts.join(': ');

      (<Map<string, string | null>>response.headers).set(name, value);
    });

    try {
      if (httpStatus !== StatusCode.HttpStatusNoContent) {
        let body;

        const contentTypeHeader =
          response.headers?.get('content-type') ||
          response.headers?.get('Content-Type');

        if (contentTypeHeader?.includes('application/json')) {
          body = JSON.parse(request.responseText);
        } else {
          body = request.response;
        }
        /**
         * v0 APIs do not have a `data` top-level object. In such cases, mimic
         * the newer response body style by putting all the top-level
         * properties inside a `data` object.
         */
        if (!body.data) {
          response.data = body;
        }
        if (!isString(body)) {
          Object.assign(response, body);
        }
      }
    } catch (error) {
      console.error(error);
    }
    if (
      httpStatus >= StatusCode.HttpStatusMinSuccess &&
      httpStatus <= StatusCode.HttpStatusMaxSuccess
    ) {
      resolve(response);
    } else {
      if (httpStatus === StatusCode.HttpStatusForbidden) {
        response.error = {
          message: API_MESSAGE_RATE_LIMITED,
          status: httpStatus,
        };
      } else if (isNullOrUndefined(response.error)) {
        if (
          isNullOrUndefined(response.data) ||
          isNullOrUndefined(response.data.error)
        ) {
          response.error = { message: UNKNOWN_ERROR, status: httpStatus };
        } else {
          response.error = response.data.error;
        }
      }
      reject(response);
    }
  }

  private urlForUrlAndParams(url: string, params: HttpParams) {
    const keyValueString = Object.keys(params)
      .map((key) => {
        return key + '=' + encodeURIComponent(params[key] as string);
      })
      .join('&');

    if (url.includes('?')) {
      return url + '&' + keyValueString;
    } else {
      return url + '?' + keyValueString;
    }
  }
}
