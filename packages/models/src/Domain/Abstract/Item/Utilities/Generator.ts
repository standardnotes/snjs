import { DecryptedPayloadInterface } from './../../Payload/Interfaces/DecryptedPayload'
import { SNFile } from '../../../Syncable/File/File'
import { SNFeatureRepo } from '../../../Syncable/FeatureRepo/FeatureRepo'
import { ContentType } from '@standardnotes/common'
import { SNActionsExtension } from '../../../Syncable/ActionsExtension/ActionsExtension'
import { SNComponent } from '../../../Syncable/Component/Component'
import { SNEditor } from '../../../Syncable/Editor/Editor'
import { DecryptedItem } from '../Implementations/DecryptedItem'
import { SNNote } from '../../../Syncable/Note/Note'
import { SmartView } from '../../../Syncable/SmartView/SmartView'
import { SNTag } from '../../../Syncable/Tag/Tag'
import { SNTheme } from '../../../Syncable/Theme/Theme'
import { SNUserPrefs } from '../../../Syncable/UserPrefs/UserPrefs'
import { FileMutator } from '../../../Syncable/File/FileMutator'
import { MutationType } from '../Types/MutationType'
import { ItemMutator } from '../Mutator/ItemMutator'
import { ThemeMutator } from '../../../Syncable/Theme/ThemeMutator'
import { UserPrefsMutator } from '../../../Syncable/UserPrefs/UserPrefsMutator'
import { ActionsExtensionMutator } from '../../../Syncable/ActionsExtension/ActionsExtensionMutator'
import { ComponentMutator } from '../../../Syncable/Component/ComponentMutator'
import { TagMutator } from '../../../Syncable/Tag/TagMutator'
import { NoteMutator } from '../../../Syncable/Note/NoteMutator'
import { DecryptedItemInterface } from '../Interfaces/DecryptedItem'
import { ItemContent } from '../Interfaces/ItemContent'

type ItemClass<C extends ItemContent = ItemContent> = new (
  payload: DecryptedPayloadInterface<C>,
) => DecryptedItem<C>

type MutatorClass = new (item: DecryptedItem, type: MutationType) => ItemMutator

type MappingEntry<C extends ItemContent = ItemContent> = {
  itemClass: ItemClass<C>
  mutatorClass?: MutatorClass
}

const ContentTypeClassMapping: Partial<Record<ContentType, MappingEntry>> = {
  [ContentType.ActionsExtension]: {
    itemClass: SNActionsExtension,
    mutatorClass: ActionsExtensionMutator,
  },
  [ContentType.Component]: { itemClass: SNComponent, mutatorClass: ComponentMutator },
  [ContentType.Editor]: { itemClass: SNEditor },
  [ContentType.ExtensionRepo]: { itemClass: SNFeatureRepo },
  [ContentType.File]: { itemClass: SNFile, mutatorClass: FileMutator },
  [ContentType.Note]: { itemClass: SNNote, mutatorClass: NoteMutator },
  [ContentType.SmartView]: { itemClass: SmartView, mutatorClass: TagMutator },
  [ContentType.Tag]: { itemClass: SNTag, mutatorClass: TagMutator },
  [ContentType.Theme]: { itemClass: SNTheme, mutatorClass: ThemeMutator },
  [ContentType.UserPrefs]: { itemClass: SNUserPrefs, mutatorClass: UserPrefsMutator },
}

export function CreateMutatorForItem<I extends DecryptedItem, M extends ItemMutator = ItemMutator>(
  item: I,
  type: MutationType,
): M {
  const lookupValue = ContentTypeClassMapping[item.content_type]?.mutatorClass
  if (lookupValue) {
    return new lookupValue(item, type) as M
  } else {
    return new ItemMutator(item, type) as M
  }
}

export function RegisterItemClass(
  contentType: ContentType,
  itemClass: ItemClass,
  mutatorClass?: MutatorClass,
) {
  ContentTypeClassMapping[contentType] = {
    itemClass: itemClass,
    mutatorClass: mutatorClass,
  }
}

export function CreateDecryptedItemFromPayload<
  C extends ItemContent = ItemContent,
  T extends DecryptedItemInterface<C> = DecryptedItemInterface<C>,
>(payload: DecryptedPayloadInterface<C>): T {
  const lookupClass = ContentTypeClassMapping[payload.content_type]
  const itemClass = lookupClass ? lookupClass.itemClass : DecryptedItem
  const item = new itemClass(payload)
  return item as unknown as T
}
