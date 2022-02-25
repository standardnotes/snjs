import { ContentType } from '@standardnotes/common';

export function displayStringForContentType(
  contentType: ContentType
): string | undefined {
  const map: Record<string, string> = {
    [ContentType.Note]: 'note',
    [ContentType.Tag]: 'tag',
    [ContentType.SmartTag]: 'smart tag',
    [ContentType.ActionsExtension]: 'action-based extension',
    [ContentType.Component]: 'component',
    [ContentType.Editor]: 'editor',
    [ContentType.Theme]: 'theme',
    [ContentType.FilesafeCredentials]: 'FileSafe credential',
    [ContentType.FilesafeFileMetadata]: 'FileSafe file',
    [ContentType.FilesafeIntegration]: 'FileSafe integration',
  };
  return map[contentType];
}
