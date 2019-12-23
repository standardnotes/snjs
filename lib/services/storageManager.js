/**
 * SFStorageManager should be subclassed, and all the methods below overriden.
 */

export class SFStorageManager {

  async setItem(key, value) {

  }

  async getItem(key) {

  }

  async removeItem(key) {

  }

  async clear() {
    // clear only simple key/values
  }

  /**
   * Model Storage
   */

  async getAllModels() {

  }

  async saveModel(item) {
    return this.saveModels([item]);
  }

  async saveModels(items) {

  }

  async deleteModel(item) {

  }

  async clearAllModels() {
    // clear only models
  }

  /**
   * General
   */

  async clearAllData() {
    return Promise.all([
      this.clear(),
      this.clearAllModels()
    ])
  }
}
