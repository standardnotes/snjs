import * as itemClasses from '@Models';
import * as contentTypes from '@Models/content_types';
import { SFItem } from '@Models';

const ContentTypeClassMapping = {
  [contentTypes.ContentTypes.Note]: itemClasses.SNNote,
  [contentTypes.ContentTypes.Tag]: itemClasses.SNTag,
  [contentTypes.ContentTypes.ItemsKey]: itemClasses.SNItemsKey,
  [contentTypes.ContentTypes.SmartTag]: itemClasses.SNSmartTag,
  [contentTypes.ContentTypes.ActionsExtension]: itemClasses.SNActionsExtension,
  [contentTypes.ContentTypes.Editor]: itemClasses.SNEditor,
  [contentTypes.ContentTypes.Theme]: itemClasses.SNTheme,
  [contentTypes.ContentTypes.Component]: itemClasses.SNComponent,
  [contentTypes.ContentTypes.ServerExtension]: itemClasses.SNServerExtension,
  [contentTypes.ContentTypes.Mfa]: itemClasses.SNMfa,
  [contentTypes.ContentTypes.Privileges]: itemClasses.SFPrivileges,
  [contentTypes.ContentTypes.UserPrefs]: itemClasses.SNUserPrefs
};

export function CreateItemFromPayload(payload) {
  if (!payload.isPayload) {
    throw 'Attempting to create item from non-payload object.';
  }
  const itemClass = ContentTypeClassMapping[payload.content_type] || SFItem;
  return new itemClass(payload);
}
