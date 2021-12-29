import { ApplicationStage } from '../../../stages';
import { SNFeatureRepo } from './../models/app/feature_repo';
import { SNSyncService } from './sync/sync_service';
import { SNCredentialService } from './credential_service';
import { PureService } from './pure_service';
import { SNStorageService } from './storage_service';
import { RoleName } from '@standardnotes/auth';
import { SNApiService } from './api/api_service';
import { ErrorObject, UuidString } from '../../../types';
import { FeatureDescription, FeatureIdentifier } from '@standardnotes/features';
import { ItemManager } from './item_manager';
import { SNComponent } from '../../../models';
import { SNWebSocketsService } from './api/websockets_service';
import { SNSettingsService } from './settings_service';
import { SNSessionManager } from '../../../services/api/session_manager';
import { SNPureCrypto } from '@standardnotes/sncrypto-common';
import { SNAlertService } from '../../../services/alert_service';
export declare type SetOfflineFeaturesFunctionResponse = ErrorObject | undefined;
export declare type OfflineSubscriptionEntitlements = {
    featuresUrl: string;
    extensionKey: string;
};
export declare const enum FeaturesEvent {
    UserRolesChanged = "UserRolesChanged",
    FeaturesUpdated = "FeaturesUpdated"
}
export declare const enum FeatureStatus {
    NoUserSubscription = "NoUserSubscription",
    NotInCurrentPlan = "NotInCurrentPlan",
    InCurrentPlanButExpired = "InCurrentPlanButExpired",
    Entitled = "Entitled"
}
export declare class SNFeaturesService extends PureService<FeaturesEvent> {
    private storageService;
    private apiService;
    private itemManager;
    private webSocketsService;
    private settingsService;
    private credentialService;
    private syncService;
    private alertService;
    private sessionManager;
    private crypto;
    private deinited;
    private roles;
    private features;
    private removeApiServiceObserver;
    private removeWebSocketsServiceObserver;
    private removefeatureReposObserver;
    private removeSignInObserver;
    private needsInitialFeaturesUpdate;
    private completedSuccessfulFeaturesRetrieval;
    constructor(storageService: SNStorageService, apiService: SNApiService, itemManager: ItemManager, webSocketsService: SNWebSocketsService, settingsService: SNSettingsService, credentialService: SNCredentialService, syncService: SNSyncService, alertService: SNAlertService, sessionManager: SNSessionManager, crypto: SNPureCrypto);
    handleApplicationStage(stage: ApplicationStage): Promise<void>;
    setOfflineFeaturesCode(code: string): Promise<SetOfflineFeaturesFunctionResponse>;
    private getOfflineRepo;
    hasOfflineRepo(): boolean;
    deleteOfflineFeatureRepo(): Promise<void>;
    private parseOfflineEntitlementsCode;
    private downloadOfflineFeatures;
    migrateFeatureRepoToUserSetting(featureRepos?: SNFeatureRepo[]): Promise<void>;
    migrateFeatureRepoToOfflineEntitlements(featureRepos?: SNFeatureRepo[]): Promise<void>;
    initializeFromDisk(): Promise<void>;
    updateRolesAndFetchFeatures(userUuid: UuidString, roles: RoleName[]): Promise<void>;
    private setRoles;
    didDownloadFeatures(features: FeatureDescription[]): Promise<void>;
    getFeature(featureId: FeatureIdentifier): FeatureDescription | undefined;
    hasPaidOnlineOrOfflineSubscription(): boolean;
    getFeatureStatus(featureId: FeatureIdentifier): FeatureStatus;
    private haveRolesChanged;
    private componentContentForNativeFeatureDescription;
    private mapFeaturesToItems;
    validateAndDownloadExternalFeature(urlOrCode: string): Promise<SNComponent | undefined>;
    private downloadExternalFeature;
    deinit(): void;
}
