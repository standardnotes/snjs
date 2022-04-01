import { ContentType } from '@standardnotes/common'
import { ComponentArea } from '@standardnotes/features'
import { CreateItemFromPayload } from '../Item/Generator'
import { ImmutablePayloadCollection } from '../../Runtime/Collection/ImmutablePayloadCollection'
import { ComponentMutator, SNComponent } from '../../Syncable/Component'
import { MutationType } from '../Item'
import { PayloadInterface } from './PayloadInterface'

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
  const components = baseCollection.all(ContentType.Component).map((payload) => {
    return CreateItemFromPayload(payload)
  }) as SNComponent[]
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
