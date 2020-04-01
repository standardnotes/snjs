import { ComponentTransformer } from './../models/app/component';
import { SNComponent } from '@Models/app/component';
import { Copy } from '@Lib/utils';
import { CopyPayload } from '@Payloads/generator';
import { PayloadOverride, PayloadContent } from './../protocol/payloads/generator';
import { PayloadField } from './../protocol/payloads/fields';
import { SNItem } from './../models/core/item';
import { PayloadSource } from './../protocol/payloads/sources';
import { PurePayload } from './../protocol/payloads/pure_payload';
import { SNModelManager } from './model_manager';
import { ContentType } from '../models/content_types';


export class ItemManager {

  private modelManager?: SNModelManager
  private unsubInsertionObserver: any
  private unsubChangeObserver: any
  private resolveQueue: Record<string, SNItem[]> = {}

  constructor(modelManager: SNModelManager) {
    this.modelManager = modelManager;
    this.unsubChangeObserver = this.modelManager
      .addChangeObserver(ContentType.Any, this.onPayloadChange.bind(this));
    this.unsubInsertionObserver = this.modelManager
      .addInsertionObserver(this.onPayloadInsertion.bind(this));

    // this.systemSmartTags = SNSmartTag.systemSmartTags();
  }

  public deinit() {
    this.unsubChangeObserver();
    this.unsubChangeObserver = undefined;
    this.modelManager = undefined;
    // this.items.length = 0;
    // this.itemsKeys.length = 0;
    // this.notes.length = 0;
    // this.tags.length = 0;
    // this.components.length = 0;
    // this.itemsHash = {};
    this.resolveQueue = {};
  }

  private async onPayloadChange(
    allChangedPayloads: PurePayload[],
    nondeletedPayloads?: PurePayload[],
    deletedPayloads?: PurePayload[],
    source?: PayloadSource,
    sourceKey?: string
  ) {

  }

  private async onPayloadInsertion(
    payloads: PurePayload[],
    source?: PayloadSource,
    sourceKey?: string
  ) {

  }

  async transformComponent(
    component: SNComponent,
    transform: (transformer: ComponentTransformer) => void
  ) {
    const transformer = new ComponentTransformer(component);
    transform(transformer);
    const payload = transformer.getResult();
    return this.modelManager!.emitPayload(payload, PayloadSource.LocalChanged);
  }

  /**
   * Consumers wanting to modify an item should run it through this block,
   * so that data is properly mapped through our function, and latest state
   * is properly reconciled.
   * The alternative to calling this function is to modify an item directly, then
   * to call one of the mapping functions to propagate the new values.
   * @param properties - Key/value object of new values to set
   */
  public async changeItems(
    items: SNItem[],
    properties: PayloadOverride
  ) {
    const results: PurePayload[] = [];
    for (const item of items) {
      const payload = item.payloadRepresentation();
      const result = CopyPayload(payload, properties);
      results.push(result);
    }
    await this.modelManager!.emitPayloads(results, PayloadSource.LocalChanged);
  }

  /**
    * Sets the item as needing sync. The item is then run through the mapping function,
    * and propagated to mapping observers.
    * @param updateClientDate - Whether to update the item's "user modified date"
    */
  public async setItemDirty(
    item: SNItem,
    dirty = true,
    updateClientDate = false,
    source?: PayloadSource,
    sourceKey?: string
  ) {
    return this.setItemsDirty([item], dirty, updateClientDate, source, sourceKey);
  }

  /**
   * Similar to `setItemDirty`, but acts on an array of items as the first param.
   */
  public async setItemsDirty(
    items: SNItem[],
    dirty = true,
    updateClientDate = false,
    source?: PayloadSource,
    sourceKey?: string
  ) {
    for (const item of items) {
      item.setDirty(dirty, updateClientDate, true);
    }
    return this.mapItems(
      items,
      source || PayloadSource.LocalDirtied,
      sourceKey
    );
  }

  //     /** Second loop should process references */
  //     const allPayloads = [];
  //     const allItems = [];
  //     for(const uuid of Object.keys(processed)) {
  //     const { item, payload } = processed[uuid];
  //     allPayloads.push(payload);
  //     allItems.push(item);
  //     if (payload.content) {
  //         await this.resolveReferencesForItem(item);
  //     }
  //     const interestedItems = this.popItemsInterestedInMissingItem(item);
  //     for (const interestedItem of interestedItems) {
  //         interestedItem.addItemAsRelationship(item);
  //     }
  //     item.didCompleteMapping(source);
  // }
  // const newCollection = new PayloadCollection(
  //     allItems.map((item) => item.payloadRepresentation()),
  //     source
  // );
}