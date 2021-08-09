import { SettingPayload } from '@standardnotes/settings';
import { SettingsProvider } from './SettingsProvider';

export class SettingsCache implements SettingsProvider {
  private lastUpdate = 0;
  private lastUpdateMap: Map<keyof SettingPayload, number> = new Map();
  private cache: Partial<SettingPayload> = {};

  constructor(
    private readonly provider: SettingsProvider,
    private readonly cacheFreshnessMS: number,
    private readonly currentTime: () => number
  ) {}

  private setSingle<Key extends keyof SettingPayload>(
    name: Key,
    payload: SettingPayload[Key] | null
  ) {
    this.cache[name] = payload ?? undefined;
    this.lastUpdateMap.set(name, this.currentTime());
  }

  private async setAll(payload: Partial<SettingPayload>) {
    this.cache = payload;
    this.cache = await this.provider.listSettings();

    const now = this.currentTime();
    this.lastUpdate = now;
    for (const key of this.lastUpdateMap.keys()) {
      this.lastUpdateMap.set(key, now);
    }
  }

  private shouldRebuildAll(): boolean {
    return this.currentTime() - this.lastUpdate > this.cacheFreshnessMS;
  }

  private shouldRebuildSingle(name: keyof SettingPayload): boolean {
    return (
      this.currentTime() - (this.lastUpdateMap.get(name) ?? 0) >
      this.cacheFreshnessMS
    );
  }

  async listSettings(): Promise<Partial<SettingPayload>> {
    if (this.shouldRebuildAll()) {
      const payload = await this.provider.listSettings();
      this.setAll(payload);
    }
    return this.cache;
  }

  async getSetting<Key extends keyof SettingPayload>(
    name: Key
  ): Promise<SettingPayload[Key] | null> {
    if (this.shouldRebuildSingle(name)) {
      const payload = await this.provider.getSetting(name);
      this.setSingle(name, payload);
    }
    return this.cache[name] ?? null;
  }

  async updateSetting<Key extends keyof SettingPayload>(
    name: Key,
    payload: SettingPayload[Key]
  ): Promise<SettingPayload[Key] | null> {
    const updated = await this.provider.updateSetting(name, payload);
    this.setSingle(name, updated);
    return updated;
  }

  async deleteSetting<Key extends keyof SettingPayload>(
    name: Key
  ): Promise<void> {
    await this.provider.deleteSetting(name);
    this.setSingle(name, null);
  }
}
