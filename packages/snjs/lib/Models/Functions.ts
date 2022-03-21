import { ContentType } from '@standardnotes/common'

/**
 * Returns an array of uuids for the given items or payloads
 */
export function Uuids(items: { uuid: string }[]): string[] {
  return items.map((item) => {
    return item.uuid
  })
}

export function displayStringForContentType(contentType: ContentType): string | undefined {
  const map: Record<string, string> = {
    [ContentType.Note]: 'note',
    [ContentType.Tag]: 'tag',
    [ContentType.SmartView]: 'smart view',
    [ContentType.ActionsExtension]: 'action-based extension',
    [ContentType.Component]: 'component',
    [ContentType.Editor]: 'editor',
    [ContentType.Theme]: 'theme',
    [ContentType.FilesafeCredentials]: 'FileSafe credential',
    [ContentType.FilesafeFileMetadata]: 'FileSafe file',
    [ContentType.FilesafeIntegration]: 'FileSafe integration',
  }
  return map[contentType]
}
