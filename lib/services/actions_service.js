import { PayloadSources } from '@Payloads';
import { EncryptionIntents } from '@Protocol';
import { PureService } from '@Lib/services/pure_service';
import { ContentTypes, Action } from '@Models';
import { CreateMaxPayloadFromAnyObject } from '@Payloads/generator';

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
export class SNActionsService extends PureService {
  constructor({
    alertService,
    deviceInterface,
    httpService,
    modelManager,
    protocolService,
    syncService,
  }) {
    super();
    this.alertService = alertService;
    this.deviceInterface = deviceInterface;
    this.httpService = httpService;
    this.modelManager = modelManager;
    this.protocolService = protocolService;
    this.syncService = syncService;
    this.previousPasswords = [];
  }

  /** @override */
  deinit() {
    this.alertService = null;
    this.deviceInterface = null;
    this.httpService = null;
    this.modelManager = null;
    this.protocolService = null;
    this.syncService = null;
    this.previousPasswords.length = 0;
    super.deinit();
  }

  getExtensions() {
    return this.modelManager.validItemsForContentType(ContentTypes.ActionsExtension);
  }

  extensionsInContextOfItem(item) {
    return this.getExtensions().filter((ext) => {
      return ext.supported_types.includes(item.content_type) ||
        ext.actionsWithContextForItem(item).length > 0;
    });
  }

  /**
   * Loads an extension in the context of a certain item. 
   * The server then has the chance to respond with actions that are
   * relevant just to this item. The response extension is not saved, 
   * just displayed as a one-time thing.
  */
  async loadExtensionInContextOfItem(extension, item) {
    const params = {
      content_type: item.content_type,
      item_uuid: item.uuid
    };
    return this.httpService.getAbsolute({
      url: extension.url,
      params: params
    }).then((response) => {
      if (response.description) {
        extension.description = response.description;
      }
      if (response.supported_types) {
        extension.supported_types = response.supported_types;
      }
      if (response.actions) {
        extension.actions = response.actions.map((action) => {
          return new Action(action);
        });
      } else {
        extension.actions = [];
      }
      return extension;
    }).catch((response) => {
      console.error('Error loading extension', response);
      return null;
    });
  }

  async runAction({
    action,
    item,
    passwordRequestHandler
  }) {
    action.running = true;
    let result;
    switch (action.verb) {
      case 'get':
        result = await this.handleGetAction({ action, passwordRequestHandler });
        break;
      case 'render':
        result = await this.handleRenderAction({ action, passwordRequestHandler });
        break;
      case 'show':
        result = await this.handleShowAction(action);
        break;
      case 'post':
        result = await this.handlePostAction(action, item);
        break;
      default:
        break;
    }

    action.lastExecuted = new Date();
    action.running = false;
    return result;
  }

  async handleGetAction({ action, passwordRequestHandler }) {
    return new Promise((resolve, reject) => {
      this.alertService.confirm({
        text: "Are you sure you want to replace the current note contents with this action's results?",
        onConfirm: () => {
          this.runConfirmedGetAction({ action, passwordRequestHandler }).then(resolve);
        }
      });
    });
  }

  async runConfirmedGetAction({ action, passwordRequestHandler }) {
    const response = await this.httpService.getAbsolute({ url: action.url }).catch((response) => {
      const error = (response && response.error)
        || { message: 'An issue occurred while processing this action. Please try again.' };
      this.alertService.alert({ text: error.message });
      action.error = true;
      return { error: error };
    });
    if (response.error) {
      return response;
    }

    action.error = false;
    const payload = await this.payloadByDecryptingResponse({
      response,
      passwordRequestHandler
    });
    const items = await this.modelManager.mapPayload({
      payload: payload,
      source: PayloadSources.RemoteActionRetrieved
    });
    for (const mappedItem of items) {
      this.modelManager.setItemDirty(mappedItem, true);
    }
    this.syncService.sync();
    return {
      response: response,
      item: response.item
    };
  }

  async handleRenderAction({ action, passwordRequestHandler }) {
    return this.httpService.getAbsolute({ url: action.url }).then(async (response) => {
      action.error = false;
      const payload = await this.payloadByDecryptingResponse({
        response,
        passwordRequestHandler
      });
      if (payload) {
        const item = this.modelManager.createItem({
          contentType: payload.contentType,
          content: payload.content
        });
        return {
          response: response,
          item: item
        };
      }
    }).catch((response) => {
      const error = (response && response.error)
        || { message: 'An issue occurred while processing this action. Please try again.' };
      this.alertService.alert({ text: error.message });
      action.error = true;
      return { error: error };
    });
  }


  async payloadByDecryptingResponse({ response, key, passwordRequestHandler }) {
    const payload = CreateMaxPayloadFromAnyObject(response.item);
    const decryptedPayload = await this.protocolService.payloadByDecryptingPayload({
      payload: payload,
      key: key
    });
    if (!decryptedPayload.errorDecrypting) {
      return decryptedPayload;
    }
    if (!response.auth_params) {
      /**
       * In some cases revisions were missing auth params. 
       * Instruct the user to email us to get this remedied. 
       */
      this.alertService.alert({
        text: `We were unable to decrypt this revision using your current keys, 
            and this revision is missing metadata that would allow us to try different 
            keys to decrypt it. This can likely be fixed with some manual intervention. 
            Please email hello@standardnotes.org for assistance.`
      });
      return null;
    }
    /* Try previous passwords */
    const triedPasswords = [];
    for (const passwordCandidate of this.previousPasswords) {
      if (triedPasswords.includes(passwordCandidate)) {
        continue;
      }
      triedPasswords.push(passwordCandidate);
      const key = await this.protocolService.computeRootKey({
        password: passwordCandidate,
        keyParams: response.auth_params
      });
      if (!key) {
        continue;
      }
      const nestedResponse = await this.payloadByDecryptingResponse({
        response,
        key,
        passwordRequestHandler
      });
      if (nestedResponse) {
        return nestedResponse;
      }
    }
    /** Prompt for other passwords */
    const password = await passwordRequestHandler();
    this.previousPasswords.push(password);
    return this.payloadByDecryptingResponse({
      response,
      key,
      passwordRequestHandler
    });
  }

  async handlePostAction(action, item) {
    const decrypted = action.access_type === 'decrypted';
    const itemParams = await this.outgoingPayloadForItem({ item, decrypted });
    const params = {
      items: [itemParams]
    };
    return this.httpService.postAbsolute({ url: action.url, params: params }).then((response) => {
      action.error = false;
      return { response: response };
    }).catch((response) => {
      action.error = true;
      console.error('Action error response:', response);
      this.alertService.alert({
        text: 'An issue occurred while processing this action. Please try again.'
      });
      return { response: response };
    });
  }

  async handleShowAction(action) {
    this.deviceInterface.openUrl(action.url);
    return { response: null };
  }

  async outgoingPayloadForItem({ item, decrypted = false }) {
    const intent = decrypted
      ? EncryptionIntents.FileDecrypted
      : EncryptionIntents.FileEncrypted;
    return this.protocolService.payloadByEncryptingPayload({
      payload: item.payloadRepresentation(),
      intent: intent
    });
  }
}
