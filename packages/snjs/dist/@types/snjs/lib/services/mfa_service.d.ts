import { SNSettingsService } from './settings_service';
import { PureService } from './pure_service';
import { SNPureCrypto } from '@standardnotes/sncrypto-common';
import { SNFeaturesService } from './features_service';
export declare class SNMfaService extends PureService {
    private settingsService;
    private crypto;
    private featuresService;
    constructor(settingsService: SNSettingsService, crypto: SNPureCrypto, featuresService: SNFeaturesService);
    private saveMfaSetting;
    isMfaActivated(): Promise<boolean>;
    generateMfaSecret(): Promise<string>;
    getOtpToken(secret: string): Promise<string>;
    enableMfa(secret: string, otpToken: string): Promise<void>;
    disableMfa(): Promise<void>;
    isMfaFeatureAvailable(): boolean;
    deinit(): void;
}
