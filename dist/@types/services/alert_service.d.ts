export declare enum ButtonType {
    Info = 0,
    Danger = 1
}
export declare type DismissBlockingDialog = () => void;
export declare type SNAlertService = {
    confirm(text: string, title?: string, confirmButtonText?: string, confirmButtonType?: ButtonType, cancelButtonText?: string): Promise<boolean>;
    alert(text: string, title?: string, closeButtonText?: string): Promise<void>;
    blockingDialog(text: string): DismissBlockingDialog;
};
