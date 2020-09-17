import { PureService } from '../pure_service';
export declare enum HttpVerb {
    Get = "get",
    Post = "post",
    Patch = "patch"
}
export declare type HttpResponse = {
    status: number;
    error?: {
        message: string;
        status: number;
        tag?: string;
        /** In the case of MFA required responses,
         * the required prompt is returned as part of the error */
        payload?: {
            mfa_key?: string;
        };
    };
    object?: any;
    [key: string]: any;
};
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
    isErrorResponseExpiredToken(errorResponse: HttpResponse): boolean;
}
export {};
