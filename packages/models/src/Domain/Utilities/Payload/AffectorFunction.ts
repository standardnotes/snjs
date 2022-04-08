import { DecryptedPayloadInterface } from './../../Abstract/Payload/Interfaces/DecryptedPayload'
import { ComponentContent } from '../../Syncable/Component/ComponentContent'
import { ComponentArea } from '@standardnotes/features'
import { ContentType } from '@standardnotes/common'
import { ComponentMutator, SNComponent } from '../../Syncable/Component'
import { CreateDecryptedItemFromPayload } from '../Item/ItemGenerator'
import { ImmutablePayloadCollection } from '../../Runtime/Collection/Payload/ImmutablePayloadCollection'
import { MutationType } from '../../Abstract/Item/Types/MutationType'
import { FullyFormedPayloadInterface } from '../../Abstract/Payload/Interfaces/UnionTypes'
import { isDecryptedPayload } from '../../Abstract/Payload'

export type AffectorFunction = (
  basePayload: FullyFormedPayloadInterface,
  duplicatePayload: FullyFormedPayloadInterface,
  baseCollection: ImmutablePayloadCollection<FullyFormedPayloadInterface>,
) => FullyFormedPayloadInterface[]

const NoteDuplicationAffectedPayloads: AffectorFunction = (
  basePayload: FullyFormedPayloadInterface,
  duplicatePayload: FullyFormedPayloadInterface,
  baseCollection: ImmutablePayloadCollection<FullyFormedPayloadInterface>,
) => {
  /** If note has editor, maintain editor relationship in duplicate note */
  const components = baseCollection
    .all(ContentType.Component)
    .filter(isDecryptedPayload)
    .map((payload) => {
      return CreateDecryptedItemFromPayload<ComponentContent, SNComponent>(
        payload as DecryptedPayloadInterface<ComponentContent>,
      )
    })

  const editor = components
    .filter((c) => c.area === ComponentArea.Editor)
    .find((e) => {
      return e.isExplicitlyEnabledForItem(basePayload.uuid)
    })

  if (!editor) {
    return []
  }

  /** Modify the editor to include new note */
  const mutator = new ComponentMutator(editor, MutationType.NoUpdateUserTimestamps)
  mutator.associateWithItem(duplicatePayload.uuid)
  const result = mutator.getResult()
  return [result] as FullyFormedPayloadInterface[]
}

export const AffectorMapping = {
  [ContentType.Note]: NoteDuplicationAffectedPayloads,
} as Partial<Record<ContentType, AffectorFunction>>
