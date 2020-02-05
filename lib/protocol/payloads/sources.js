export const PAYLOAD_SOURCE_REMOTE_RETRIEVED = 1;

export const PAYLOAD_SOURCE_REMOTE_SAVED = 2;

export const PAYLOAD_SOURCE_LOCAL_SAVED = 3;

export const PAYLOAD_SOURCE_LOCAL_RETRIEVED = 4;

export const PAYLOAD_SOURCE_LOCAL_DIRTIED = 5;

/** Payloads retrieved from an external
 extension/component */
export const PAYLOAD_SOURCE_COMPONENT_RETRIEVED = 6;

/** When a component is installed by the desktop
and some of its values change */
export const PAYLOAD_SOURCE_DESKTOP_INSTALLED = 7;

/** aciton-based Extensions like note history */
export const PAYLOAD_SOURCE_REMOTE_ACTION_RETRIEVED = 8;

export const PAYLOAD_SOURCE_FILE_IMPORT = 9;

export const PAYLOAD_SOURCE_REMOTE_CONFLICT = 10;

export const PAYLOAD_SOURCE_IMPORT_CONFLICT = 11;

/** Payloads that are saved or saving in the
current sync request */
export const PAYLOAD_SOURCE_SAVED_OR_SAVING = 12;

/** Payloads that have been decrypted for the convenience
of consumers who can only work with decrypted formats. The
decrypted payloads exist in transient, ephemeral space, and
are not used in anyway. */
export const PAYLOAD_SOURCE_DECRYPTED_TRANSIENT = 13;

export const PAYLOAD_SOURCE_CONFLICT_UUID = 14;

export const PAYLOAD_SOURCE_CONFLICT_DATA = 15;

export function isPayloadSourceRetrieved(source) {
  return [
    PAYLOAD_SOURCE_REMOTE_RETRIEVED,
    PAYLOAD_SOURCE_COMPONENT_RETRIEVED,
    PAYLOAD_SOURCE_REMOTE_ACTION_RETRIEVED
  ].includes(source);
}