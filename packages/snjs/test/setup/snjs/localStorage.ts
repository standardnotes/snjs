export type StorageObject = {
  [key: string]: any
};

/**
 * A simple localStorage implementation using in-memory storage.
 */
export class LocalStorage {
  constructor(private storageObject: StorageObject) { }

  getItem (key: string) {
    return this.storageObject[key];
  }

  setItem (key: string, value: any) {
    this.storageObject[key] = value;
  }

  removeItem (key: string) {
    delete this.storageObject[key];
  }

  clear () {
    this.storageObject = {}
  }
};
