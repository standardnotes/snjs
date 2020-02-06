import { PayloadSources } from '@Payloads';
import { EncryptionIntents } from '@Protocol';
import { PureService } from '@Lib/services/pure_service';

import { Action } from '@Models';

export class SNActionsManager extends PureService {
  constructor({
    httpManager,
    modelManager,
    syncManager,
    deviceInterface
  }) {
    super();
    this.httpManager = httpManager;
    this.modelManager = modelManager;
    this.syncManager = syncManager;
    this.deviceInterface = deviceInterface;

    this.previousPasswords = [];
  }

  extensionsInContextOfItem(item) {
    const extensions = this.modelManager.validItemsForContentType('Extension');
    return extensions.filter((ext) => {
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
    return this.httpManager.getAbsolute({
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
      console.error("Error loading extension", response);
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
      this.application.alertManager.confirm({
        text: "Are you sure you want to replace the current note contents with this action's results?",
        onConfirm: () => {
          this.runConfirmedGetAction({ action, passwordRequestHandler }).then(resolve);
        }
      });
    });
  }

  async runConfirmedGetAction({ action, passwordRequestHandler }) {
    const response = await this.httpManager.getAbsolute(action.url, {}).catch((response) => {
      const error = (response && response.error)
        || { message: "An issue occurred while processing this action. Please try again." };
      this.application.alertManager.alert({ text: error.message });
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
    this.syncManager.sync();
    return {
      response: response,
      item: response.item
    };
  }

  async handleRenderAction({ action, passwordRequestHandler }) {
    return this.httpManager.getAbsolute(action.url, {}).then(async (response) => {
      action.error = false;
      const payload = await this.payloadByDecryptingResponse({
        response,
        passwordRequestHandler
      });
      if (payload) {
        const item = this.modelManager.mapPayload({ payload: payload });
        return {
          response: response,
          item: item
        };
      }
    }).catch((response) => {
      const error = (response && response.error)
        || { message: "An issue occurred while processing this action. Please try again." };
      this.application.alertManager.alert({ text: error.message });
      action.error = true;
      return { error: error };
    });
  }


  async payloadByDecryptingResponse({ response, key, passwordRequestHandler }) {
    const decryptedPayload = await this.protocolService.payloadsByDecryptingRawPayload({
      rawPayload: response.item,
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
      this.application.alertManager.alert({
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
    return this.httpManager.postAbsolute(action.url, params).then((response) => {
      action.error = false;
      return { response: response };
    }).catch((response) => {
      action.error = true;
      console.error("Action error response:", response);
      this.application.alertManager.alert({
        text: "An issue occurred while processing this action. Please try again."
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
