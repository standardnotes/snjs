export class SNSmartTag extends SNTag {

  isReferencingArchivedNotes() {
    var predicate = this.content.predicate;
    if(Array.isArray(predicate))  {
      predicate = SFPredicate.fromArray(predicate);
    }
    return predicate.keypath.includes("archived");
  }

  constructor(json_ob) {
    super(json_ob);
    this.content_type = "SN|SmartTag";
  }

  static systemSmartTags() {
    return [
      new SNSmartTag({
        uuid: SNSmartTag.SystemSmartTagIdAllNotes,
        content: {
          title: "All notes",
          isAllTag: true,
          predicate: new SFPredicate.fromArray(["content_type", "=", "Note"])
        }
      }),
      new SNSmartTag({
        uuid: SNSmartTag.SystemSmartTagIdArchivedNotes,
        content: {
          title: "Archived",
          isArchiveTag: true,
          predicate: new SFPredicate.fromArray(["archived", "=", true])
        }
      }),
      new SNSmartTag({
        uuid: SNSmartTag.SystemSmartTagIdTrashedNotes,
        content: {
          title: "Trash",
          isTrashTag: true,
          predicate: new SFPredicate.fromArray(["trashed", "=", true])
        }
      })
    ]
  }
}

SNSmartTag.SystemSmartTagIdAllNotes = "all-notes";
SNSmartTag.SystemSmartTagIdArchivedNotes = "archived-notes";
SNSmartTag.SystemSmartTagIdTrashedNotes = "trashed-notes";
