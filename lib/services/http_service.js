import { PureService } from '@Lib/services/pure_service';
import { isString, isObject } from '@Lib/utils';

const HTTP_VERB_GET = 'get';
const HTTP_VERB_POST = 'post';
const HTTP_VERB_PATCH = 'patch';

const REQUEST_READY_STATE_COMPLETED = 4;
const HTTP_STATUS_MIN_SUCCESS = 200;
const HTTP_STATUS_MAX_SUCCESS = 299;

/**
 * A non-SNJS specific wrapper for XMLHttpRequests
 */
export class SNHttpService extends PureService {

  async getAbsolute({ url, params, authentication }) {
    return this.runHttp({ verb: HTTP_VERB_GET, url, params, authentication });
  }

  async postAbsolute({ url, params, authentication }) {
    return this.runHttp({ verb: HTTP_VERB_POST, url, params, authentication });
  }

  async patchAbsolute({ url, params, authentication }) {
    return this.runHttp({ verb: HTTP_VERB_PATCH, url, params, authentication });
  }

  async runHttp({ verb, url, params, authentication }) {
    const request = this.createRequest({
      verb,
      url,
      params,
      authentication
    });

    return this.runRequest({ request, verb, params });
  }

  createRequest({ verb, url, params, authentication }) {
    const request = new XMLHttpRequest();
    if (verb === HTTP_VERB_GET && Object.keys(params).length > 0) {
      url = this.urlForUrlAndParams(url, params);
    }
    request.open(verb, url, true);
    request.setRequestHeader('Content-type', 'application/json');
    if (authentication) {
      request.setRequestHeader('Authorization', 'Bearer ' + authentication);
    }
    return request;
  }

  async runRequest({ request, verb, params }) {
    return new Promise((resolve, reject) => {
      request.onreadystatechange = () => {
        this.stateChangeHandlerForRequest(request, resolve, reject);
      };
      if (verb === HTTP_VERB_POST || verb === HTTP_VERB_PATCH) {
        request.send(JSON.stringify(params));
      } else {
        request.send();
      }
    });
  }

  stateChangeHandlerForRequest(request, resolve, reject) {
    if (request.readyState !== REQUEST_READY_STATE_COMPLETED) {
      return;
    }
    let response = request.responseText;
    if (response) {
      try {
        response = JSON.parse(response);
        // eslint-disable-next-line no-empty
      } catch (e) { }
    }
    if (!isObject(response)) {
      response = {};
    }
    const httpStatus = request.status;
    if ((httpStatus >= HTTP_STATUS_MIN_SUCCESS
      && httpStatus <= HTTP_STATUS_MAX_SUCCESS)) {
      response.status = httpStatus;
      resolve(response);
    } else {
      console.error('Request error:', response);
      if (isString(response)) {
        response = { error: { message: response } };
      }
      response.status = httpStatus;
      reject(response);
    }
  }

  urlForUrlAndParams(url, params) {
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
