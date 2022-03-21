import { SNFile } from './Items/file'
import { SNFeatureRepo } from './Items/feature_repo'
import { ContentType } from '@standardnotes/common'
import { PurePayload } from '@standardnotes/payloads'
import { SNActionsExtension } from './Items/extension'
import { SNComponent } from '@Lib/models/Items/component'
import { SNEditor } from './Items/editor'
import { SNItem } from './Items/item'
import { SNItemsKey } from './Items/items_key'
import { SNNote } from './Items/note'
import { SmartView } from './Items/SmartView'
import { SNTag } from './Items/tag'
import { SNTheme } from './Items/theme'
import { SNUserPrefs } from './Items/userPrefs'

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
