import { SNItem } from './item';
import { PredicateInterface } from './interface';

export class NotPredicate<T extends SNItem> implements PredicateInterface<T> {
  constructor(private readonly targetValue: PredicateInterface<T>) {}

  matchesItem(item: T): boolean {
    return !this.targetValue.matchesItem(item);
  }

  keypathIncludesVerb(verb: string): boolean {
    return this.targetValue.keypathIncludesVerb(verb);
  }
}
