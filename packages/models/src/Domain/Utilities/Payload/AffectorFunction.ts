import { ComponentContent } from '../../Syncable/Component/ComponentContent'
import { ComponentArea } from '@standardnotes/features'
import { ContentType } from '@standardnotes/common'
import { ComponentMutator, SNComponent } from '../../Syncable/Component'
import { CreateDecryptedItemFromPayload } from '../Item/ItemGenerator'
import { ImmutablePayloadCollection } from '../../Runtime/Collection/Payload/ImmutablePayloadCollection'
import { MutationType } from '../../Abstract/Item/Types/MutationType'
import { PayloadInterface } from '../../Abstract/Payload/Interfaces/PayloadInterface'

export type AffectorFunction = (
  basePayload: PayloadInterface,
  duplicatePayload: PayloadInterface,
  baseCollection: ImmutablePayloadCollection,
) => PayloadInterface[]

function NoteDuplicationAffectedPayloads(
  basePayload: PayloadInterface,
  duplicatePayload: PayloadInterface,
  baseCollection: ImmutablePayloadCollection,
) {
  /** If note has editor, maintain editor relationship in duplicate note */
  const components = baseCollection
    .allDecrypted<ComponentContent>(ContentType.Component)
    .map((payload) => {
      return CreateDecryptedItemFromPayload<ComponentContent, SNComponent>(payload)
    })
  const editor = components
    .filter((c) => c.area === ComponentArea.Editor)
    .find((e) => {
      return e.isExplicitlyEnabledForItem(basePayload.uuid)
    })
  if (!editor) {
    return undefined
  }
  /** Modify the editor to include new note */
  const mutator = new ComponentMutator(editor, MutationType.NoUpdateUserTimestamps)
  mutator.associateWithItem(duplicatePayload.uuid)
  const result = mutator.getResult()
  return [result]
}

export const AffectorMapping = {
  [ContentType.Note]: NoteDuplicationAffectedPayloads,
} as Partial<Record<ContentType, AffectorFunction>>
