export class SNKeychainDelegate {

  constructor({
    setKeyChainValue,
    getKeyChainValue,
    clearKeyChainValue
  }) {
    this.setKeyChainValue = setKeyChainValue;
    this.getKeyChainValue = getKeyChainValue;
    this.clearKeyChainValue = clearKeyChainValue;
  }

}
