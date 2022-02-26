import { ItemInterface } from './../Item/ItemInterface'
import { CompoundPredicate } from './compound_predicate'
import { IncludesPredicate } from './includes_predicate'
import {
  AllPredicateCompoundOperators,
  PredicateCompoundOperator,
  PredicateInterface,
  PredicateOperator,
  SureValue,
} from './interface'
import { NotPredicate } from './not_predicate'
import { Predicate } from './predicate'
import { StringKey } from './utils'

type RawPredicateInArrayForm = string[]

export function predicateFromArguments<T extends ItemInterface>(
  keypath: StringKey<T>,
  operator: PredicateOperator,
  value: SureValue | RawPredicateInArrayForm[],
): PredicateInterface<T> {
  if (AllPredicateCompoundOperators.includes(operator as PredicateCompoundOperator)) {
    return compoundPredicateFromArguments(operator, value)
  } else if (operator === 'not') {
    return new NotPredicate(predicateFromFlatArray(value as RawPredicateInArrayForm[]))
  } else if (operator === 'includes') {
    return new IncludesPredicate(
      keypath,
      predicateFromFlatArray(value as RawPredicateInArrayForm[]),
    )
  } else {
    return new Predicate(keypath, operator, value as SureValue)
  }
}

export function compoundPredicateFromArguments<T extends ItemInterface>(
  operator: PredicateOperator,
  value: SureValue | RawPredicateInArrayForm[],
): PredicateInterface<T> {
  const subPredicateJsons = value as RawPredicateInArrayForm[]
  const subPredicates = subPredicateJsons.map((jsonArray) => {
    return predicateFromFlatArray(jsonArray)
  })
  return new CompoundPredicate(operator as PredicateCompoundOperator, subPredicates)
}

export function notPredicateFromArguments<T extends ItemInterface>(
  value: RawPredicateInArrayForm,
): PredicateInterface<T> {
  const subPredicate = predicateFromFlatArray(value)
  return new NotPredicate(subPredicate)
}

export function includesPredicateFromArguments<T extends ItemInterface>(
  keypath: StringKey<T>,
  value: RawPredicateInArrayForm,
): PredicateInterface<T> {
  const subPredicate = predicateFromFlatArray(value)
  return new IncludesPredicate<T>(keypath, subPredicate)
}

export function predicateFromJson<T extends ItemInterface>(values: {
  keypath: StringKey<T>
  operator: PredicateOperator
  value: SureValue | RawPredicateInArrayForm[]
}): PredicateInterface<T> {
  return predicateFromArguments(values.keypath, values.operator, values.value)
}

export function predicateFromFlatArray<T extends ItemInterface>(
  array: RawPredicateInArrayForm | RawPredicateInArrayForm[],
): PredicateInterface<T> {
  return predicateFromJson<T>({
    keypath: array[0] as StringKey<T>,
    operator: array[1] as PredicateOperator,
    value: array[2],
  })
}

export function predicateFromDSLString<T extends ItemInterface>(
  dsl: string,
): PredicateInterface<T> {
  try {
    const components = JSON.parse(dsl.substring(1, dsl.length)) as string[]
    components.shift()
    return predicateFromFlatArray(components)
  } catch (e) {
    throw Error('Invalid smart tag syntax')
  }
}
