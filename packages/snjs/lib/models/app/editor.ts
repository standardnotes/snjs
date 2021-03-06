import { PurePayload } from './../../protocol/payloads/pure_payload';
import { SNItem } from '@Models/core/item';
import { SNNote } from './note';

/**
 * @deprecated
 * Editor objects are depracated in favor of SNComponent objects
 */
export class SNEditor extends SNItem {
  public readonly notes: SNNote[] = [];
  public readonly data: Record<string, unknown> = {};
  public readonly url!: string;
  public readonly name!: string;
  public readonly isDefault!: boolean;
  public readonly systemEditor!: boolean;

  constructor(payload: PurePayload) {
    super(payload);
    this.url = payload.safeContent.url;
    this.name = payload.safeContent.name;
    this.data = payload.safeContent.data || {};
    this.isDefault = payload.safeContent.default;
    this.systemEditor = payload.safeContent.systemEditor;
  }
}
