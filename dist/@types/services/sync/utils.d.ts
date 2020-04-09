import { ContentType } from '../../models/content_types';
import { PurePayload } from '../../protocol/payloads/pure_payload';
/**
  * Sorts payloads according by most recently modified first, according to the priority,
  * whereby the earlier a content_type appears in the priorityList,
  * the earlier it will appear in the resulting sorted array.
  */
export declare function SortPayloadsByRecentAndContentPriority(payloads: PurePayload[], priorityList: ContentType[]): PurePayload[];
