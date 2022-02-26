import { ItemInterface } from './../Item/ItemInterface'
import { PredicateCompoundOperator, PredicateInterface } from './Interface'

export class CompoundPredicate<T extends ItemInterface> implements PredicateInterface<T> {
  constructor(
    public readonly operator: PredicateCompoundOperator,
    public readonly predicates: PredicateInterface<T>[],
  ) {}

  matchesItem(item: T): boolean {
    if (this.operator === 'and') {
      for (const subPredicate of this.predicates) {
        if (!subPredicate.matchesItem(item)) {
          return false
        }
      }
      return true
    }

    if (this.operator === 'or') {
      for (const subPredicate of this.predicates) {
        if (subPredicate.matchesItem(item)) {
          return true
        }
      }
      return false
    }

    return false
  }

  keypathIncludesString(verb: string): boolean {
    for (const subPredicate of this.predicates) {
      if (subPredicate.keypathIncludesString(verb)) {
        return true
      }
    }
    return false
  }
}
