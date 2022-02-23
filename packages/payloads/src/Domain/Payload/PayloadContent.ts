/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContentReference } from '../Tag/ContentReference'

export type PayloadContent = {
  [key: string]: any
  references: ContentReference[]
}
