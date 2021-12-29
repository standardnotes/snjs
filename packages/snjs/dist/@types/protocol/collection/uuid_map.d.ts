import { UuidString } from './../../types';
/**
 * Maps a UUID to an array of UUIDS to establish either direct or inverse
 * relationships between UUID strings (represantative of items or payloads).
 */
export declare class UuidMap {
    /** uuid to uuids that we have a relationship with */
    private directMap;
    /** uuid to uuids that have a relationship with us */
    private inverseMap;
    makeCopy(): UuidMap;
    getDirectRelationships(uuid: UuidString): string[];
    getInverseRelationships(uuid: UuidString): string[];
    establishRelationship(uuidA: UuidString, uuidB: UuidString): void;
    deestablishRelationship(uuidA: UuidString, uuidB: UuidString): void;
    setAllRelationships(uuid: UuidString, relationships: UuidString[]): void;
    removeFromMap(uuid: UuidString): void;
    private establishDirectRelationship;
    private establishInverseRelationship;
    private deestablishDirectRelationship;
    private deestablishInverseRelationship;
}
