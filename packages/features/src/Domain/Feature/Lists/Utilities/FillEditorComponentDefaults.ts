import { ComponentAction } from '../../../Component/ComponentAction'
import { ContentType } from '@standardnotes/common'
import { EditorFeatureDescription } from '../../FeatureDescription'
import { ComponentArea } from '../../../Component/ComponentArea'
import { FeatureIdentifier } from '../../FeatureIdentifier'
import { getGithubDownloadUrl } from './GithubDownloadUrl'

export type RequiredEditorFields = Pick<EditorFeatureDescription, 'availableInSubscriptions'>

export function FillEditorComponentDefaults(
  component: Partial<EditorFeatureDescription> & RequiredEditorFields,
): EditorFeatureDescription {
  component.static_files = ['index.html', 'dist', 'package.json'].concat(component.static_files || [])

  if (component.git_repo_url && !component.download_url) {
    component.download_url = getGithubDownloadUrl(
      component.git_repo_url,
      component.version as string,
      component.identifier as FeatureIdentifier,
    )
  }

  if (!component.index_path) {
    component.index_path = 'dist/index.html'
  }

  if (!component.component_permissions) {
    component.component_permissions = [
      {
        name: ComponentAction.StreamContextItem,
        content_types: [ContentType.Note],
      },
    ]
  }

  component.content_type = ContentType.Component
  if (!component.area) {
    component.area = ComponentArea.Editor
  }

  if (component.interchangeable == undefined) {
    component.interchangeable = true
  }

  return component as EditorFeatureDescription
}
