import { SNFeatureRepo } from './app/feature_repo';
import { ContentType } from '@standardnotes/common';
import { PurePayload } from '@Payloads/pure_payload';
import { SNActionsExtension } from './app/extension';
import { SNComponent } from '@Models/app/component';
import { SNEditor } from './app/editor';
import { SNItem } from './core/item';
import { SNItemsKey } from './app/items_key';
import { SNNote } from './app/note';
import { SNSmartTag } from './app/smartTag';
import { SNTag } from './app/tag';
import { SNTheme } from './app/theme';
import { SNUserPrefs } from './app/userPrefs';

const ContentTypeClassMapping: Partial<
  Record<ContentType, new (payload: PurePayload) => SNItem>
> = {
  [ContentType.Note]: SNNote,
  [ContentType.Tag]: SNTag,
  [ContentType.ItemsKey]: SNItemsKey,
  [ContentType.SmartTag]: SNSmartTag,
  [ContentType.ActionsExtension]: SNActionsExtension,
  [ContentType.Editor]: SNEditor,
  [ContentType.Theme]: SNTheme,
  [ContentType.Component]: SNComponent,
  [ContentType.UserPrefs]: SNUserPrefs,
  [ContentType.ExtensionRepo]: SNFeatureRepo,
};

export function CreateItemFromPayload(payload: PurePayload): SNItem {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const itemClass = ContentTypeClassMapping[payload.content_type!] || SNItem;
  const item = new itemClass(payload);
  return item;
}
