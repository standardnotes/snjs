import { SettingName } from '@standardnotes/settings'
import * as messages from '../api/messages'
import {
  DeleteSettingResponse,
  GetSettingResponse,
  ListSettingsResponse,
  StatusCode,
  UpdateSettingResponse,
  User,
} from '@standardnotes/responses'
import { UuidString } from '@Lib/types'
import { SensitiveSettingName } from './SensitiveSettingName'
import { Settings } from './Settings'

interface SettingsAPI {
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

/**
 * SettingsGateway coordinates communication with the API service
 * wrapping the userUuid provision for simpler consumption
 */
export class SettingsGateway {
  constructor(
    private readonly settingsApi: SettingsAPI,
    private readonly userProvider: { getUser: () => User | undefined },
  ) {}

  isReadyForModification(): boolean {
    return this.getUser() != null
  }

  private getUser() {
    return this.userProvider.getUser()
  }

  private get userUuid() {
    const user = this.getUser()
    if (user == null || user.uuid == null) {
      throw new Error(messages.API_MESSAGE_INVALID_SESSION)
    }
    return user.uuid
  }

  async listSettings() {
    const { error, data } = await this.settingsApi.listSettings(this.userUuid)
    if (error != null) {
      throw new Error(error.message)
    }
    if (data == null || data.settings == null) {
      return {}
    }

    const settings: Partial<Settings> = {}
    for (const setting of data.settings) {
      settings[setting.name as SettingName] = setting.value
    }
    return settings
  }

  async getSetting(name: SettingName): Promise<string | null> {
    const response = await this.settingsApi.getSetting(this.userUuid, name)

    // Backend responds with 400 when setting doesn't exist
    if (response.status === StatusCode.HttpBadRequest) {
      return null
    }

    if (response.error != null) {
      throw new Error(response.error.message)
    }

    return response?.data?.setting?.value ?? null
  }

  async getSensitiveSetting(name: SensitiveSettingName): Promise<boolean> {
    const response = await this.settingsApi.getSetting(this.userUuid, name)

    // Backend responds with 400 when setting doesn't exist
    if (response.status === StatusCode.HttpBadRequest) {
      return false
    }

    if (response.error != null) {
      throw new Error(response.error.message)
    }

    return response.data?.success ?? false
  }

  async updateSetting(name: SettingName, payload: string, sensitive: boolean): Promise<void> {
    const { error } = await this.settingsApi.updateSetting(this.userUuid, name, payload, sensitive)
    if (error != null) {
      throw new Error(error.message)
    }
  }

  async deleteSetting(name: SettingName): Promise<void> {
    const { error } = await this.settingsApi.deleteSetting(this.userUuid, name)
    if (error != null) {
      throw new Error(error.message)
    }
  }

  deinit() {
    ;(this.settingsApi as unknown) = undefined
    ;(this.userProvider as unknown) = undefined
  }
}
