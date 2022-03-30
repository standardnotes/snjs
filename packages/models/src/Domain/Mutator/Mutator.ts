import { FileMutator } from '../File/FileMutator'
import { SNItem } from '../Item/Item'
import { MutationType } from '../Item/MutationType'
import { ItemMutator } from '../Item/ItemMutator'
import { ThemeMutator } from '../Theme/ThemeMutator'
import { UserPrefsMutator } from '../UserPrefs/UserPrefsMutator'
import { ItemsKeyMutator } from '../ItemsKey/ItemsKeyMutator'
import { ActionsExtensionMutator } from '../ActionsExtension/ActionsExtensionMutator'
import { ComponentMutator } from '../Component/ComponentMutator'
import { TagMutator } from '../Tag/TagMutator'
import { NoteMutator } from '../Note/NoteMutator'
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
