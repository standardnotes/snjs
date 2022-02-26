import { ItemInterface } from './../Item/ItemInterface'
import { PredicateInterface } from './Interface'

export class NotPredicate<T extends ItemInterface> implements PredicateInterface<T> {
  constructor(public readonly predicate: PredicateInterface<T>) {}

  matchesItem(item: T): boolean {
    return !this.predicate.matchesItem(item)
  }

  keypathIncludesString(verb: string): boolean {
    return this.predicate.keypathIncludesString(verb)
  }
}
