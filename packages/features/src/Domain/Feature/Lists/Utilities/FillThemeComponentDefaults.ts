import { ContentType } from '@standardnotes/common'
import { ThemeFeatureDescription } from '../../FeatureDescription'
import { ComponentArea } from '../../../Component/ComponentArea'
import { FeatureIdentifier } from '../../FeatureIdentifier'
import { getGithubDownloadUrl } from './GithubDownloadUrl'

type RequiredThemeFields = Pick<ThemeFeatureDescription, 'availableInSubscriptions'>

export function FillThemeComponentDefaults(
  theme: Partial<ThemeFeatureDescription> & RequiredThemeFields,
): ThemeFeatureDescription {
  if (!theme.static_files) {
    theme.static_files = ['dist', 'package.json']
  }

  if (theme.git_repo_url && !theme.download_url) {
    theme.download_url = getGithubDownloadUrl(
      theme.git_repo_url,
      theme.version as string,
      theme.identifier as FeatureIdentifier,
    )
  }

  if (!theme.index_path) {
    theme.index_path = 'dist/dist.css'
  }

  theme.content_type = ContentType.Theme
  if (!theme.area) {
    theme.area = ComponentArea.Editor
  }
  return theme as ThemeFeatureDescription
}
