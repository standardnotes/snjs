import * as itemClasses from '@Models';
import * as contentTypes from '@Models/content_types';

const ContentTypeClassMapping = {
  [contentTypes.CONTENT_TYPE_NOTE]             : itemClasses.SNNote,
  [contentTypes.CONTENT_TYPE_TAG]              : itemClasses.SNTag,
  [contentTypes.CONTENT_TYPE_ITEMS_KEY]        : itemClasses.SNItemsKey,
  [contentTypes.CONTENT_TYPE_SMART_TAG]        : itemClasses.SNSmartTag,
  [contentTypes.CONTENT_TYPE_ACTIONS]          : itemClasses.SNExtension,
  [contentTypes.CONTENT_TYPE_EDITOR]           : itemClasses.SNEditor,
  [contentTypes.CONTENT_TYPE_THEME]            : itemClasses.SNTheme,
  [contentTypes.CONTENT_TYPE_COMPONENT]        : itemClasses.SNComponent,
  [contentTypes.CONTENT_TYPE_SERVER_EXTENSION] : itemClasses.SNServerExtension,
  [contentTypes.CONTENT_TYPE_MFA]              : itemClasses.SNMfa,
  [contentTypes.CONTENT_TYPE_PRIVILEGES]       : itemClasses.SFPrivileges,
  [contentTypes.CONTENT_TYPE_USER_PREFS]       : itemClasses.SNUserPrefs
};

export function CreateItemFromPayload(payload) {
  if(!payload.isPayload) {
    throw 'Attempting to create item from non-payload object.';
  }
  const itemClass = ContentTypeClassMapping[payload.content_type] || SFItem;
  return new itemClass(payload);
}
