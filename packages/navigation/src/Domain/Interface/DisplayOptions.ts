import { DisplayOptions } from '@standardnotes/models'

export interface NavigationDisplayOptions {
  searchQuery?: DisplayOptions['searchQuery']
  includePinned?: DisplayOptions['includePinned']
  includeProtected?: DisplayOptions['includeProtected']
  includeTrashed?: DisplayOptions['includeTrashed']
  includeArchived?: DisplayOptions['includeArchived']
  sortBy: DisplayOptions['sortBy']
  sortDirection: DisplayOptions['sortDirection']
  hiddenContentTypes?: DisplayOptions['hiddenContentTypes']
  customFilter?: DisplayOptions['customFilter']
}
