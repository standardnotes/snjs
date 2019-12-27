export function getGlobalScope() {
  return typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null);
}

export function isWebEnvironment()  {
  return getGlobalScope() !== null;
}

export function findInArray(array, key, value) {
  return array.find((item) => item[key] === value);
}

export function isNullOrUndefined(value) {
  return value === null || value === undefined;
}
