import { SNItem } from './item';
import { PredicateInterface } from './interface';
import { StringKey } from './utils';

export class IncludesPredicate<T extends SNItem>
  implements PredicateInterface<T> {
  constructor(
    private readonly keypath: StringKey<T>,
    private readonly predicate: PredicateInterface<T>
  ) {}

  matchesItem(item: T): boolean {
    const keyPathComponents = this.keypath.split('.') as StringKey<T>[];

    const valueAtKeyPath: T = keyPathComponents.reduce<any>(
      (previous, current) => {
        return previous && previous[current];
      },
      item
    );

    if (!Array.isArray(valueAtKeyPath)) {
      return false;
    }

    return valueAtKeyPath.some((subItem) =>
      this.predicate.matchesItem(subItem)
    );
  }

  keypathIncludesVerb(verb: string): boolean {
    return this.predicate.keypathIncludesVerb(verb);
  }
}
