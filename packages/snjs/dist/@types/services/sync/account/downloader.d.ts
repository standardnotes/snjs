import { PurePayload } from '../../../protocol/payloads/pure_payload';
import { ContentType } from '../../../models/content_types';
import { SNApiService } from '../../api/api_service';
import { SNProtocolService } from '../../protocol_service';
export declare class AccountDownloader {
    private apiService;
    private protocolService;
    private contentType?;
    private customEvent?;
    private limit?;
    private progress;
    constructor(apiService: SNApiService, protocolService: SNProtocolService, contentType?: ContentType, customEvent?: string, limit?: number);
    /**
     * Executes a sync request with a blank sync token and high download limit. It will download all items,
     * but won't do anything with them other than decrypting and creating respective objects.
     */
    run(): Promise<PurePayload[]>;
}
