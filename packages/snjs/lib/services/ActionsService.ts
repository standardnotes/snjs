import { ChallengeService } from './Challenge/ChallengeService'
import { Challenge, ChallengePrompt, ChallengeValidation, ChallengeReason } from '../challenges'
import { ListedService } from './Listed/ListedService'
import { CreateItemFromPayload } from '@Models/generator'
import { ActionResponse, HttpResponse } from '@standardnotes/responses'
import { ContentType } from '@standardnotes/common'
import { EncryptionIntent } from '@standardnotes/applications'
import { ItemManager } from '@Lib/services/Items/ItemManager'
import { PurePayload, CreateMaxPayloadFromAnyObject } from '@standardnotes/payloads'
import { SNRootKey } from '@Protocol/root_key'
import {
  ActionsExtensionMutator,
  SNActionsExtension,
  Action,
  ActionAccessType,
} from '../models/app/extension'
import { MutationType, SNItem } from '@Models/core/item'
import { SNSyncService } from './Sync/SyncService'
import { SNProtocolService } from './ProtocolService'
import { PayloadManager } from './PayloadManager'
import { SNHttpService } from './Api/HttpService'
import { SNAlertService } from './AlertService'

import { AbstractService, DeviceInterface, InternalEventBusInterface } from '@standardnotes/services'

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
export class SNActionsService extends AbstractService {
  private previousPasswords: string[] = []

  constructor(
    private itemManager: ItemManager,
    private alertService: SNAlertService,
    public deviceInterface: DeviceInterface,
    private httpService: SNHttpService,
    private payloadManager: PayloadManager,
    private protocolService: SNProtocolService,
    private syncService: SNSyncService,
    private challengeService: ChallengeService,
    private listedService: ListedService,
    protected internalEventBus: InternalEventBusInterface,
  ) {
    super(internalEventBus)
    this.previousPasswords = []
  }

  /** @override */
  public deinit(): void {
    ;(this.itemManager as unknown) = undefined
    ;(this.alertService as unknown) = undefined
    ;(this.deviceInterface as unknown) = undefined
    ;(this.httpService as unknown) = undefined
    ;(this.payloadManager as unknown) = undefined
    ;(this.listedService as unknown) = undefined
    ;(this.challengeService as unknown) = undefined
    ;(this.protocolService as unknown) = undefined
    ;(this.syncService as unknown) = undefined
    this.previousPasswords.length = 0
    super.deinit()
  }

  public getExtensions(): SNActionsExtension[] {
    const extensionItems = this.itemManager.nonErroredItemsForContentType<SNActionsExtension>(
      ContentType.ActionsExtension,
    )
    const excludingListed = extensionItems.filter((extension) => !extension.isListedExtension)
    return excludingListed
  }

  public extensionsInContextOfItem(item: SNItem) {
    return this.getExtensions().filter((ext) => {
      return (
        ext.supported_types.includes(item.content_type) ||
        ext.actionsWithContextForItem(item).length > 0
      )
    })
  }

  /**
   * Loads an extension in the context of a certain item.
   * The server then has the chance to respond with actions that are
   * relevant just to this item. The response extension is not saved,
   * just displayed as a one-time thing.
   */
  public async loadExtensionInContextOfItem(
    extension: SNActionsExtension,
    item: SNItem,
  ): Promise<SNActionsExtension | undefined> {
    const params = {
      content_type: item.content_type,
      item_uuid: item.uuid,
    }
    const response = (await this.httpService
      .getAbsolute(extension.url, params)
      .catch((response) => {
        console.error('Error loading extension', response)
        return null
      })) as ActionResponse
    if (!response) {
      return
    }
    const description = response.description || extension.description
    const supported_types = response.supported_types || extension.supported_types
    const actions = response.actions || []
    const mutator = new ActionsExtensionMutator(extension, MutationType.UserInteraction)

    mutator.deprecation = response.deprecation
    mutator.description = description
    mutator.supported_types = supported_types
    mutator.actions = actions

    const payloadResult = mutator.getResult()
    return CreateItemFromPayload(payloadResult) as SNActionsExtension
  }

  public async runAction(action: Action, item: SNItem): Promise<ActionResponse | undefined> {
    let result
    switch (action.verb) {
      case 'render':
        result = await this.handleRenderAction(action)
        break
      case 'show':
        result = await this.handleShowAction(action)
        break
      case 'post':
        result = await this.handlePostAction(action, item)
        break
      default:
        break
    }
    return result
  }

  private async handleRenderAction(action: Action) {
    const response = await this.httpService
      .getAbsolute(action.url)
      .then(async (response) => {
        const payload = await this.payloadByDecryptingResponse(response as ActionResponse)
        if (payload) {
          const item = CreateItemFromPayload(payload)
          return {
            ...response,
            item,
          } as ActionResponse
        }
      })
      .catch((response) => {
        const error = (response && response.error) || {
          message: 'An issue occurred while processing this action. Please try again.',
        }
        this.alertService.alert(error.message)
        return { error } as HttpResponse
      })

    return response as ActionResponse
  }

  private async payloadByDecryptingResponse(
    response: ActionResponse,
    key?: SNRootKey,
    triedPasswords: string[] = [],
  ): Promise<PurePayload | undefined> {
    const payload = CreateMaxPayloadFromAnyObject(response.item)

    if (!payload.enc_item_key) {
      this.alertService.alert('This revision is missing its key and cannot be recovered.')
      return
    }

    const decryptedPayload = await this.protocolService.payloadByDecryptingPayload(payload, key)
    if (!decryptedPayload.errorDecrypting) {
      return decryptedPayload
    }

    for (const itemsKey of this.itemManager.itemsKeys()) {
      const decryptedPayload = await this.protocolService.payloadByDecryptingPayload(
        payload,
        itemsKey,
      )
      if (!decryptedPayload.errorDecrypting) {
        return decryptedPayload
      }
    }

    const keyParamsData = response.keyParams || response.auth_params
    if (!keyParamsData) {
      /**
       * In some cases revisions were missing auth params.
       * Instruct the user to email us to get this remedied.
       */
      this.alertService.alert(
        'We were unable to decrypt this revision using your current keys, ' +
          'and this revision is missing metadata that would allow us to try different ' +
          'keys to decrypt it. This can likely be fixed with some manual intervention. ' +
          'Please email help@standardnotes.com for assistance.',
      )
      return undefined
    }
    const keyParams = this.protocolService.createKeyParams(keyParamsData)

    /* Try previous passwords */
    for (const passwordCandidate of this.previousPasswords) {
      if (triedPasswords.includes(passwordCandidate)) {
        continue
      }
      triedPasswords.push(passwordCandidate)
      const key = await this.protocolService.computeRootKey(passwordCandidate, keyParams)
      if (!key) {
        continue
      }
      const nestedResponse: any = await this.payloadByDecryptingResponse(
        response,
        key,
        triedPasswords,
      )
      if (nestedResponse) {
        return nestedResponse
      }
    }

    /** Prompt for other passwords */
    const password = await this.promptForLegacyPassword()
    if (!password) {
      return undefined
    }

    if (this.previousPasswords.includes(password)) {
      return undefined
    }

    this.previousPasswords.push(password)
    return this.payloadByDecryptingResponse(response, key)
  }

  private async promptForLegacyPassword(): Promise<string | undefined> {
    const challenge = new Challenge(
      [new ChallengePrompt(ChallengeValidation.None, 'Previous Password', undefined, true)],
      ChallengeReason.Custom,
      true,
      'Unable to find key for revision. Please enter the account password you may have used at the time of the revision.',
    )

    const response = await this.challengeService.promptForChallengeResponse(challenge)

    return response?.getDefaultValue().value as string
  }

  private async handlePostAction(action: Action, item: SNItem) {
    const decrypted = action.access_type === ActionAccessType.Decrypted
    const itemParams = await this.outgoingPayloadForItem(item, decrypted)
    const params = {
      items: [itemParams],
    }
    return this.httpService!.postAbsolute(action.url, params)
      .then((response) => {
        return response as ActionResponse
      })
      .catch((response) => {
        console.error('Action error response:', response)
        this.alertService!.alert(
          'An issue occurred while processing this action. Please try again.',
        )
        return response as ActionResponse
      })
  }

  private async handleShowAction(action: Action) {
    this.deviceInterface!.openUrl(action.url)
    return {} as ActionResponse
  }

  private async outgoingPayloadForItem(item: SNItem, decrypted = false) {
    const intent = decrypted ? EncryptionIntent.FileDecrypted : EncryptionIntent.FileEncrypted
    const encrypted = await this.protocolService!.payloadByEncryptingPayload(
      item.payloadRepresentation(),
      intent,
    )
    return encrypted.ejected()
  }
}
