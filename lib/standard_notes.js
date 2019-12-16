import { SFCryptoWeb } from '@Crypto/webcrypto'
import { SFCryptoJS } from '@Crypto/cryptojs'
import { SFItemTransformer } from '@Crypto/item_transformer'

class StandardNotes {
  constructor(cryptoInstance) {
    const globalScope = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : null);
    // This library runs in native environments as well (react native)
    if(globalScope) {
      // detect IE8 and above, and edge.
      // IE and Edge do not support pbkdf2 in WebCrypto, therefore we need to use CryptoJS
      var IEOrEdge = (typeof document !== 'undefined' && document.documentMode) || /Edge/.test(navigator.userAgent);

      if(!IEOrEdge && (globalScope.crypto && globalScope.crypto.subtle)) {
        this.crypto = new SFCryptoWeb();
      } else {
        this.crypto = new SFCryptoJS();
      }
    }

    // This must be placed outside window check, as it's used in native.
    if(cryptoInstance) {
      this.crypto = cryptoInstance;
    }

    this.itemTransformer = new SFItemTransformer(this.crypto);

    this.crypto.defaults = {
      version : this.version(),
      defaultPasswordGenerationCost : this.defaultPasswordGenerationCost()
    }
  }

  version() {
    return "003";
  }

  supportsPasswordDerivationCost(cost) {
    // some passwords are created on platforms with stronger pbkdf2 capabilities, like iOS,
    // which CryptoJS can't handle here (WebCrypto can however).
    // if user has high password cost and is using browser that doesn't support WebCrypto,
    // we want to tell them that they can't login with this browser.
    if(cost > 5000) {
      return this.crypto instanceof SFCryptoWeb;
    } else {
      return true;
    }
  }

  // Returns the versions that this library supports technically.
  supportedVersions() {
    return ["001", "002", "003"];
  }

  isVersionNewerThanLibraryVersion(version) {
    var libraryVersion = this.version();
    return parseInt(version) > parseInt(libraryVersion);
  }

  isProtocolVersionOutdated(version) {
    // YYYY-MM-DD
    let expirationDates = {
      "001" : Date.parse("2018-01-01"),
      "002" : Date.parse("2020-01-01"),
    }

    let date = expirationDates[version];
    if(!date) {
      // No expiration date, is active version
      return false;
    }
    let expired = new Date() > date;
    return expired;
  }

  costMinimumForVersion(version) {
    return {
      "001" : 3000,
      "002" : 3000,
      "003" : 110000
    }[version];
  }

  defaultPasswordGenerationCost() {
    return this.costMinimumForVersion(this.version());
  }
}

const SNJS = new StandardNotes();
export {StandardNotes, SNJS}
