export enum PayloadSource {
  /**
   * Payloads with a source of Constructor means that the payload was created
   * in isolated space by the caller, and does not yet have any app-related affiliation.
   */
  Constructor = 1,

  RemoteRetrieved,

  RemoteSaved,

  /** When a component is installed by the desktop and some of its values change */
  DesktopInstalled,

  FileImport,
}
