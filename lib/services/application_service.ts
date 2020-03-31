import { PureService } from '@Services/pure_service';
import { ApplicationEvents } from '@Lib/events';
import { SNApplication } from '../application';

export class ApplicationService extends PureService {

  protected application?: SNApplication
  private unsubApp: any

  constructor(application: SNApplication) {
    super();
    this.application = application;
    
    /* Allow caller constructor to finish setting instance variables before triggering callbacks */
    setImmediate(() => {
      this.addAppEventObserver();
    });
  }

  deinit() {
    this.application = undefined;
    this.unsubApp();
    this.unsubApp = undefined;
    super.deinit();
  }

  addAppEventObserver() {
    if (this.application!.isStarted()) {
      this.onAppStart();
    }
    if (this.application!.isLaunched()) {
      this.onAppLaunch();
    }
    this.unsubApp = this.application!.addEventObserver(async (event: ApplicationEvents) => {
      this.onAppEvent(event);
      if (event === ApplicationEvents.Started) {
        await this.onAppStart();
      } else if (event === ApplicationEvents.Launched) {
        await this.onAppLaunch();
      } else if (event === ApplicationEvents.CompletedSync) {
        this.onAppSync();
      } else if (event === ApplicationEvents.KeyStatusChanged) {
        this.onAppKeyChange();
      }
    });
  }

  onAppEvent(event: ApplicationEvents) {
    /** Optional override */
  }

  async onAppStart() {
    /** Optional override */
  }

  async onAppLaunch() {
    /** Optional override */
  }

  async onAppKeyChange() {
    /** Optional override */
  }

  onAppSync() {
    /** Optional override */
  }

}
