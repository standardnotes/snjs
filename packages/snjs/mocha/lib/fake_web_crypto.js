export default class FakeWebCrypto {
  constructor() {}

  deinit() {}

  randomString(len) {
    const charSet =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < len; i++) {
      const randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomString;
  }

  generateUUIDSync = () => {
    const globalScope = getGlobalScope()
    const crypto = globalScope.crypto || globalScope.msCrypto
    if (crypto) {
      const buf = new Uint32Array(4)
      crypto.getRandomValues(buf)
      let idx = -1
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        idx++
        const r = (buf[idx >> 3] >> ((idx % 8) * 4)) & 15
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    } else {
      let d = new Date().getTime()
      if (globalScope.performance && typeof globalScope.performance.now === 'function') {
        d += performance.now() // use high-precision timer if available
      }
      const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
      })
      return uuid
    }
  };

  generateUUID = async () => {
    return this.generateUUIDSync();
  };

  timingSafeEqual(a, b) {
    return a === b;
  }

  async base64Encode(text) {
    return btoa(text);
  }

  async base64Decode(base64String) {
    return atob(base64String);
  }

  async pbkdf2(password, salt, iterations, length) {
    return btoa(password);
  }

  async generateRandomKey(bits) {
    const length = bits / 8;
    return this.randomString(length);
  }

  async aes256CbcEncrypt(plaintext, iv, key) {
    return btoa(plaintext);
  }

  async aes256CbcDecrypt(ciphertext, iv, key) {
    return atob(ciphertext);
  }

  async hmac256(message, key) {
    return btoa(message + key);
  }

  async sha256(text) {
    return new SNWebCrypto().sha256(text);
  }

  async hmac1(message, key) {
    return btoa(message);
  }

  async unsafeSha1(text) {
    return btoa(message);
  }

  async argon2(password, salt, iterations, bytes, length) {
    return btoa(password);
  }

  async xchacha20Encrypt(plaintext, nonce, key, assocData) {
    return btoa(plaintext);
  }

  async xchacha20Decrypt(ciphertext, nonce, key, assocData) {
    return atob(ciphertext);
  }
}
