import { ApplicationStage } from '../../../stages';
import { DeviceInterface } from '../device_interface';
declare type EventObserver<E, D> = (eventName: E, data?: D) => Promise<void> | void;
export declare abstract class PureService<EventName = string, EventData = undefined> {
    private eventObservers;
    loggingEnabled: boolean;
    deviceInterface?: DeviceInterface;
    private criticalPromises;
    addEventObserver(observer: EventObserver<EventName, EventData>): () => void;
    protected notifyEvent(eventName: EventName, data?: EventData): Promise<void>;
    /**
     * Called by application to allow services to momentarily block deinit until
     * sensitive operations complete.
     */
    blockDeinit(): Promise<void>;
    /**
     * Called by application before restart.
     * Subclasses should deregister any observers/timers
     */
    deinit(): void;
    /**
     * A critical function is one that should block signing out or destroying application
     * session until the crticial function has completed. For example, persisting keys to
     * disk is a critical operation, and should be wrapped in this function call. The
     * parent application instance will await all criticial functions via the `blockDeinit`
     * function before signing out and deiniting.
     */
    protected executeCriticalFunction<T = void>(func: () => Promise<T>): Promise<T>;
    /**
     * Application instances will call this function directly when they arrive
     * at a certain migratory state.
     */
    handleApplicationStage(_stage: ApplicationStage): Promise<void>;
    log(message: string, ...args: unknown[]): void;
}
export {};
