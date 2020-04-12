import { PayloadContent } from '@Payloads/generator';
import { SNItem } from './core/item';
import { Copy } from '@Lib/utils';
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

export function CreateItemFromPayload(payload: PurePayload): SNItem {
  const itemClass = ContentTypeClassMapping[payload.content_type!] || itemClasses.SNItem;
  // eslint-disable-next-line new-cap
  const item = new itemClass(payload);
  return item;
}

/**
 * Returns an array of uuids for the given items or payloads
 */
export function Uuids(items: SNItem[] | PurePayload[]): string[] {
  return (items as any).map((item: any) => {
    return item.uuid;
  })
}

/**
 * Modifies the input object to fill in any missing required values from the 
 * content body.
 */
export function FillItemContent(content: Record<string, any>) {
  if(!content.references) {
    content.references = [];
  }
  if(!content.appData) {
    content.appData = {};
  }
  if (!content.appData[SNItem.DefaultAppDomain()]) {
    content.appData[SNItem.DefaultAppDomain()] = {};
  }
  return content as PayloadContent;
}