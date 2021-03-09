export enum ButtonType {
  Info = 0,
  Danger = 1,
}

export type DismissBlockingDialog = () => void;

export type SNAlertService = {
  confirm(
    text: string,
    title?: string,
    confirmButtonText?: string,
    confirmButtonType?: ButtonType,
    cancelButtonText?: string
  ): Promise<boolean>;
  alert(text: string, title?: string, closeButtonText?: string): Promise<void>;
  blockingDialog(
    text: string,
    title?: string
  ): DismissBlockingDialog | Promise<DismissBlockingDialog>;
};
