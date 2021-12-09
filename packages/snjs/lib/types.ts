export type AnyRecord = Partial<Record<string, any>>;
export type UuidString = string;
export type ApplicationIdentifier = string;

export enum DeinitSource {
  SignOut = 1,
  Lock = 2,
  AppGroupUnload = 3,
}

export type ErrorObject = {
  error: string;
}

export type ApplicationEventPayload = Partial<{
  protectionDuration: number;
}>