export class SNLog {
  static log(...message: any) {
    this.onLog(...message);
  }
  static error(error: Error) {
    this.onError(error);
    return error;
  }
  static onLog: (...message: any) => void;
  static onError: (error: Error) => void;
}
