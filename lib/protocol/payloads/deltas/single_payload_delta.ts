import { PayloadSource } from '@Payloads/sources';
import { PurePayload } from '@Payloads/pure_payload';
import { ImmutablePayloadCollection } from "@Protocol/collection/payload_collection";

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
