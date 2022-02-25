/* eslint-disable @typescript-eslint/no-explicit-any */
import { PayloadField } from './PayloadField'
import { PayloadInterface } from './PayloadInterface'

export type PayloadOverride =
  | {
      [key in PayloadField]?: any;
    }
  | PayloadInterface;
