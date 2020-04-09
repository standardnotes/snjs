import { ApplicationStage } from '../stages';
import { DeviceInterface } from '../device_interface';
declare type EventObserver = (eventName: string, data: any) => Promise<void>;
export declare abstract class PureService {
    private eventObservers;
    loggingEnabled: boolean;
    deviceInterface?: DeviceInterface;
    addEventObserver(observer: EventObserver): () => void;
    protected notifyEvent(eventName: string, data?: any): Promise<void>;
    /**
     * Called by application before restart.
     * Subclasses should deregister any observers/timers
     */
    deinit(): void;
    /**
    * Application instances will call this function directly when they arrive
    * at a certain migratory state.
    */
    handleApplicationStage(stage: ApplicationStage): Promise<void>;
    log(message: string, ...args: any[]): void;
}
export {};
