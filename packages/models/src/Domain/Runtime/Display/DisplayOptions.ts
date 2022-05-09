import { ContentType } from '@standardnotes/common'
import { SmartView } from '../../Syncable/SmartView'
import { SNTag } from '../../Syncable/Tag'
import { CollectionSortDirection, CollectionSortProperty } from '../Collection/CollectionSort'
import { SearchQuery } from './Search/Types'

export interface DisplayOptions {
  sortBy?: CollectionSortProperty
  sortDirection?: CollectionSortDirection
  hiddenContentTypes?: ContentType[]
  tags?: SNTag[]
  views?: SmartView[]
  searchQuery?: SearchQuery
  includePinned?: boolean
  includeProtected?: boolean
  includeTrashed?: boolean
  includeArchived?: boolean
}
