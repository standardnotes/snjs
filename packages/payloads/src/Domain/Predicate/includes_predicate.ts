import { ItemInterface } from './../Item/ItemInterface'
import { PredicateInterface } from './interface'
import { StringKey } from './utils'

export class IncludesPredicate<T extends ItemInterface> implements PredicateInterface<T> {
  constructor(
    private readonly keypath: StringKey<T>,
    public readonly predicate: PredicateInterface<T>,
  ) {}

  matchesItem(item: T): boolean {
    const keyPathComponents = this.keypath.split('.') as StringKey<T>[]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const valueAtKeyPath: T = keyPathComponents.reduce<any>((previous, current) => {
      return previous && previous[current]
    }, item)

    if (!Array.isArray(valueAtKeyPath)) {
      return false
    }

    return valueAtKeyPath.some((subItem) => this.predicate.matchesItem(subItem))
  }

  keypathIncludesString(verb: string): boolean {
    return this.predicate.keypathIncludesString(verb)
  }
}
