import { ApplicationEvent } from '@Lib/events'
import { AbstractService, InternalEventBusInterface } from '@standardnotes/services'
import { SNApplication } from '../application'

export class ApplicationService extends AbstractService {
  private unsubApp: any

  constructor(
    protected application: SNApplication,
    protected internalEventBus: InternalEventBusInterface,
  ) {
    super(internalEventBus)
    /* Allow caller constructor to finish setting instance variables before triggering callbacks */
    setTimeout(() => {
      this.addAppEventObserver()
    }, 0)
  }

  deinit() {
    ;(this.application as any) = undefined
    this.unsubApp()
    this.unsubApp = undefined
    super.deinit()
  }

  addAppEventObserver() {
    if (this.application.isStarted()) {
      this.onAppStart()
    }
    if (this.application.isLaunched()) {
      this.onAppLaunch()
    }
    this.unsubApp = this.application.addEventObserver(async (event: ApplicationEvent) => {
      await this.onAppEvent(event)
      if (event === ApplicationEvent.Started) {
        this.onAppStart()
      } else if (event === ApplicationEvent.Launched) {
        this.onAppLaunch()
      } else if (event === ApplicationEvent.CompletedFullSync) {
        this.onAppFullSync()
      } else if (event === ApplicationEvent.CompletedIncrementalSync) {
        this.onAppIncrementalSync()
      } else if (event === ApplicationEvent.KeyStatusChanged) {
        this.onAppKeyChange()
      }
    })
  }

  async onAppEvent(_event: ApplicationEvent) {
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
