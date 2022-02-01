export class FakeWebCrypto {
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

  generateUUIDSync() {
    return this.randomString(16);
  }

  async generateUUID() {
    return this.randomString(16);
  }

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
    return btoa(text);
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
