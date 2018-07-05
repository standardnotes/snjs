export class SmartTag extends Tag {

  isReferencingArchivedNotes() {
    var predicate = this.content.predicate;
    if(Array.isArray(predicate))  {
      predicate = SFPredicate.fromArray(predicate);
    }
    return predicate.keypath.includes("archived");
  }

  get content_type() {
    return "SN|SmartTag";
  }

}
