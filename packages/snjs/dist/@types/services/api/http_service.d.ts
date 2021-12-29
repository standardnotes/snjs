import { HttpResponse } from './responses';
import { PureService } from '../pure_service';
import { Environment } from '../../platforms';
export declare enum HttpVerb {
    Get = "GET",
    Post = "POST",
    Put = "PUT",
    Patch = "PATCH",
    Delete = "DELETE"
}
export declare enum ErrorTag {
    RevokedSession = "revoked-session"
}
export declare type HttpParams = Record<string, unknown>;
export declare type HttpRequest = {
    url: string;
    params?: HttpParams;
    verb: HttpVerb;
    authentication?: string;
    customHeaders?: Record<string, string>[];
};
/**
 * A non-SNJS specific wrapper for XMLHttpRequests
 */
export declare class SNHttpService extends PureService {
    private readonly environment;
    private readonly appVersion;
    constructor(environment: Environment, appVersion: string);
    getAbsolute(url: string, params?: HttpParams, authentication?: string): Promise<HttpResponse>;
    postAbsolute(url: string, params?: HttpParams, authentication?: string): Promise<HttpResponse>;
    putAbsolute(url: string, params?: HttpParams, authentication?: string): Promise<HttpResponse>;
    patchAbsolute(url: string, params: HttpParams, authentication?: string): Promise<HttpResponse>;
    deleteAbsolute(url: string, params?: HttpParams, authentication?: string): Promise<HttpResponse>;
    runHttp(httpRequest: HttpRequest): Promise<HttpResponse>;
    private createXmlRequest;
    private runRequest;
    private stateChangeHandlerForRequest;
    private urlForUrlAndParams;
}
