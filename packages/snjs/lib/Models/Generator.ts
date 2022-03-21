import { SNFile } from './File/File'
import { SNFeatureRepo } from './FeatureRepo/FeatureRepo'
import { ContentType } from '@standardnotes/common'
import { PurePayload } from '@standardnotes/payloads'
import { SNActionsExtension } from './ActionsExtension/ActionsExtension'
import { SNComponent } from '@Lib/Models/Component/Component'
import { SNEditor } from './Editor/Editor'
import { SNItem } from './Item/Item'
import { SNItemsKey } from './ItemsKey'
import { SNNote } from './Note/Note'
import { SmartView } from './SmartView/SmartView'
import { SNTag } from './Tag/Tag'
import { SNTheme } from './Theme/Theme'
import { SNUserPrefs } from './UserPrefs/UserPrefs'

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
