import { ContentType } from '@standardnotes/common'
import { RegisterItemClass } from '@standardnotes/models'
import { SNItemsKey } from './ItemsKey'
import { ItemsKeyMutator } from './ItemsKeyMutator'

RegisterItemClass(ContentType.ItemsKey, SNItemsKey, ItemsKeyMutator)
