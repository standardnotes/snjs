"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServerSyncResponseResolver = void 0;
const models_1 = require("@standardnotes/models");
/**
 * Given a remote sync response, the resolver applies the incoming changes on top
 * of the current base state, and returns what the new global state should look like.
 * The response resolver is purely functional and does not modify global state, but instead
 * offers the 'recommended' new global state given a sync response and a current base state.
 */
class ServerSyncResponseResolver {
    constructor(payloadSet, baseCollection, payloadsSavedOrSaving, historyMap) {
        this.payloadSet = payloadSet;
        this.baseCollection = baseCollection;
        this.payloadsSavedOrSaving = payloadsSavedOrSaving;
        this.historyMap = historyMap;
    }
    collectionsByProcessingResponse() {
        return __awaiter(this, void 0, void 0, function* () {
            const collections = [];
            const collectionRetrieved = yield this.processRetrievedPayloads();
            if (collectionRetrieved.all().length > 0) {
                collections.push({
                    collection: collectionRetrieved,
                    source: models_1.PayloadEmitSource.RemoteRetrieved,
                });
            }
            const collectionSaved = yield this.processSavedPayloads();
            if (collectionSaved.all().length > 0) {
                collections.push({
                    collection: collectionSaved,
                    source: models_1.PayloadEmitSource.RemoteSaved,
                });
            }
            if (this.payloadSet.uuidConflictPayloads.length > 0) {
                const collectionUuidConflicts = yield this.processUuidConflictPayloads();
                if (collectionUuidConflicts.all().length > 0) {
                    collections.push({
                        collection: collectionUuidConflicts,
                        source: models_1.PayloadEmitSource.RemoteRetrieved,
                    });
                }
            }
            if (this.payloadSet.dataConflictPayloads.length > 0) {
                const collectionDataConflicts = yield this.processDataConflictPayloads();
                if (collectionDataConflicts.all().length > 0) {
                    collections.push({
                        collection: collectionDataConflicts,
                        source: models_1.PayloadEmitSource.RemoteRetrieved,
                    });
                }
            }
            if (this.payloadSet.rejectedPayloads.length > 0) {
                const collectionRejected = yield this.processRejectedPayloads();
                if (collectionRejected.all().length > 0) {
                    collections.push({
                        collection: collectionRejected,
                        source: models_1.PayloadEmitSource.RemoteRetrieved,
                    });
                }
            }
            return collections;
        });
    }
    processSavedPayloads() {
        return __awaiter(this, void 0, void 0, function* () {
            const delta = new models_1.DeltaRemoteSaved(this.baseCollection, this.payloadSet.savedPayloads);
            const result = yield delta.resultingCollection();
            return result;
        });
    }
    processRetrievedPayloads() {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = models_1.ImmutablePayloadCollection.WithPayloads(this.payloadSet.retrievedPayloads);
            const delta = new models_1.DeltaRemoteRetrieved(this.baseCollection, collection, this.payloadsSavedOrSaving, this.historyMap);
            const result = yield delta.resultingCollection();
            return result;
        });
    }
    processDataConflictPayloads() {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = models_1.ImmutablePayloadCollection.WithPayloads(this.payloadSet.dataConflictPayloads);
            const delta = new models_1.DeltaRemoteDataConflicts(this.baseCollection, collection, this.historyMap);
            const result = yield delta.resultingCollection();
            return result;
        });
    }
    processUuidConflictPayloads() {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = models_1.ImmutablePayloadCollection.WithPayloads(this.payloadSet.uuidConflictPayloads);
            const delta = new models_1.DeltaRemoteUuidConflicts(this.baseCollection, collection, this.historyMap);
            const result = yield delta.resultingCollection();
            return result;
        });
    }
    processRejectedPayloads() {
        return __awaiter(this, void 0, void 0, function* () {
            const collection = models_1.ImmutablePayloadCollection.WithPayloads(this.payloadSet.rejectedPayloads);
            const delta = new models_1.DeltaRemoteRejected(this.baseCollection, collection, this.historyMap);
            const result = yield delta.resultingCollection();
            return result;
        });
    }
}
exports.ServerSyncResponseResolver = ServerSyncResponseResolver;
