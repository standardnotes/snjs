import { SNItem } from '@Models/core/item';
import { isString } from '@standardnotes/utils';

type FalseyValue = false | '' | null | undefined | typeof NaN;

type RawPredicateInArrayForm = string[];

type PredicateValue<T extends SNItem> =
  | string
  | RawPredicateInArrayForm
  | RawPredicateInArrayForm[]
  | Date
  | boolean
  | SNPredicate<T>
  | SNPredicate<T>[]
  | FalseyValue;

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

function toPredicate<T extends SNItem>(
  object: RawPredicateInArrayForm | SNPredicate<T>
): SNPredicate<T> {
  if (object instanceof SNPredicate) {
    return object;
  }
  if (Array.isArray(object)) {
    return SNPredicate.FromFlatArray<T>(object as RawPredicateInArrayForm);
  }
  return SNPredicate.FromJson(object);
}

type StringKey<T extends SNItem> = keyof T & string;

/**
 * A local-only construct that defines a built query that can be used to
 * dynamically search items.
 */
export class SNPredicate<T extends SNItem> {
  constructor(
    private keypath: StringKey<T>,
    private operator: PredicateOperator,
    private value: PredicateValue<T>
  ) {
    this.keypath = keypath;
    this.operator = operator;
    this.value = value;

    if (this.isRecursive()) {
      const array = this.value as RawPredicateInArrayForm[] | SNPredicate<T>[];
      this.value = (array as any[]).map(
        (element: RawPredicateInArrayForm | SNPredicate<T>) =>
          toPredicate<T>(element)
      );
    } else if (isArrayFlatPredicateRepresentation(value as string[])) {
      this.value = SNPredicate.FromFlatArray(this.value as string[]);
    } else if (this.value === 'true' || this.value === 'false') {
      /* If value is boolean string, convert to boolean */
      this.value = JSON.parse(this.value);
    }
  }

  static FromJson<T extends SNItem>(values: {
    keypath: StringKey<T>;
    operator: PredicateOperator;
    value: PredicateValue<T>;
  }): SNPredicate<T> {
    return new SNPredicate(values.keypath, values.operator, values.value);
  }

  static FromFlatArray<T extends SNItem>(
    array: RawPredicateInArrayForm
  ): SNPredicate<T> {
    return new SNPredicate(
      array[0] as StringKey<T>,
      array[1] as PredicateOperator,
      array[2]
    );
  }

  static FromDSLString<T extends SNItem>(dsl: string): SNPredicate<T> {
    let components = null;
    try {
      components = JSON.parse(dsl.substring(1, dsl.length));
    } catch (e) {
      throw Error('Invalid smart tag syntax');
    }

    return new SNPredicate(components[1], components[2], components[3]);
  }

  isRecursive(): boolean {
    return (
      Array.isArray(this.value) &&
      [PredicateOperator.And, PredicateOperator.Or].includes(this.operator)
    );
  }

  private valueAsArray() {
    return this.value as SNPredicate<T>[];
  }

  keypathIncludesVerb(verb: string): boolean {
    if (this.isRecursive()) {
      const subPredicates = this.value as SNPredicate<T>[];
      for (const subPredicate of subPredicates) {
        if (subPredicate.keypathIncludesVerb(verb)) {
          return true;
        }
      }
      return false;
    } else {
      return (this.keypath as string).includes(verb);
    }
  }

  static CompoundPredicate<T extends SNItem>(
    predicates: SNPredicate<T>[]
  ): SNPredicate<T> {
    return new SNPredicate(
      'ignored' as StringKey<T>,
      PredicateOperator.And,
      predicates
    );
  }

  static ObjectSatisfiesPredicate<T extends SNItem>(
    object: T,
    predicate: SNPredicate<T>
  ): boolean {
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

    if (typeof targetValue === 'string') {
      targetValue = targetValue.toLowerCase();
    }

    /* Process not before handling the keypath, because not does not use it. */
    if (predicate.operator === PredicateOperator.Not) {
      return !this.ObjectSatisfiesPredicate(
        object,
        targetValue as SNPredicate<T>
      );
    }

    const keyPathComponents = predicate.keypath.split('.');

    let valueAtKeyPath: PredicateValue<T> = keyPathComponents.reduce<any>(
      (previous, current) => {
        return previous && previous[current];
      },
      object
    );

    if (typeof valueAtKeyPath === 'string') {
      valueAtKeyPath = valueAtKeyPath.toLowerCase();
    }

    const falseyValues = [false, '', null, undefined, NaN];
    /**
     * The valueAtKeyPath is undefined either because the
     * property is nonexistent or the value is null.
     */
    if (valueAtKeyPath === undefined) {
      const isExpectingFalseyValue = falseyValues.includes(
        targetValue as FalseyValue
      );
      if (predicate.operator === PredicateOperator.NotEqual) {
        return !isExpectingFalseyValue;
      } else {
        return isExpectingFalseyValue;
      }
    }

    if (predicate.operator === PredicateOperator.Equals) {
      if (Array.isArray(valueAtKeyPath)) {
        return JSON.stringify(valueAtKeyPath) === JSON.stringify(targetValue);
      } else {
        return valueAtKeyPath === targetValue;
      }
    } else if (predicate.operator === PredicateOperator.NotEqual) {
      if (Array.isArray(valueAtKeyPath)) {
        return JSON.stringify(valueAtKeyPath) !== JSON.stringify(targetValue);
      } else {
        return valueAtKeyPath !== targetValue;
      }
    } else if (predicate.operator === PredicateOperator.LessThan) {
      return (valueAtKeyPath as number) < (targetValue as number);
    } else if (predicate.operator === PredicateOperator.GreaterThan) {
      return (valueAtKeyPath as number) > (targetValue as number);
    } else if (predicate.operator === PredicateOperator.LessThanOrEqualTo) {
      return (valueAtKeyPath as number) <= (targetValue as number);
    } else if (predicate.operator === PredicateOperator.GreaterThanOrEqualTo) {
      return (valueAtKeyPath as number) >= (targetValue as number);
    } else if (predicate.operator === PredicateOperator.StartsWith) {
      return (valueAtKeyPath as string).startsWith(targetValue as string);
    } else if (predicate.operator === PredicateOperator.In) {
      return (targetValue as any[]).indexOf(valueAtKeyPath) !== -1;
    } else if (predicate.operator === PredicateOperator.Includes) {
      return doesValueIncludeTargetValue(valueAtKeyPath, targetValue);
    } else if (predicate.operator === PredicateOperator.Matches) {
      const regex = new RegExp(targetValue as string);
      return regex.test(valueAtKeyPath as string);
    }
    return false;
  }

  static ItemSatisfiesPredicate<T extends SNItem>(
    item: T,
    predicate: SNPredicate<T>
  ): boolean {
    return this.ObjectSatisfiesPredicate(item, predicate);
  }

  static ItemSatisfiesPredicates<T extends SNItem>(
    item: T,
    predicates: SNPredicate<T>[]
  ): boolean {
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
  static DateFromString(string: string): Date {
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

function isArrayFlatPredicateRepresentation(array: string[]): boolean {
  return (
    array.length === 3 &&
    Object.values(PredicateOperator).includes(array[1] as PredicateOperator)
  );
}

/**
 * @param value Because we are resolving the `includes` operator, the given
 * value should be an array.
 * @param targetValue  The value we are checking to see if exists in itemValueArray
 */
function doesValueIncludeTargetValue<T extends SNItem>(
  value: PredicateValue<T>,
  targetValue: PredicateValue<T>
): boolean {
  // includes can be a string or a predicate (in array form)
  if (isString(value)) {
    return value.includes(targetValue as string);
  }

  if (isString(targetValue)) {
    return (value as string[] | string).includes(targetValue);
  }

  if (!Array.isArray(value)) {
    return false;
  }

  // is a predicate array or predicate object
  let innerValue: SNPredicate<T>;
  if (Array.isArray(targetValue)) {
    innerValue = SNPredicate.FromFlatArray(targetValue as string[]);
  } else {
    innerValue = targetValue as SNPredicate<T>;
  }

  for (const object of value) {
    if (SNPredicate.ObjectSatisfiesPredicate<T>(object as any, innerValue)) {
      return true;
    }
  }

  return false;
}
