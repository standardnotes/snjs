import { ItemInterface } from './../Item/ItemInterface'
import {
  PredicateInterface,
  PredicateJsonForm,
  PredicateOperator,
  PrimitiveOperand,
  SureValue,
} from './Interface'
import { valueMatchesTargetValue } from './Operator'
import { StringKey } from './Utils'

/**
 * A local-only construct that defines a built query that
 * can be used to dynamically search items.
 */
export class Predicate<T extends ItemInterface> implements PredicateInterface<T> {
  constructor(
    public readonly keypath: StringKey<T>,
    public readonly operator: PredicateOperator,
    public readonly targetValue: SureValue,
  ) {
    if (this.targetValue === 'true' || this.targetValue === 'false') {
      this.targetValue = JSON.parse(this.targetValue)
    }
  }

  keypathIncludesString(verb: string): boolean {
    return (this.keypath as string).includes(verb)
  }

  matchesItem<T extends ItemInterface>(item: T): boolean {
    const keyPathComponents = this.keypath.split('.') as StringKey<T>[]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const valueAtKeyPath: PrimitiveOperand = keyPathComponents.reduce<any>((previous, current) => {
      return previous && previous[current]
    }, item)

    return valueMatchesTargetValue(valueAtKeyPath, this.operator, this.targetValue)
  }

  toJson(): PredicateJsonForm {
    return {
      keypath: this.keypath,
      operator: this.operator,
      value: this.targetValue,
    }
  }
}