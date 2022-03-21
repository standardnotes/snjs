import { FileMutator } from './Items/file'
import { ItemMutator, SNItem, MutationType } from './Items/item'
import { ThemeMutator } from './Items/theme'
import { UserPrefsMutator } from './Items/userPrefs'
import { ItemsKeyMutator } from './Items/items_key'
import { ActionsExtensionMutator } from './Items/extension'
import { ComponentMutator } from './Items/component'
import { TagMutator } from './Items/tag'
import { NoteMutator } from './Items/note'
import { ContentType } from '@standardnotes/common'

export function createMutatorForItem(item: SNItem, type: MutationType): ItemMutator {
  switch (item.content_type) {
    case ContentType.Note:
      return new NoteMutator(item, type)
    case ContentType.Tag:
    case ContentType.SmartView:
      return new TagMutator(item, type)
    case ContentType.Component:
      return new ComponentMutator(item, type)
    case ContentType.ActionsExtension:
      return new ActionsExtensionMutator(item, type)
    case ContentType.ItemsKey:
      return new ItemsKeyMutator(item, type)
    case ContentType.UserPrefs:
      return new UserPrefsMutator(item, type)
    case ContentType.Theme:
      return new ThemeMutator(item, type)
    case ContentType.File:
      return new FileMutator(item, type)
    default:
      return new ItemMutator(item, type)
  }
}
