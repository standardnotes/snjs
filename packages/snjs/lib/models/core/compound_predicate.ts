import { SNItem } from './item';
import { PredicateCompoundOperator, PredicateInterface } from './interface';

export class CompoundPredicate<T extends SNItem>
  implements PredicateInterface<T> {
  constructor(
    public readonly operator: PredicateCompoundOperator,
    public readonly predicates: PredicateInterface<T>[]
  ) {}

  matchesItem(item: T): boolean {
    if (this.operator === 'and') {
      for (const subPredicate of this.predicates) {
        if (!subPredicate.matchesItem(item)) {
          return false;
        }
      }
      return true;
    }

    if (this.operator === 'or') {
      for (const subPredicate of this.predicates) {
        if (subPredicate.matchesItem(item)) {
          return true;
        }
      }
      return false;
    }

    return false;
  }

  keypathIncludesVerb(verb: string): boolean {
    const subPredicates = this.predicates;
    for (const subPredicate of subPredicates) {
      if (subPredicate.keypathIncludesVerb(verb)) {
        return true;
      }
    }
    return false;
  }
}
