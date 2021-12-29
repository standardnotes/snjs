import { PureService } from '../pure_service';
import { SNApiService } from '../api/api_service';
import { SNSessionManager } from '../api/session_manager';
import { EmailBackupFrequency, SettingName } from '@standardnotes/settings';
import { SensitiveSettingName } from './SensitiveSettingName';
export declare class SNSettingsService extends PureService {
    private readonly sessionManager;
    private readonly apiService;
    private _provider;
    private _frequencyOptionsLabels;
    constructor(sessionManager: SNSessionManager, apiService: SNApiService);
    initializeFromDisk(): void;
    listSettings(): Promise<Partial<import("./Settings").Settings>>;
    getSetting(name: SettingName): Promise<string | null>;
    updateSetting(name: SettingName, payload: string, sensitive: boolean): Promise<void>;
    getSensitiveSetting(name: SensitiveSettingName): Promise<boolean>;
    deleteSetting(name: SettingName): Promise<void>;
    getEmailBackupFrequencyOptionLabel(frequency: EmailBackupFrequency): string;
    deinit(): void;
}
