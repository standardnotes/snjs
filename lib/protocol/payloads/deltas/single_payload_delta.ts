import { PayloadSource } from '@Payloads/sources';
import { PurePayload } from '@Payloads/pure_payload';
import { CreateItemFromPayload } from '@Models/generator';
import { ImmutablePayloadCollection } from '@Payloads/collection';
import { ConflictStrategy } from '@Payloads/deltas/strategies';
import { CopyPayload } from '@Payloads/generator';
import { PayloadsByDuplicating } from '@Payloads/functions';
import { greaterOfTwoDates, uniqCombineObjArrays } from '@Lib/utils';

export abstract class SinglePayloadDelta {

  protected readonly baseCollection: ImmutablePayloadCollection
  protected readonly basePayload: PurePayload
  protected readonly applyPayload: PurePayload
  protected readonly source: PayloadSource

  constructor(
    baseCollection: ImmutablePayloadCollection,
    basePayload: PurePayload,
    applyPayload: PurePayload,
    source: PayloadSource
  ) {
    this.baseCollection = baseCollection;
    this.basePayload = basePayload;
    this.applyPayload = applyPayload;
    this.source = source;
  }

  public abstract async resultingCollection() : Promise<ImmutablePayloadCollection>;
}
