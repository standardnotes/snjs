export class PayloadCollectionSet {
  /**
   * @param collections An array of PayloadCollection objects.
   */
  constructor({collections}) {
    this.collections = collections;
    Object.freeze(this);
  }

  collectionForSource(source) {
    return this.collections.find((collection) => {
      return collection.source === source;
    })
  }
}
