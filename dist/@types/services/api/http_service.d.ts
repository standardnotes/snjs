import { PureService } from '../pure_service';
export declare type HttpResponse = {
    status: number;
    error?: any;
    [key: string]: any;
};
declare type Params = Record<string, any>;
/**
 * A non-SNJS specific wrapper for XMLHttpRequests
 */
export declare class SNHttpService extends PureService {
    getAbsolute(url: string, params?: Params, authentication?: string): Promise<HttpResponse>;
    postAbsolute(url: string, params?: Params, authentication?: string): Promise<HttpResponse>;
    patchAbsolute(url: string, params: Params, authentication?: string): Promise<HttpResponse>;
    private runHttp;
    private createRequest;
    private runRequest;
    private stateChangeHandlerForRequest;
    private urlForUrlAndParams;
}
export {};
