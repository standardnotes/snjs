import { SNItem } from '@Lib/Models'
import { PurePayload, PayloadSource } from '@standardnotes/payloads'

export type ChangeObserverCallback<T extends SNItem | PurePayload> = (
  /** The items are pre-existing but have been changed */
  changed: T[],

  /** The items have been newly inserted */
  inserted: T[],

  /** The items have been deleted from local state (and remote state if applicable) */
  discarded: T[],

  /** Items for which encrypted overwrite protection is enabled and enacted */
  ignored: T[],

  source: PayloadSource,
  sourceKey?: string,
) => void
