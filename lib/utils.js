export function getGlobalScope() {
  return typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null);
}

export function ieOrEdge() {
  return (typeof document !== 'undefined' && document.documentMode) || /Edge/.test(navigator.userAgent);
}

export function isWebEnvironment()  {
  return getGlobalScope() !== null;
}

export function isWebCryptoAvailable() {
  return !ieOrEdge() && getGlobalScope().crypto && getGlobalScope().crypto.subtle;
}

export function generateUUIDSync() {
  const globalScope = getGlobalScope();
  const crypto = globalScope.crypto || globalScope.msCrypto;
  if(crypto) {
    var buf = new Uint32Array(4);
    crypto.getRandomValues(buf);
    var idx = -1;
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      idx++;
      var r = (buf[idx>>3] >> ((idx%8)*4))&15;
      var v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  } else {
    var d = new Date().getTime();
    if(globalScope.performance && typeof globalScope.performance.now === "function"){
      d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random()*16)%16 | 0;
      d = Math.floor(d/16);
      return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
  }
}
