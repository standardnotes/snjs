import { SNFile } from './app/file'
import { SNFeatureRepo } from './app/feature_repo'
import { ContentType } from '@standardnotes/common'
import { PurePayload } from '@standardnotes/payloads'
import { SNActionsExtension } from './app/extension'
import { SNComponent } from '@Models/app/component'
import { SNEditor } from './app/editor'
import { SNItem } from './core/item'
import { SNItemsKey } from './app/items_key'
import { SNNote } from './app/note'
import { SmartView } from './app/SmartView'
import { SNTag } from './app/tag'
import { SNTheme } from './app/theme'
import { SNUserPrefs } from './app/userPrefs'

const ContentTypeClassMapping: Partial<Record<ContentType, new (payload: PurePayload) => SNItem>> =
  {
    [ContentType.Note]: SNNote,
    [ContentType.Tag]: SNTag,
    [ContentType.ItemsKey]: SNItemsKey,
    [ContentType.SmartView]: SmartView,
    [ContentType.ActionsExtension]: SNActionsExtension,
    [ContentType.Editor]: SNEditor,
    [ContentType.Theme]: SNTheme,
    [ContentType.Component]: SNComponent,
    [ContentType.UserPrefs]: SNUserPrefs,
    [ContentType.ExtensionRepo]: SNFeatureRepo,
    [ContentType.File]: SNFile,
  }

export function CreateItemFromPayload<T extends SNItem>(payload: PurePayload): T {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const itemClass = ContentTypeClassMapping[payload.content_type!] || SNItem
  const item = new itemClass(payload)
  return item as T
}
