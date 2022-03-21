import {
  DeleteSettingResponse,
  GetSettingResponse,
  ListSettingsResponse,
  UpdateSettingResponse,
} from '@standardnotes/responses'
import { UuidString } from '@Lib/types'

export interface SettingsServerInterface {
  listSettings(userUuid: UuidString): Promise<ListSettingsResponse>

  updateSetting(
    userUuid: UuidString,
    settingName: string,
    settingValue: string,
    sensitive: boolean,
  ): Promise<UpdateSettingResponse>

  getSetting(userUuid: UuidString, settingName: string): Promise<GetSettingResponse>

  deleteSetting(userUuid: UuidString, settingName: string): Promise<DeleteSettingResponse>
}