export enum MutationType {
  /**
   * The item was changed as part of a user interaction. This means that the item's
   * user modified date will be updated
   */
  UserInteraction = 1,
  /**
   * The item was changed as part of an internal operation, such as a migration.
   * This change will not updated the item's user modified date
   */
  Internal = 2,
  /**
   * The item was changed as part of an internal function that wishes to modify
   * internal item properties, such as lastSyncBegan, without modifying the item's dirty
   * state. By default all other mutation types will result in a dirtied result.
   */
  NonDirtying = 3,
}
