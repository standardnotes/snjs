import { FeatureIdentifier } from '@standardnotes/features'
import { IconType } from '@Lib/types'

export class IconsController {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public deinit(): void {}

  getIconAndTintForEditor(identifier: FeatureIdentifier | undefined): [IconType, number] {
    switch (identifier) {
      case FeatureIdentifier.BoldEditor:
      case FeatureIdentifier.PlusEditor:
        return ['rich-text', 1]
      case FeatureIdentifier.MarkdownBasicEditor:
      case FeatureIdentifier.MarkdownMathEditor:
      case FeatureIdentifier.MarkdownMinimistEditor:
      case FeatureIdentifier.MarkdownProEditor:
        return ['markdown', 2]
      case FeatureIdentifier.TokenVaultEditor:
        return ['authenticator', 6]
      case FeatureIdentifier.SheetsEditor:
        return ['spreadsheets', 5]
      case FeatureIdentifier.TaskEditor:
        return ['tasks', 3]
      case FeatureIdentifier.CodeEditor:
        return ['code', 4]
      default:
        return ['plain-text', 1]
    }
  }
}
