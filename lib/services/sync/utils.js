/**
  * Sorts payloads according by most recently modified first, according to the priority,
  * whereby the earlier a content_type appears in the priorityList,
  * the earlier it will appear in the resulting sorted array.
  */
export function SortPayloadsByRecentAndContentPriority(payloads, priorityList) {
  return payloads.sort((a,b) => {
    const dateResult = new Date(b.updated_at) - new Date(a.updated_at);

    let aPriority = 0, bPriority = 0;
    if(priorityList) {
      aPriority = priorityList.indexOf(a.content_type);
      bPriority = priorityList.indexOf(b.content_type);
      if(aPriority === -1) {
        /** Not found in list, not prioritized. Set it to max value */
        aPriority = priorityList.length;
      }
      if(bPriority === -1) {
        /** Not found in list, not prioritized. Set it to max value */
        bPriority = priorityList.length;
      }
    }

    if(aPriority === bPriority) {
      return dateResult;
    }

    if(aPriority < bPriority) {
      return -1;
    } else {
      return 1;
    }

    /** aPriority < bPriority means a should come first */
    return aPriority < bPriority ? -1 : 1;
  })
}
