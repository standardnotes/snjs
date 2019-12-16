export class SFPredicate {

  constructor(keypath, operator, value) {
    this.keypath = keypath;
    this.operator = operator;
    this.value = value;

    // Preprocessing to make predicate evaluation faster.
    // Won't recurse forever, but with arbitrarily large input could get stuck. Hope there are input size limits
    // somewhere else.
    if(SFPredicate.IsRecursiveOperator(this.operator)) {
      this.value = this.value.map(SFPredicate.fromArray);
    }
  }

  static fromArray(array) {
    return new SFPredicate(array[0],array[1],array[2]);
  }

  static ObjectSatisfiesPredicate(object, predicate) {
    // Predicates may not always be created using the official constructor
    // so if it's still an array here, convert to object
    if(Array.isArray(predicate)) {
      predicate = this.fromArray(predicate);
    }

    if(SFPredicate.IsRecursiveOperator(predicate.operator)) {
      if(predicate.operator === "and") {
        for(var subPredicate of predicate.value) {
          if (!this.ObjectSatisfiesPredicate(object, subPredicate)) {
            return false;
          }
        }
        return true;
      }
      if(predicate.operator === "or") {
        for(var subPredicate of predicate.value) {
          if (this.ObjectSatisfiesPredicate(object, subPredicate)) {
            return true;
          }
        }
        return false;
      }
    }

    var predicateValue = predicate.value;
    if(typeof(predicateValue) == 'string' && predicateValue.includes(".ago")) {
      predicateValue = this.DateFromString(predicateValue);
    }

    var valueAtKeyPath = predicate.keypath.split('.').reduce((previous, current) => {
      return previous && previous[current]
    }, object);

    const falseyValues = [false, "", null, undefined, NaN];

    // If the value at keyPath is undefined, either because the property is nonexistent or the value is null.
    if(valueAtKeyPath == undefined) {
      if(predicate.operator == "!=") {
        return !falseyValues.includes(predicate.value);
      } else {
        return falseyValues.includes(predicate.value);
      }
    }

    if(predicate.operator == "=") {
      // Use array comparison
      if(Array.isArray(valueAtKeyPath)) {
        return JSON.stringify(valueAtKeyPath) == JSON.stringify(predicateValue);
      } else {
        return valueAtKeyPath == predicateValue;
      }
    } else if(predicate.operator == "!=") {
      // Use array comparison
      if(Array.isArray(valueAtKeyPath)) {
        return JSON.stringify(valueAtKeyPath) != JSON.stringify(predicateValue);
      } else {
        return valueAtKeyPath !== predicateValue;
      }
    } else if(predicate.operator == "<")  {
      return valueAtKeyPath < predicateValue;
    } else if(predicate.operator == ">")  {
      return valueAtKeyPath > predicateValue;
    } else if(predicate.operator == "<=")  {
      return valueAtKeyPath <= predicateValue;
    } else if(predicate.operator == ">=")  {
      return valueAtKeyPath >= predicateValue;
    } else if(predicate.operator == "startsWith")  {
      return valueAtKeyPath.startsWith(predicateValue);
    } else if(predicate.operator == "in") {
      return predicateValue.indexOf(valueAtKeyPath) != -1;
    } else if(predicate.operator == "includes") {
      return this.resolveIncludesPredicate(valueAtKeyPath, predicateValue);
    } else if(predicate.operator == "matches") {
      var regex = new RegExp(predicateValue);
      return regex.test(valueAtKeyPath);
    }

    return false;
  }

  static resolveIncludesPredicate(valueAtKeyPath, predicateValue) {
    // includes can be a string  or a predicate (in array form)
    if(typeof(predicateValue) == 'string') {
      // if string, simply check if the valueAtKeyPath includes the predicate value
      return valueAtKeyPath.includes(predicateValue);
    } else {
      // is a predicate array or predicate object
      var innerPredicate;
      if(Array.isArray(predicateValue)) {
        innerPredicate = SFPredicate.fromArray(predicateValue);
      } else {
        innerPredicate = predicateValue;
      }
      for(var obj of valueAtKeyPath) {
        if(this.ObjectSatisfiesPredicate(obj, innerPredicate)) {
          return true;
        }
      }
      return false;
    }
  }

  static ItemSatisfiesPredicate(item, predicate) {
    if(Array.isArray(predicate)) {
      predicate = SFPredicate.fromArray(predicate);
    }
    return this.ObjectSatisfiesPredicate(item, predicate);
  }

  static ItemSatisfiesPredicates(item, predicates) {
    for(var predicate of predicates) {
      if(!this.ItemSatisfiesPredicate(item, predicate)) {
        return false;
      }
    }
    return true;
  }

  static DateFromString(string) {
    // x.days.ago, x.hours.ago
    var comps = string.split(".");
    var unit = comps[1];
    var date = new Date;
    var offset = parseInt(comps[0]);
    if(unit == "days") {
      date.setDate(date.getDate() - offset);
    } else if(unit == "hours") {
      date.setHours(date.getHours() - offset);
    }
    return date;
  }

  static IsRecursiveOperator(operator) {
    return ["and", "or"].includes(operator);
  }
}
