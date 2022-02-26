import { SNItem } from '@Models/core/item';
import { AllPredicateOperators, PredicateOperator } from './interface';

export type StringKey<T extends SNItem> = keyof T & string;

// export function isArrayFlatPredicateRepresentation(array: string[]): boolean {
//   return (
//     array.length === 3 &&
//     Object.values(AllPredicateOperators).includes(array[1] as PredicateOperator)
//   );
// }

/**
 * Predicate date strings are of form "x.days.ago" or "x.hours.ago"
 */
export function dateFromDSLDateString(string: string): Date {
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
