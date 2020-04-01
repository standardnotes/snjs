import { DEFAULT_APP_DOMAIN } from '@Lib/index';
import { PayloadContent } from '@Payloads/generator';
import { deepMerge, Copy } from '@Lib/utils';
import { PurePayload } from '@Payloads/pure_payload';
import * as itemClasses from '@Models/index';
import { ContentType } from '@Models/content_types';

const ContentTypeClassMapping: Record<any, any> = {
  [ContentType.Note]: itemClasses.SNNote,
  [ContentType.Tag]: itemClasses.SNTag,
  [ContentType.ItemsKey]: itemClasses.SNItemsKey,
  [ContentType.SmartTag]: itemClasses.SNSmartTag,
  [ContentType.ActionsExtension]: itemClasses.SNActionsExtension,
  [ContentType.Editor]: itemClasses.SNEditor,
  [ContentType.Theme]: itemClasses.SNTheme,
  [ContentType.Component]: itemClasses.SNComponent,
  [ContentType.Privileges]: itemClasses.SNPrivileges,
  [ContentType.UserPrefs]: itemClasses.SNUserPrefs
};

export function CreateItemFromPayload(payload: PurePayload) {
  const itemClass = ContentTypeClassMapping[payload.content_type!] || itemClasses.SNItem;
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
    appData: {
      [DEFAULT_APP_DOMAIN]: {}
    },
    ...copy,
  }
}