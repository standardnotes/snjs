import * as itemClasses from '@Models';
import { ContentTypes } from '@Models/content_types';

const ContentTypeClassMapping = {
  [ContentTypes.Note]: itemClasses.SNNote,
  [ContentTypes.Tag]: itemClasses.SNTag,
  [ContentTypes.ItemsKey]: itemClasses.SNItemsKey,
  [ContentTypes.SmartTag]: itemClasses.SNSmartTag,
  [ContentTypes.ActionsExtension]: itemClasses.SNActionsExtension,
  [ContentTypes.Editor]: itemClasses.SNEditor,
  [ContentTypes.Theme]: itemClasses.SNTheme,
  [ContentTypes.Component]: itemClasses.SNComponent,
  [ContentTypes.Privileges]: itemClasses.SFPrivileges,
  [ContentTypes.UserPrefs]: itemClasses.SNUserPrefs
};

export function CreateItemFromPayload(payload) {
  if (!payload.isPayload) {
    throw 'Attempting to create item from non-payload object.';
  }
  const itemClass = ContentTypeClassMapping[payload.content_type] || itemClasses.SFItem;
  // eslint-disable-next-line new-cap
  return new itemClass(payload);
}
