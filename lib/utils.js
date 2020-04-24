export function getGlobalScope() {
  return typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null);
}

export function isWebEnvironment()  {
  return typeof document != 'undefined';
}

export function isReactNativeEnvironment()  {
  return typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
}

export function findInArray(array, key, value) {
  return array.find((item) => item[key] === value);
}
