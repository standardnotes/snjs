import { ContentType } from '@Lib/index'
import { SNNote, SNTag } from '../../Models'
import { isSystemView, SmartView } from '../../Models/SmartView/SmartView'
import { ItemDelta, SNIndex, ItemCollection } from '@standardnotes/payloads'
import {
  criteriaForSmartView,
  NotesDisplayCriteria,
  notesMatchingCriteria,
} from './notes_display_criteria'

/**
 * A view into ItemCollection that allows filtering by tag and smart view.
 */
export class ItemCollectionNotesView implements SNIndex {
  private displayedNotes: SNNote[] = []
  private needsRebuilding = true

  constructor(
    private collection: ItemCollection,
    private criteria: NotesDisplayCriteria = NotesDisplayCriteria.Create({}),
  ) {}

  public setCriteria(criteria: NotesDisplayCriteria): void {
    this.criteria = criteria
    this.collection.setDisplayOptions(
      ContentType.Note,
      criteria.sortProperty,
      criteria.sortDirection,
    )
    this.needsRebuilding = true
  }

  public notesMatchingSmartView(view: SmartView): SNNote[] {
    const criteria = criteriaForSmartView(view)
    return notesMatchingCriteria(criteria, this.collection)
  }

  public displayElements(): SNNote[] {
    if (this.needsRebuilding) {
      this.rebuildList()
    }
    return this.displayedNotes.slice()
  }

  private rebuildList(): void {
    this.displayedNotes = notesMatchingCriteria(this.currentCriteria, this.collection)
    this.needsRebuilding = false
  }

  private get currentCriteria(): NotesDisplayCriteria {
    const mostRecentVersionOfTags = this.criteria.tags
      .map((tag) => {
        return this.collection.find(tag.uuid) as SNTag
      })
      .filter((tag) => tag != undefined)

    const mostRecentVersionOfViews = this.criteria.views
      .map((view) => {
        if (isSystemView(view)) {
          return view
        }
        return this.collection.find(view.uuid) as SmartView
      })
      .filter((view) => view != undefined)

    const criteria = NotesDisplayCriteria.Copy(this.criteria, {
      tags: mostRecentVersionOfTags,
      views: mostRecentVersionOfViews,
    })

    return criteria
  }

  public onChange(_delta: ItemDelta): void {
    this.needsRebuilding = true
  }
}
