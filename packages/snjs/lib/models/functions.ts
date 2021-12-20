import { AppDataField } from '@Models/core/item';
import { PayloadContent } from '@Payloads/generator';
import { DefaultAppDomain } from './content_types';
/**
 * Returns an array of uuids for the given items or payloads
 */
export function Uuids(items: { uuid: string }[]): string[] {
  return items.map((item) => {
    return item.uuid;
  });
}

/**
 * Modifies the input object to fill in any missing required values from the
 * content body.
 */
export function FillItemContent(content: Record<string, any>): PayloadContent {
  if (!content.references) {
    content.references = [];
  }
  if (!content.appData) {
    content.appData = {};
  }
  if (!content.appData[DefaultAppDomain]) {
    content.appData[DefaultAppDomain] = {};
  }
  if (!content.appData[DefaultAppDomain][AppDataField.UserModifiedDate]) {
    content.appData[DefaultAppDomain][
      AppDataField.UserModifiedDate
    ] = `${new Date()}`;
  }
  return content as PayloadContent;
}
