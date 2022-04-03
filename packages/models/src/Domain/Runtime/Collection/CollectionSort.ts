export interface SortableItem {
  created_at: Date
  userModifiedDate: Date
  title?: string
}

export const CollectionSort: Record<string, keyof SortableItem> = {
  CreatedAt: 'created_at',
  UpdatedAt: 'userModifiedDate',
  Title: 'title',
}

export type CollectionSortDirection = 'asc' | 'dsc'