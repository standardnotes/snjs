import { ItemMutator, SNItem, MutationType } from './core/item';
import { ThemeMutator } from './app/theme';
import { UserPrefsMutator } from './app/userPrefs';
import { ItemsKeyMutator } from './app/items_key';
import { ActionsExtensionMutator } from './app/extension';
import { ComponentMutator } from './app/component';
import { TagMutator } from './app/tag';
import { NoteMutator } from './app/note';
import { ContentType } from './content_types';

export function createMutatorForItem(
  item: SNItem,
  type: MutationType
): ItemMutator {
  switch (item.content_type) {
    case ContentType.Note:
      return new NoteMutator(item, type);
    case ContentType.Tag:
    case ContentType.SmartTag:
      return new TagMutator(item, type);
    case ContentType.Component:
      return new ComponentMutator(item, type);
    case ContentType.ActionsExtension:
      return new ActionsExtensionMutator(item, type);
    case ContentType.ItemsKey:
      return new ItemsKeyMutator(item, type);
    case ContentType.UserPrefs:
      return new UserPrefsMutator(item, type);
    case ContentType.Theme:
      return new ThemeMutator(item, type);
    default:
      return new ItemMutator(item, type);
  }
}
