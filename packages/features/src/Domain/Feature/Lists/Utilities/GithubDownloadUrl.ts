import { FeatureIdentifier } from '../../FeatureIdentifier'

export function getGithubDownloadUrl(repoUrl: string, version: string, identifier: FeatureIdentifier) {
  return `${repoUrl}/releases/download/${version}/${identifier}.zip`
}
