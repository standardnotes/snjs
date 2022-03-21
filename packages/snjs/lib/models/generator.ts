import { SNFile } from './Items/File/File'
import { SNFeatureRepo } from './Items/FeatureRepo/FeatureRepo'
import { ContentType } from '@standardnotes/common'
import { PurePayload } from '@standardnotes/payloads'
import { SNActionsExtension } from './ActionsExtension/ActionsExtension'
import { SNComponent } from '@Lib/models/Component/Component'
import { SNEditor } from './Items/Editor/Editor'
import { SNItem } from './Items/Item/Item'
import { SNItemsKey } from './Items/ItemsKey/ItemsKey'
import { SNNote } from './Items/Note/Note'
import { SmartView } from './Items/SmartView/SmartView'
import { SNTag } from './Items/Tag/Tag'
import { SNTheme } from './Items/Theme/Theme'
import { SNUserPrefs } from './Items/UserPrefs/UserPrefs'

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
