/**
 * A local-only construct that defines a built query that can be used to 
 * dynamically search items.
 */
export class SNPredicate {
  constructor(keypath, operator, value) {
    this.keypath = keypath;
    this.operator = operator;
    this.value = value;

    if(SNPredicate.IsRecursiveOperator(this.operator)) {
      this.value = this.value.map((element) => {
        if(Array.isArray(element)) {
          return SNPredicate.FromArray(element);
        } else {
          return element;
        }
      });
    }
  }

  static CompoundPredicate(predicates) {
    return new SNPredicate('ignored', 'and', predicates);
  }

  static FromArray(array) {
    return new SNPredicate(array[0], array[1], array[2]);
  }

  static ObjectSatisfiesPredicate(object, predicate) {
    // Predicates may not always be created using the official constructor
    // so if it's still an array here, convert to object
    if(Array.isArray(predicate)) {
      predicate = this.FromArray(predicate);
    }

    if(SNPredicate.IsRecursiveOperator(predicate.operator)) {
      if(predicate.operator === 'and') {
        for(const subPredicate of predicate.value) {
          if (!this.ObjectSatisfiesPredicate(object, subPredicate)) {
            return false;
          }
        }
        return true;
      }
      if(predicate.operator === 'or') {
        for(const subPredicate of predicate.value) {
          if (this.ObjectSatisfiesPredicate(object, subPredicate)) {
            return true;
          }
        }
        return false;
      }
    }

    let predicateValue = predicate.value;
    if(typeof(predicateValue) === 'string' && predicateValue.includes('.ago')) {
      predicateValue = this.DateFromString(predicateValue);
    }

    const valueAtKeyPath = predicate.keypath.split('.').reduce((previous, current) => {
      return previous && previous[current];
    }, object);

    const falseyValues = [false, '', null, undefined, NaN];

    // If the value at keyPath is undefined, either because the property is nonexistent or the value is null.
    if(valueAtKeyPath === undefined) {
      if(predicate.operator === '!=') {
        return !falseyValues.includes(predicate.value);
      } else {
        return falseyValues.includes(predicate.value);
      }
    }

    if(predicate.operator === '=') {
      // Use array comparison
      if(Array.isArray(valueAtKeyPath)) {
        return JSON.stringify(valueAtKeyPath) === JSON.stringify(predicateValue);
      } else {
        return valueAtKeyPath === predicateValue;
      }
    } else if(predicate.operator === '!=') {
      // Use array comparison
      if(Array.isArray(valueAtKeyPath)) {
        return JSON.stringify(valueAtKeyPath) !== JSON.stringify(predicateValue);
      } else {
        return valueAtKeyPath !== predicateValue;
      }
    } else if(predicate.operator === '<')  {
      return valueAtKeyPath < predicateValue;
    } else if(predicate.operator === '>')  {
      return valueAtKeyPath > predicateValue;
    } else if(predicate.operator === '<=')  {
      return valueAtKeyPath <= predicateValue;
    } else if(predicate.operator === '>=')  {
      return valueAtKeyPath >= predicateValue;
    } else if(predicate.operator === 'startsWith')  {
      return valueAtKeyPath.startsWith(predicateValue);
    } else if(predicate.operator === 'in') {
      return predicateValue.indexOf(valueAtKeyPath) !== -1;
    } else if(predicate.operator === 'includes') {
      return this.resolveIncludesPredicate(valueAtKeyPath, predicateValue);
    } else if(predicate.operator === 'matches') {
      const regex = new RegExp(predicateValue);
      return regex.test(valueAtKeyPath);
    }

    return false;
  }

  static resolveIncludesPredicate(valueAtKeyPath, predicateValue) {
    // includes can be a string  or a predicate (in array form)
    if(typeof(predicateValue) === 'string') {
      // if string, simply check if the valueAtKeyPath includes the predicate value
      return valueAtKeyPath.includes(predicateValue);
    } else {
      // is a predicate array or predicate object
      let innerPredicate;
      if(Array.isArray(predicateValue)) {
        innerPredicate = SNPredicate.FromArray(predicateValue);
      } else {
        innerPredicate = predicateValue;
      }
      for(const obj of valueAtKeyPath) {
        if(this.ObjectSatisfiesPredicate(obj, innerPredicate)) {
          return true;
        }
      }
      return false;
    }
  }

  static ItemSatisfiesPredicate(item, predicate) {
    if(Array.isArray(predicate)) {
      predicate = SNPredicate.FromArray(predicate);
    }
    return this.ObjectSatisfiesPredicate(item, predicate);
  }

  static ItemSatisfiesPredicates(item, predicates) {
    for(const predicate of predicates) {
      if(!this.ItemSatisfiesPredicate(item, predicate)) {
        return false;
      }
    }
    return true;
  }

  static DateFromString(string) {
    // x.days.ago, x.hours.ago
    const comps = string.split('.');
    const unit = comps[1];
    const date = new Date;
    const offset = parseInt(comps[0]);
    if(unit === 'days') {
      date.setDate(date.getDate() - offset);
    } else if(unit === 'hours') {
      date.setHours(date.getHours() - offset);
    }
    return date;
  }

  static IsRecursiveOperator(operator) {
    return ['and', 'or'].includes(operator);
  }
}
