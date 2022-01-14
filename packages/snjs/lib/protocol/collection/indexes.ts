import { SNItem } from '../../models/core/item';

export interface ItemDelta {
  changed: SNItem[];
  inserted: SNItem[];
  discarded: SNItem[];
  ignored: SNItem[];
}

export interface SNIndex {
  onChange(delta: ItemDelta): void;
}
