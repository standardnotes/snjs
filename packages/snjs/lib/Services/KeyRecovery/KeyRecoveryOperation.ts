import { ContentType } from '@standardnotes/common'
import { isErrorDecryptingPayload, ItemsKeyContent, ItemsKeyInterface } from '@standardnotes/models'
import { dateSorted } from '@standardnotes/utils'
import { EncryptionService, SNRootKeyParams } from '@standardnotes/encryption'
import { DecryptionQueueItem, KeyRecoveryOperationResult } from './Types'
import { serverKeyParamsAreSafe } from './Utils'
import { Challenge, ChallengePrompt, ChallengeReason, ChallengeService, ChallengeValidation } from '../Challenge'
import { KeyRecoveryStrings } from '../Api'
import { ItemManager } from '../Items'

export class KeyRecoveryOperation {
  constructor(
    private queueItem: DecryptionQueueItem,
    private itemManager: ItemManager,
    private protocolService: EncryptionService,
    private challengeService: ChallengeService,
    private clientParams: SNRootKeyParams | undefined,
    private serverParams: SNRootKeyParams | undefined,
  ) {}

  public async run(): Promise<KeyRecoveryOperationResult> {
    let replaceLocalRootKeyWithResult = false

    const queueItemKeyParamsAreBetterOrEqualToClients =
      this.serverParams &&
      this.clientParams &&
      !this.clientParams.compare(this.serverParams) &&
      this.queueItem.keyParams.compare(this.serverParams) &&
      serverKeyParamsAreSafe(this.serverParams, this.clientParams)

    if (queueItemKeyParamsAreBetterOrEqualToClients) {
      const latestDecryptedItemsKey = dateSorted(
        this.itemManager.getItems<ItemsKeyInterface>(ContentType.ItemsKey),
        'created_at',
        false,
      )[0]

      if (!latestDecryptedItemsKey) {
        replaceLocalRootKeyWithResult = true
      } else {
        replaceLocalRootKeyWithResult = this.queueItem.encryptedKey.created_at > latestDecryptedItemsKey.created_at
      }
    }

    const challenge = new Challenge(
      [new ChallengePrompt(ChallengeValidation.None, undefined, undefined, true)],
      ChallengeReason.Custom,
      true,
      KeyRecoveryStrings.KeyRecoveryLoginFlowPrompt(this.queueItem.keyParams),
      KeyRecoveryStrings.KeyRecoveryPasswordRequired,
    )

    const response = await this.challengeService.promptForChallengeResponse(challenge)

    if (!response) {
      return { aborted: true }
    }

    const password = response.values[0].value as string

    const rootKey = await this.protocolService.computeRootKey(password, this.queueItem.keyParams)

    const decryptedItemsKey = await this.protocolService.decryptSplitSingle<ItemsKeyContent>({
      usesRootKey: {
        items: [this.queueItem.encryptedKey],
        key: rootKey,
      },
    })

    this.challengeService.completeChallenge(challenge)

    if (!isErrorDecryptingPayload(decryptedItemsKey)) {
      return { rootKey, replaceLocalRootKeyWithResult, decryptedItemsKey }
    } else {
      return { aborted: false }
    }
  }
}
