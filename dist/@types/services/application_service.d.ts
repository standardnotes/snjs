import { PureService } from './pure_service';
import { ApplicationEvents } from '../events';
import { SNApplication } from '../application';
export declare class ApplicationService extends PureService {
    protected application?: SNApplication;
    private unsubApp;
    constructor(application: SNApplication);
    deinit(): void;
    addAppEventObserver(): void;
    onAppEvent(event: ApplicationEvents): void;
    onAppStart(): Promise<void>;
    onAppLaunch(): Promise<void>;
    onAppKeyChange(): Promise<void>;
    onAppSync(): void;
}
