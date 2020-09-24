import { HttpResponse } from './api/responses';
import { Action } from './../models/app/action';
import { ItemManager } from './item_manager';
import { SNActionsExtension } from './../models/app/extension';
import { SNItem } from '../models/core/item';
import { SNSyncService } from './sync/sync_service';
import { SNProtocolService } from './protocol_service';
import { PayloadManager } from './model_manager';
import { SNHttpService } from './api/http_service';
import { SNAlertService } from './alert_service';
import { PureService } from './pure_service';
import { DeviceInterface } from '../device_interface';
export declare type ActionResponse = HttpResponse & {
    description: string;
    supported_types: string[];
    actions: any[];
    item?: any;
    keyParams?: any;
    auth_params?: any;
};
declare type PasswordRequestHandler = () => Promise<string>;
/**
 * The Actions Service allows clients to interact with action-based extensions.
 * Action-based extensions are mostly RESTful actions that can push a local value or
 * retrieve a remote value and act on it accordingly.
 * There are 4 action types:
 * `get`: performs a GET request on an endpoint to retrieve an item value, and merges the
 *      value onto the local item value. For example, you can GET an item's older revision
 *      value and replace the current value with the revision.
 * `render`: performs a GET request, and displays the result in the UI. This action does not
 *         affect data unless action is taken explicitely in the UI after the data is presented.
 * `show`: opens the action's URL in a browser.
 * `post`: sends an item's data to a remote service. This is used for example by Listed
 *       to allow publishing a note to a user's blog.
 */
export declare class SNActionsService extends PureService {
    private alertService?;
    private httpService?;
    private modelManager?;
    private itemManager?;
    private protocolService?;
    private syncService?;
    private previousPasswords;
    constructor(itemManager: ItemManager, alertService: SNAlertService, deviceInterface: DeviceInterface, httpService: SNHttpService, modelManager: PayloadManager, protocolService: SNProtocolService, syncService: SNSyncService);
    /** @override */
    deinit(): void;
    getExtensions(): SNActionsExtension[];
    extensionsInContextOfItem(item: SNItem): SNActionsExtension[];
    /**
     * Loads an extension in the context of a certain item.
     * The server then has the chance to respond with actions that are
     * relevant just to this item. The response extension is not saved,
     * just displayed as a one-time thing.
    */
    loadExtensionInContextOfItem(extension: SNActionsExtension, item: SNItem): Promise<SNActionsExtension | undefined>;
    runAction(action: Action, item: SNItem, passwordRequestHandler: PasswordRequestHandler): Promise<ActionResponse>;
    private handleGetAction;
    private runConfirmedGetAction;
    private handleRenderAction;
    private payloadByDecryptingResponse;
    private handlePostAction;
    private handleShowAction;
    private outgoingPayloadForItem;
}
export {};
