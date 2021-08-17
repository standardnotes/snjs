import { PureService } from '../pure_service';

import { SNApiService } from '../api/api_service';
import { SettingsProvider } from './SettingsProvider';
import { SettingsGateway } from './SettingsGateway';
import { SNSessionManager } from '../api/session_manager';

export class SNSettingsService extends PureService {
  private _provider!: SettingsProvider;

  constructor(
    private readonly sessionManager: SNSessionManager,
    private readonly apiService: SNApiService
  ) {
    super();
  }

  initializeFromDisk() {
    this._provider = new SettingsGateway(this.apiService, this.sessionManager);
  }

  settings(): SettingsProvider {
    return this._provider;
  }

  deinit(): void {
    (this._provider as unknown) = undefined;
    (this.sessionManager as unknown) = undefined;
    (this.apiService as unknown) = undefined;
  }
}
