import { PureService } from './pure_service';
import { ApplicationEvent } from '../events';
import { SNApplication } from '../application';
export declare class ApplicationService extends PureService {
    protected application: SNApplication;
    private unsubApp;
    constructor(application: SNApplication);
    deinit(): void;
    addAppEventObserver(): void;
    onAppEvent(_event: ApplicationEvent): void;
    onAppStart(): Promise<void>;
    onAppLaunch(): Promise<void>;
    onAppKeyChange(): Promise<void>;
    onAppIncrementalSync(): void;
    onAppFullSync(): void;
}
