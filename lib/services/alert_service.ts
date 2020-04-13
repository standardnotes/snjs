import { PureService } from '@Lib/services/pure_service';
import { DeviceInterface } from '../device_interface';

/**
 * Can be subclassed to provide custom alert/confirm implementation.
 * Defaults to using browser alert() and confirm().
 */
export class SNAlertService extends PureService {

  constructor(deviceInterface: DeviceInterface) {
    super();
    this.deviceInterface = deviceInterface;
  }

  deinit() {
    this.deviceInterface = undefined;
    super.deinit();
  }

  async alert(
    title: string,
    text?: string,
    closeButtonText = 'OK',
    onClose?: () => void
  ) {
    return new Promise((resolve, reject) => {
      window.alert(text);
      resolve();
    });
  }

  async confirm(
    title: string,
    text?: string,
    confirmButtonText = 'Confirm',
    cancelButtonText = 'Cancel',
    onConfirm?: () => void,
    onCancel?: () => void,
    destructive = false
  ) {
    return new Promise((resolve, reject) => {
      if (window.confirm(text)) {
        resolve();
      } else {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject();
      }
    });
  }
}
