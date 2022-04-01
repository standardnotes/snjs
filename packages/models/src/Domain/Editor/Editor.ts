import { SNItem } from '../Item/Item'
import { ItemContent } from '../Item/ItemInterface'
import { SNNote } from '../Note/Note'
import { PayloadInterface } from '../Payload/PayloadInterface'

interface EditorContent extends ItemContent {
  notes: SNNote[]
  data: Record<string, unknown>
  url: string
  name: string
  default: boolean
  systemEditor: boolean
}

/**
 * @deprecated
 * Editor objects are depracated in favor of SNComponent objects
 */
export class SNEditor extends SNItem<EditorContent> {
  public readonly notes: SNNote[] = []
  public readonly data: Record<string, unknown> = {}
  public readonly url: string
  public readonly name: string
  public readonly isDefault: boolean
  public readonly systemEditor: boolean

  constructor(payload: PayloadInterface<EditorContent>) {
    super(payload)
    this.url = payload.safeContent.url
    this.name = payload.safeContent.name
    this.data = payload.safeContent.data || {}
    this.isDefault = payload.safeContent.default
    this.systemEditor = payload.safeContent.systemEditor
  }
}
