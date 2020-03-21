import { PureService } from '@Services/pure_service';
import { ApplicationEvents } from '@Lib/events';

export class ApplicationService extends PureService {

  constructor(application) {
    super();
    this.application = application;
    
    /* Allow caller constructor to finish setting instance variables before triggering callbacks */
    setImmediate(() => {
      this.addAppEventObserver();
    });
  }

  async deinit() {
    await super.deinit();
    this.unsubApp();
  }

  addAppEventObserver() {
    if (this.application.isStarted()) {
      this.onAppStart();
    }
    if (this.application.isLaunched()) {
      this.onAppLaunch();
    }
    this.unsubApp = this.application.addEventObserver(async (eventName) => {
      this.onAppEvent(eventName);
      if (eventName === ApplicationEvents.Started) {
        await this.onAppStart();
      } else if (eventName === ApplicationEvents.Launched) {
        await this.onAppLaunch();
      } else if (eventName === ApplicationEvents.CompletedSync) {
        this.onAppSync();
      } else if (eventName === ApplicationEvents.KeyStatusChanged) {
        this.onAppKeyChange();
      }
    });
  }

  onAppEvent(eventName) {
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
