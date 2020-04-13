import { PureService } from './pure_service';
import { DeviceInterface } from '../device_interface';
/**
 * Can be subclassed to provide custom alert/confirm implementation.
 * Defaults to using browser alert() and confirm().
 */
export declare class SNAlertService extends PureService {
    constructor(deviceInterface: DeviceInterface);
    deinit(): void;
    alert(title: string, text?: string, closeButtonText?: string, onClose?: () => void): Promise<unknown>;
    confirm(title: string, text?: string, confirmButtonText?: string, cancelButtonText?: string, onConfirm?: () => void, onCancel?: () => void, destructive?: boolean): Promise<unknown>;
}
