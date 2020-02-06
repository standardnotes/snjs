export class PayloadsDelta {
  /**
   * @param baseCollection The authoratitive collection on top of which to compute changes.
   * @param applyCollection The collection of payloads to apply, from one given source only.
   * @param relatedCollectionSet A collection set (many collections) that contain payloads
   *                             that may be neccessary to carry out computation.
   */
  constructor({baseCollection, applyCollection, relatedCollectionSet}) {
    this.baseCollection = baseCollection;
    this.applyCollection = applyCollection;
    this.relatedCollectionSet = relatedCollectionSet;
  }

  async resultingCollection() {
    throw 'Must override PayloadDelta.resultingCollection.';
  }

  findBasePayload({id}) {
    return this.baseCollection.findPayload(id);
  }

  findRelatedPayload({id, source})  {
    const collection = this.relatedCollectionSet.collectionForSource(source);
    return collection.findPayload(id);
  }
}