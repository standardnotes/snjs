import { Uuid } from '@standardnotes/common'
import { FeatureDescription } from '../Feature/FeatureDescription'
import { ComponentArea } from './ComponentArea'
import { ComponentPermission } from './ComponentPermission'

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ComponentContent {
  componentData: Record<string, any>
  /** Items that have requested a component to be disabled in its context */
  disassociatedItemIds: string[]
  /** Items that have requested a component to be enabled in its context */
  associatedItemIds: string[]
  local_url: string | null
  hosted_url?: string
  offlineOnly: boolean
  name: string
  autoupdateDisabled: boolean
  package_info: FeatureDescription
  area: ComponentArea
  permissions: ComponentPermission[]
  valid_until: Date | number
  active: boolean
  legacy_url?: string
  isMobileDefault: boolean
  isDeprecated: boolean
  isExplicitlyEnabledForItem(uuid: Uuid): boolean
}
