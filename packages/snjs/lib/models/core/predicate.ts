import { SNItem } from '@Models/core/item';
import { isString } from '@Lib/utils';

type PredicateType = string[] | SNPredicate;
type PredicateArray = Array<string[]> | SNPredicate[];
type PredicateValue = string | Date | boolean | PredicateType | PredicateArray;

export enum PredicateOperator {
  And = 'and',
  Or = 'or',
  Not = 'not',
  NotEqual = '!=',
  Equals = '=',
  LessThan = '<',
  GreaterThan = '>',
  LessThanOrEqualTo = '<=',
  GreaterThanOrEqualTo = '>=',
  StartsWith = 'startsWith',
  In = 'in',
  Includes = 'includes',
  Matches = 'matches',
}

function toPredicate(object: unknown): SNPredicate {
  if (object instanceof SNPredicate) {
    return object;
  }
  if (Array.isArray(object)) {
    return SNPredicate.FromArray(object);
  }
  return SNPredicate.FromJson(object);
}

/**
 * A local-only construct that defines a built query that can be used to
 * dynamically search items.
 */
export class SNPredicate {
  private keypath: string;
  private operator: PredicateOperator;
  private value: PredicateValue;

  constructor(
    keypath: string,
    operator: PredicateOperator,
    value: PredicateValue
  ) {
    this.keypath = keypath;
    this.operator = operator;
    this.value = value;

    if (this.isRecursive()) {
      const array = this.value as unknown[];
      this.value = array.map((element) => toPredicate(element));
    } else if (this.value === 'true' || this.value === 'false') {
      /* If value is boolean string, convert to boolean */
      this.value = JSON.parse(this.value);
    }
  }

  static FromJson(values: any) {
    return new SNPredicate(values.keypath, values.operator, values.value);
  }

  static FromArray(array: string[]) {
    return new SNPredicate(array[0], array[1] as PredicateOperator, array[2]);
  }

  isRecursive() {
    return [PredicateOperator.And, PredicateOperator.Or].includes(
      this.operator
    );
  }

  arrayRepresentation() {
    return [this.keypath, this.operator, this.value];
  }

  valueAsArray() {
    return this.value as PredicateArray;
  }

  keypathIncludesVerb(verb: string): boolean {
    if (this.isRecursive()) {
      for (const value of this.value as SNPredicate[]) {
        if (value.keypathIncludesVerb(verb)) {
          return true;
        }
      }
      return false;
    } else {
      return this.keypath.includes(verb);
    }
  }

  static CompoundPredicate(predicates: PredicateArray) {
    return new SNPredicate('ignored', PredicateOperator.And, predicates);
  }

  static ObjectSatisfiesPredicate(
    object: any,
    predicate: PredicateType
  ): boolean {
    /* Predicates may not always be created using the official constructor
       so if it's still an array here, convert to object */
    predicate = toPredicate(predicate);

    if (predicate.isRecursive()) {
      if (predicate.operator === PredicateOperator.And) {
        for (const subPredicate of predicate.valueAsArray()) {
          if (!this.ObjectSatisfiesPredicate(object, subPredicate)) {
            return false;
          }
        }
        return true;
      }
      if (predicate.operator === PredicateOperator.Or) {
        for (const subPredicate of predicate.valueAsArray()) {
          if (this.ObjectSatisfiesPredicate(object, subPredicate)) {
            return true;
          }
        }
        return false;
      }
    }

    let targetValue = predicate.value;
    if (typeof targetValue === 'string' && targetValue.includes('.ago')) {
      targetValue = this.DateFromString(targetValue);
    }

    /* Process not before handling the keypath, because not does not use it. */
    if (predicate.operator === PredicateOperator.Not) {
      return !this.ObjectSatisfiesPredicate(
        object,
        targetValue as PredicateType
      );
    }

    const valueAtKeyPath = predicate.keypath
      .split('.')
      .reduce((previous, current) => {
        return previous && previous[current];
      }, object);

    const falseyValues = [false, '', null, undefined, NaN];
    /* If the value at keyPath is undefined, either because the
      property is nonexistent or the value is null. */
    if (valueAtKeyPath === undefined) {
      if (predicate.operator === PredicateOperator.NotEqual) {
        return !falseyValues.includes(predicate.value as any);
      } else {
        return falseyValues.includes(predicate.value as any);
      }
    }

    if (predicate.operator === PredicateOperator.Equals) {
      /* Use array comparison */
      if (Array.isArray(valueAtKeyPath)) {
        return JSON.stringify(valueAtKeyPath) === JSON.stringify(targetValue);
      } else {
        return valueAtKeyPath === targetValue;
      }
    } else if (predicate.operator === PredicateOperator.NotEqual) {
      // Use array comparison
      if (Array.isArray(valueAtKeyPath)) {
        return JSON.stringify(valueAtKeyPath) !== JSON.stringify(targetValue);
      } else {
        return valueAtKeyPath !== targetValue;
      }
    } else if (predicate.operator === PredicateOperator.LessThan) {
      return valueAtKeyPath < targetValue;
    } else if (predicate.operator === PredicateOperator.GreaterThan) {
      return valueAtKeyPath > targetValue;
    } else if (predicate.operator === PredicateOperator.LessThanOrEqualTo) {
      return valueAtKeyPath <= targetValue;
    } else if (predicate.operator === PredicateOperator.GreaterThanOrEqualTo) {
      return valueAtKeyPath >= targetValue;
    } else if (predicate.operator === PredicateOperator.StartsWith) {
      return valueAtKeyPath.startsWith(targetValue);
    } else if (predicate.operator === PredicateOperator.In) {
      return (targetValue as any[]).indexOf(valueAtKeyPath) !== -1;
    } else if (predicate.operator === PredicateOperator.Includes) {
      return this.resolveIncludesPredicate(valueAtKeyPath, targetValue);
    } else if (predicate.operator === PredicateOperator.Matches) {
      const regex = new RegExp(targetValue as string);
      return regex.test(valueAtKeyPath);
    }
    return false;
  }

  /**
   * @param itemValueArray Because we are resolving the `includes` operator, the given
   * value should be an array.
   * @param containsValue  The value we are checking to see if exists in itemValueArray
   */
  static resolveIncludesPredicate(
    itemValueArray: Array<any>,
    containsValue: any
  ) {
    // includes can be a string or a predicate (in array form)
    if (isString(containsValue)) {
      // if string, simply check if the itemValueArray includes the predicate value
      return itemValueArray.includes(containsValue);
    } else {
      // is a predicate array or predicate object
      let innerPredicate;
      if (Array.isArray(containsValue)) {
        innerPredicate = SNPredicate.FromArray(containsValue);
      } else {
        innerPredicate = containsValue;
      }
      for (const obj of itemValueArray) {
        if (this.ObjectSatisfiesPredicate(obj, innerPredicate)) {
          return true;
        }
      }
      return false;
    }
  }

  static ItemSatisfiesPredicate(item: SNItem, predicate: SNPredicate) {
    return this.ObjectSatisfiesPredicate(item, predicate);
  }

  static ItemSatisfiesPredicates(item: SNItem, predicates: SNPredicate[]) {
    for (const predicate of predicates) {
      if (!this.ItemSatisfiesPredicate(item, predicate)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Predicate date strings are of form "x.days.ago" or "x.hours.ago"
   */
  static DateFromString(string: string) {
    const comps = string.split('.');
    const unit = comps[1];
    const date = new Date();
    const offset = parseInt(comps[0]);
    if (unit === 'days') {
      date.setDate(date.getDate() - offset);
    } else if (unit === 'hours') {
      date.setHours(date.getHours() - offset);
    }
    return date;
  }
}
