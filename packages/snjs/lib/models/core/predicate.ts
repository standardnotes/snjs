import { SNItem } from '@Models/core/item';
import {
  PredicateInterface,
  PredicateOperator,
  PrimitiveOperand,
  SureValue,
} from './interface';
import { valueMatchesTargetValue } from './operator';
import { StringKey } from './utils';

/**
 * A local-only construct that defines a built query that
 * can be used to dynamically search items.
 */
export class Predicate<T extends SNItem> implements PredicateInterface<T> {
  constructor(
    private readonly keypath: StringKey<T>,
    private readonly operator: PredicateOperator,
    private readonly targetValue: SureValue
  ) {
    if (this.targetValue === 'true' || this.targetValue === 'false') {
      this.targetValue = JSON.parse(this.targetValue);
    }
  }

  keypathIncludesVerb(verb: string): boolean {
    return (this.keypath as string).includes(verb);
  }

  matchesItem<T extends SNItem>(item: T): boolean {
    const keyPathComponents = this.keypath.split('.') as StringKey<T>[];

    const valueAtKeyPath: PrimitiveOperand = keyPathComponents.reduce<any>(
      (previous, current) => {
        return previous && previous[current];
      },
      item
    );

    return valueMatchesTargetValue(
      valueAtKeyPath,
      this.operator,
      this.targetValue
    );
  }

  static ItemSatisfiesPredicates<T extends SNItem>(
    item: T,
    predicates: Predicate<T>[]
  ): boolean {
    for (const predicate of predicates) {
      if (!predicate.matchesItem(item)) {
        return false;
      }
    }
    return true;
  }
}
