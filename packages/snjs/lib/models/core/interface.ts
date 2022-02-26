export interface PredicateInterface<T> {
  matchesItem(item: T): boolean;
  keypathIncludesVerb(verb: string): boolean;
}

export const AllPredicateCompoundOperators = ['and', 'or'] as const;
export type PredicateCompoundOperator = typeof AllPredicateCompoundOperators[number];

export const AllPredicateOperators = [
  ...AllPredicateCompoundOperators,
  '!=',
  '=',
  '<',
  '>',
  '<=',
  '>=',
  'startsWith',
  'in',
  'matches',
  'not',
  'includes',
] as const;

export type PredicateOperator = typeof AllPredicateOperators[number];

export type SureValue =
  | number
  | number[]
  | string[]
  | string
  | Date
  | boolean
  | false
  | '';

export type FalseyValue = false | '' | null | undefined;

export type PrimitiveOperand = SureValue | FalseyValue;