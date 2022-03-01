import { SettingName } from '@standardnotes/settings'

import { SNSettingsService } from './Settings'
import * as messages from './Api/Messages'
import { SNPureCrypto } from '@standardnotes/sncrypto-common'
import { SNFeaturesService } from './FeaturesService'
import { FeatureIdentifier } from '@standardnotes/features'
import { AbstractService } from '@standardnotes/services'

export class SNMfaService extends AbstractService {
  constructor(
    private settingsService: SNSettingsService,
    private crypto: SNPureCrypto,
    private featuresService: SNFeaturesService,
  ) {
    super()
  }

  private async saveMfaSetting(secret: string): Promise<void> {
    return await this.settingsService.updateSetting(SettingName.MfaSecret, secret, true)
  }

  async isMfaActivated(): Promise<boolean> {
    const mfaSetting = await this.settingsService.getSensitiveSetting(SettingName.MfaSecret)
    return mfaSetting != null && mfaSetting != false
  }

  async generateMfaSecret(): Promise<string> {
    return this.crypto.generateOtpSecret()
  }

  async getOtpToken(secret: string): Promise<string> {
    return this.crypto.totpToken(secret, Date.now(), 6, 30)
  }

  async enableMfa(secret: string, otpToken: string): Promise<void> {
    const otpTokenValid = otpToken != null && otpToken === (await this.getOtpToken(secret))

    if (!otpTokenValid) {
      throw new Error(messages.SignInStrings.IncorrectMfa)
    }

    return this.saveMfaSetting(secret)
  }

  async disableMfa(): Promise<void> {
    return await this.settingsService.deleteSetting(SettingName.MfaSecret)
  }

  isMfaFeatureAvailable(): boolean {
    const feature = this.featuresService.getFeature(FeatureIdentifier.TwoFactorAuth)

    // If the feature is not present in the collection, we don't want to block it
    if (feature == undefined) {
      return false
    }

    return feature.no_expire === true || (feature.expires_at ?? 0) > Date.now()
  }

  deinit(): void {
    ;(this.settingsService as unknown) = undefined
    ;(this.crypto as unknown) = undefined
    ;(this.featuresService as unknown) = undefined
    super.deinit()
  }
}
