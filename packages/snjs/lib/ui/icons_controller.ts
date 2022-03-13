import { FeatureIdentifier } from '@standardnotes/features'
import { IconType } from '@Lib/types'

export class IconsController {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public deinit(): void {}

  getIconForFileType(type: string): IconType {
    let iconType: IconType = 'file-other'

    if (type === 'application/pdf') {
      iconType = 'file-pdf'
    }

    if (/word/.test(type)) {
      iconType = 'file-doc'
    }

    if (/powerpoint|presentation/.test(type)) {
      iconType = 'file-ppt'
    }

    if (/excel|spreadsheet/.test(type)) {
      iconType = 'file-xls'
    }

    if (/^image\//.test(type)) {
      iconType = 'file-image'
    }

    if (/^video\//.test(type)) {
      iconType = 'file-mov'
    }

    if (/^audio\//.test(type)) {
      iconType = 'file-music'
    }

    if (/(zip)|([tr]ar)|(7z)/.test(type)) {
      iconType = 'file-zip'
    }

    return iconType
  }

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
