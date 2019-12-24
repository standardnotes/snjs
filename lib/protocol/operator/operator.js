export class SNProtocolOperator {
  constructor(crypto) {
    this.crypto = crypto;
  }

  async firstHalfOfKey(key) {
    return key.substring(0, key.length/2);
  }

  async secondHalfOfKey(key) {
    return key.substring(key.length/2, key.length);
  }

  async splitKey({key, numParts}) {
    const outputLength = output.length;
    const partLength = outputLength/numParts;
    const parts = [];
    for(const i = 0; i < numParts, i++) {
      const part = key.slice(partLength * i, partLength * (i + 1));
      parts.add(part);
    }
    return parts;
  }
}
