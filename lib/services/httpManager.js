import { getGlobalScope } from '@Lib/utils';

export class SFHttpManager {

  static getApiVersion() {
    // Applicable only to Standard Notes requests. Requests to external acitons should not use this.
    // syncManager and authManager must include this API version as part of its request params.
    return "20190520";
  }

  constructor(timeout, apiVersion) {
    // calling callbacks in a $timeout allows UI to update
    this.$timeout = timeout || setTimeout.bind(getGlobalScope());
  }

  setJWTRequestHandler(handler) {
    this.jwtRequestHandler = handler;
  }

  async setAuthHeadersForRequest(request) {
    var token = await this.jwtRequestHandler();
    if(token) {
      request.setRequestHeader('Authorization', 'Bearer ' + token);
    }
  }

  async postAbsolute(url, params, onsuccess, onerror) {
    return this.httpRequest("post", url, params, onsuccess, onerror);
  }

  async postAuthenticatedAbsolute(url, params, onsuccess, onerror) {
    return this.httpRequest("post", url, params, onsuccess, onerror, true);
  }

  async patchAbsolute(url, params, onsuccess, onerror) {
    return this.httpRequest("patch", url, params, onsuccess, onerror);
  }

  async getAbsolute(url, params, onsuccess, onerror) {
    return this.httpRequest("get", url, params, onsuccess, onerror);
  }

  async httpRequest(verb, url, params, onsuccess, onerror, authenticated = false) {
    return new Promise(async (resolve, reject) => {
        var xmlhttp = new XMLHttpRequest();

        xmlhttp.onreadystatechange = () => {
          if (xmlhttp.readyState == 4) {
            var response = xmlhttp.responseText;
            if(response) {
              try {
                response = JSON.parse(response);
              } catch(e) {}
            }

           if(xmlhttp.status >= 200 && xmlhttp.status <= 299){
             this.$timeout(function(){
               onsuccess(response);
               resolve(response);
             })
           } else {
             console.error("Request error:", response);
             this.$timeout(function(){
               onerror(response, xmlhttp.status)
               reject(response);
             })
           }
         }
        }

        if(verb == "get" && Object.keys(params).length > 0) {
          url = this.urlForUrlAndParams(url, params);
        }

        xmlhttp.open(verb, url, true);
        xmlhttp.setRequestHeader('Content-type', 'application/json');

        if(authenticated) {
          await this.setAuthHeadersForRequest(xmlhttp);
        }

        if(verb == "post" || verb == "patch") {
          xmlhttp.send(JSON.stringify(params));
        } else {
          xmlhttp.send();
        }
    })
  }

  urlForUrlAndParams(url, params) {
    let keyValueString = Object.keys(params).map((key) => {
      return key + "=" + encodeURIComponent(params[key])
    }).join("&");

    if(url.includes("?")) {
      return url + "&" + keyValueString;
    } else {
      return url + "?" + keyValueString;
    }
  }

}
