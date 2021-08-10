import { SettingPayload } from '@standardnotes/settings';
import { SettingsProvider } from './SettingsProvider';

interface SettingsPersist {
  saveSettings(payload: Partial<SettingPayload>): Promise<void>;
  loadSettings(): Promise<Partial<SettingPayload>>;
}

export class SettingsCache implements SettingsProvider {
  private lastUpdate = 0;
  private lastUpdateMap: Map<keyof SettingPayload, number> = new Map();

  constructor(
    private readonly provider: SettingsProvider,
    private readonly storage: SettingsPersist,
    private readonly cacheFreshnessMS: number,
    private readonly currentTime: () => number
  ) {}

  private async saveSingle<Key extends keyof SettingPayload>(
    name: Key,
    payload: SettingPayload[Key] | null
  ) {
    const settings = await this.storage.loadSettings();
    settings[name] = payload ?? undefined;
    await this.storage.saveSettings(settings);
    this.lastUpdateMap.set(name, this.currentTime());
  }

  private async saveAll(payload: Partial<SettingPayload>) {
    this.storage.saveSettings(payload);
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
    if (!this.shouldRebuildAll()) return this.storage.loadSettings();

    try {
      const payload = await this.provider.listSettings();
      await this.saveAll(payload);
      return payload;
    } catch (_) {
      return this.storage.loadSettings();
    }
  }

  async getSetting<Key extends keyof SettingPayload>(
    name: Key
  ): Promise<SettingPayload[Key] | null> {
    if (!this.shouldRebuildSingle(name)) {
      const settings = await this.storage.loadSettings();
      return settings[name] ?? null;
    }

    const payload = await this.provider.getSetting(name);
    await this.saveSingle(name, payload);
    return payload;
  }

  async updateSetting<Key extends keyof SettingPayload>(
    name: Key,
    payload: SettingPayload[Key]
  ): Promise<SettingPayload[Key] | null> {
    const updated = await this.provider.updateSetting(name, payload);
    this.saveSingle(name, updated);
    return updated;
  }

  async deleteSetting<Key extends keyof SettingPayload>(
    name: Key
  ): Promise<void> {
    await this.provider.deleteSetting(name);
    this.saveSingle(name, null);
  }
}
