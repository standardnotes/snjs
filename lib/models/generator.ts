import { SNUserPrefs } from './app/userPrefs';
import { SNPrivileges } from './app/privileges';
import { SNComponent } from '@Models/app/component';
import { SNTheme } from './app/theme';
import { SNEditor } from './app/editor';
import { SNActionsExtension } from './app/extension';
import { SNSmartTag } from './app/smartTag';
import { SNTag } from './app/tag';
import { SNNote } from './app/note';
import { SNItem } from './core/item';
import { PurePayload } from '@Payloads/pure_payload';
import { ContentType } from '@Models/content_types';
import { SNItemsKey } from './app/items_key';

const ContentTypeClassMapping: Record<any, any> = {
  [ContentType.Note]: SNNote,
  [ContentType.Tag]: SNTag,
  [ContentType.ItemsKey]: SNItemsKey,
  [ContentType.SmartTag]: SNSmartTag,
  [ContentType.ActionsExtension]: SNActionsExtension,
  [ContentType.Editor]: SNEditor,
  [ContentType.Theme]: SNTheme,
  [ContentType.Component]: SNComponent,
  [ContentType.Privileges]: SNPrivileges,
  [ContentType.UserPrefs]: SNUserPrefs
};

export function CreateItemFromPayload(payload: PurePayload): SNItem {
  const itemClass = ContentTypeClassMapping[payload.content_type!] || SNItem;
  // eslint-disable-next-line new-cap
  const item = new itemClass(payload);
  return item;
}