import { SettingName } from '@standardnotes/settings';
import { DeleteSettingResponse, GetSettingResponse, ListSettingsResponse, UpdateSettingResponse, User } from '../api/responses';
import { UuidString } from '../../../../types';
import { SensitiveSettingName } from './SensitiveSettingName';
import { Settings } from './Settings';
interface SettingsAPI {
    listSettings(userUuid: UuidString): Promise<ListSettingsResponse>;
    updateSetting(userUuid: UuidString, settingName: string, settingValue: string, sensitive: boolean): Promise<UpdateSettingResponse>;
    getSetting(userUuid: UuidString, settingName: string): Promise<GetSettingResponse>;
    deleteSetting(userUuid: UuidString, settingName: string): Promise<DeleteSettingResponse>;
}
/**
 * SettingsGateway coordinates communication with the API service
 * wrapping the userUuid provision for simpler consumption
 */
export declare class SettingsGateway {
    private readonly settingsApi;
    private readonly userProvider;
    constructor(settingsApi: SettingsAPI, userProvider: {
        getUser: () => User | undefined;
    });
    isReadyForModification(): boolean;
    private getUser;
    private get userUuid();
    listSettings(): Promise<Partial<Settings>>;
    getSetting(name: SettingName): Promise<string | null>;
    getSensitiveSetting(name: SensitiveSettingName): Promise<boolean>;
    updateSetting(name: SettingName, payload: string, sensitive: boolean): Promise<void>;
    deleteSetting(name: SettingName): Promise<void>;
    deinit(): void;
}
export {};
