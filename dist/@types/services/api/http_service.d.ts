import { PureService } from '../pure_service';
import { HttpResponse } from './responses';
export declare enum HttpVerb {
    Get = "get",
    Post = "post",
    Patch = "patch"
}
declare type HttpParams = Record<string, any>;
export declare type HttpRequest = {
    url: string;
    params?: HttpParams;
    verb: HttpVerb;
    authentication?: string;
};
/**
 * A non-SNJS specific wrapper for XMLHttpRequests
 */
export declare class SNHttpService extends PureService {
    getAbsolute(url: string, params?: HttpParams, authentication?: string): Promise<HttpResponse>;
    postAbsolute(url: string, params?: HttpParams, authentication?: string): Promise<HttpResponse>;
    patchAbsolute(url: string, params: HttpParams, authentication?: string): Promise<HttpResponse>;
    runHttp(httpRequest: HttpRequest): Promise<HttpResponse>;
    private createXmlRequest;
    private runRequest;
    private stateChangeHandlerForRequest;
    private urlForUrlAndParams;
}
export {};
