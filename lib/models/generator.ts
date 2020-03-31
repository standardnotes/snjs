import { ItemContent } from '@Models/core/item';
import { deepMerge, Copy } from '@Lib/utils';
import { PurePayload } from '@Payloads/pure_payload';
import * as itemClasses from '@Models/index';
import { ContentTypes } from '@Models/content_types';

const ContentTypeClassMapping: Record<any, any> = {
  [ContentTypes.Note]: itemClasses.SNNote,
  [ContentTypes.Tag]: itemClasses.SNTag,
  [ContentTypes.ItemsKey]: itemClasses.SNItemsKey,
  [ContentTypes.SmartTag]: itemClasses.SNSmartTag,
  [ContentTypes.ActionsExtension]: itemClasses.SNActionsExtension,
  [ContentTypes.Editor]: itemClasses.SNEditor,
  [ContentTypes.Theme]: itemClasses.SNTheme,
  [ContentTypes.Component]: itemClasses.SNComponent,
  [ContentTypes.Privileges]: itemClasses.SNPrivileges,
  [ContentTypes.UserPrefs]: itemClasses.SNUserPrefs
};

export function CreateItemFromPayload(payload: PurePayload) {
  if (!payload.isPayload) {
    throw 'Attempting to create item from non-payload object.';
  }
  const itemClass = ContentTypeClassMapping[payload.content_type] || itemClasses.SNItem;
  // eslint-disable-next-line new-cap
  const item = new itemClass(true);
  item.updateFromPayload(payload);
  return item;
}

/**
 * Builds item .content based on values and populates with other default required
 * fields if necessary.
 */
export function BuildItemContent(values?: Record<string, any>) {
  const copy = values ? Copy(values) : {}
  return {
    references: [],
    ...copy,
  }
}