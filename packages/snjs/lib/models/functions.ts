/**
 * Returns an array of uuids for the given items or payloads
 */
export function Uuids(items: { uuid: string }[]): string[] {
  return items.map((item) => {
    return item.uuid;
  });
}
