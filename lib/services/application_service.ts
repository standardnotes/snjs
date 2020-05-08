import { PureService } from '@Services/pure_service';
import { ApplicationEvent } from '@Lib/events';
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
    this.unsubApp = this.application!.addEventObserver(async (event: ApplicationEvent) => {
      this.onAppEvent(event);
      if (event === ApplicationEvent.Started) {
        await this.onAppStart();
      } else if (event === ApplicationEvent.Launched) {
        await this.onAppLaunch();
      } else if (event === ApplicationEvent.CompletedFullSync) {
        this.onAppFullSync();
      } else if (event === ApplicationEvent.CompletedIncrementalSync) {
        this.onAppIncrementalSync();
      } else if (event === ApplicationEvent.KeyStatusChanged) {
        this.onAppKeyChange();
      }
    });
  }

  onAppEvent(event: ApplicationEvent) {
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

  onAppIncrementalSync() {
    /** Optional override */
  }

  onAppFullSync() {
    /** Optional override */
  }

}
