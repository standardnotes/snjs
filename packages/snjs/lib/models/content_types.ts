import { ContentType } from '@standardnotes/common';

export const DefaultAppDomain = 'org.standardnotes.sn';

export { ContentType };

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
    [ContentType.ServerExtension]: 'server extension',
    [ContentType.Mfa]: 'two-factor authentication setting',
    [ContentType.FilesafeCredentials]: 'FileSafe credential',
    [ContentType.FilesafeFileMetadata]: 'FileSafe file',
    [ContentType.FilesafeIntegration]: 'FileSafe integration',
  };
  return map[contentType];
}
