import { PureService } from './pure_service';
import { DeviceInterface } from '../device_interface';
/**
 * Can be subclassed to provide custom alert/confirm implementation.
 * Defaults to using browser alert() and confirm().
 */
export declare class SNAlertService extends PureService {
    constructor(deviceInterface: DeviceInterface);
    deinit(): void;
    alert(text?: string, title?: string, closeButtonText?: string, onClose?: () => void): Promise<unknown>;
    confirm(text?: string, title?: string, confirmButtonText?: string, cancelButtonText?: string, onConfirm?: () => void, onCancel?: () => void, destructive?: boolean): Promise<unknown>;
}
