import { addIfUnique, removeFromArray } from '@Lib/utils';
import { UuidString } from './../../types';

export class UuidMap {
  /** uuid to uuids that we have a relationship with */
  private directMap: Partial<Record<UuidString, UuidString[]>> = {};
  /** uuid to uuids that have a relationship with us */
  private inverseMap: Partial<Record<UuidString, UuidString[]>> = {};

  public makeCopy() {
    const copy = new UuidMap();
    copy.directMap = Object.assign({}, this.directMap);
    copy.inverseMap = Object.assign({}, this.inverseMap);
    return copy;
  }

  public getDirectRelationships(uuid: UuidString) {
    return this.directMap[uuid] || [];
  }

  public getInverseRelationships(uuid: UuidString) {
    return this.inverseMap[uuid] || [];
  }

  public establishRelationship(uuidA: UuidString, uuidB: UuidString) {
    this.establishDirectRelationship(uuidA, uuidB);
    this.establishInverseRelationship(uuidA, uuidB);
  }

  public deestablishRelationship(uuidA: UuidString, uuidB: UuidString) {
    this.deestablishDirectRelationship(uuidA, uuidB);
    this.deestablishInverseRelationship(uuidA, uuidB);
  }

  public setAllRelationships(uuid: UuidString, relationships: UuidString[]) {
    const previousDirect = this.directMap[uuid] || [];
    this.directMap[uuid] = relationships;

    /** Remove all previous values in case relationships have changed
     * The updated references will be added afterwards.
     */
    for (const previousRelationship of previousDirect) {
      this.deestablishInverseRelationship(uuid, previousRelationship);
    }

    /** Now map current relationships */
    for (const newRelationship of relationships) {
      this.establishInverseRelationship(uuid, newRelationship);
    }
  }

  public removeFromMap(uuid: UuidString) {
    /** Items that we reference */
    const directReferences = this.directMap[uuid] || [];
    for (const directReference of directReferences) {
      removeFromArray(this.inverseMap[directReference] || [], uuid);
    }
    delete this.directMap[uuid];

    /** Items that are referencing us */
    const inverseReferences = this.inverseMap[uuid] || [];
    for (const inverseReference of inverseReferences) {
      removeFromArray(this.directMap[inverseReference] || [], uuid);
    }
    delete this.inverseMap[uuid];
  }

  private establishDirectRelationship(uuidA: UuidString, uuidB: UuidString) {
    const index = this.directMap[uuidA] || [];
    addIfUnique(index, uuidB);
    this.directMap[uuidA] = index;
  }

  private establishInverseRelationship(uuidA: UuidString, uuidB: UuidString) {
    const inverseIndex = this.inverseMap[uuidB] || [];
    addIfUnique(inverseIndex, uuidA);
    this.inverseMap[uuidB] = inverseIndex;
  }

  private deestablishDirectRelationship(uuidA: UuidString, uuidB: UuidString) {
    const index = this.directMap[uuidA] || [];
    removeFromArray(index, uuidB);
    this.directMap[uuidA] = index;
  }

  private deestablishInverseRelationship(uuidA: UuidString, uuidB: UuidString) {
    const inverseIndex = this.inverseMap[uuidB] || [];
    removeFromArray(inverseIndex, uuidA);
    this.inverseMap[uuidB] = inverseIndex;
  }
}
