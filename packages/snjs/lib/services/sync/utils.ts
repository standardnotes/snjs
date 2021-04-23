import { ContentType } from '@Models/content_types';
import { PurePayload } from '@Payloads/pure_payload';
/**
 * Sorts payloads according by most recently modified first, according to the priority,
 * whereby the earlier a content_type appears in the priorityList,
 * the earlier it will appear in the resulting sorted array.
 */
export function SortPayloadsByRecentAndContentPriority(
  payloads: PurePayload[],
  priorityList: ContentType[]
): PurePayload[] {
  return payloads.sort((a: PurePayload, b: PurePayload) => {
    const dateResult =
      new Date(b.serverUpdatedAt!).getTime() -
      new Date(a.serverUpdatedAt!).getTime();
    let aPriority = 0;
    let bPriority = 0;
    if (priorityList) {
      aPriority = priorityList.indexOf(a.content_type!);
      bPriority = priorityList.indexOf(b.content_type!);
      if (aPriority === -1) {
        /** Not found in list, not prioritized. Set it to max value */
        aPriority = priorityList.length;
      }
      if (bPriority === -1) {
        /** Not found in list, not prioritized. Set it to max value */
        bPriority = priorityList.length;
      }
    }
    if (aPriority === bPriority) {
      return dateResult;
    }
    if (aPriority < bPriority) {
      return -1;
    } else {
      return 1;
    }
  });
}
