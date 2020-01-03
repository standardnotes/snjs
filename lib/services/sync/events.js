/** A full sync can consist of many round-trips to the server */
export const SYNC_EVENT_FULL_SYNC_COMPLETED                = 'sync:full-completed';
/** A single sync is just one round-trip to the server completion */
export const SYNC_EVENT_SINGLE_SYNC_COMPLETED              = 'sync:single-completed';
export const SYNC_EVENT_SYNC_TAKING_TOO_LONG          = 'sync:taking-too-long';
export const SYNC_EVENT_SYNC_ERROR                    = 'sync:error';
export const SYNC_EVENT_SYNC_EXCEPTION                = 'sync:sync-exception';
export const SYNC_EVENT_INVALID_SESSION               = 'sync:invalid-session';
export const SYNC_EVENT_MAJOR_DATA_CHANGE             = 'major-data-change';
export const SYNC_EVENT_LOCAL_DATA_LOADED             = 'local-data-loaded';
export const SYNC_EVENT_LOCAL_DATA_INCREMENTAL_LOAD   = 'local-data-incremental-load';
export const SYNC_EVENT_SYNC_DISCORDANCE_CHANGE       = 'sync:discordance-change';
export const SYNC_EVENT_ENTER_OUT_OF_SYNC             = 'enter-out-of-sync';
export const SYNC_EVENT_EXIT_OUT_OF_SYNC              = 'exit-out-of-sync';
