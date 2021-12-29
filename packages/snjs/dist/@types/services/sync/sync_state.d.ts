import { SyncEventReceiver } from './events';
export declare class SyncState {
    lastPreSyncSave?: Date;
    lastSyncDate?: Date;
    private receiver;
    private discordance;
    private maxDiscordance;
    private outOfSync;
    private lastClientHash?;
    private lastServerHash?;
    constructor(receiver: SyncEventReceiver, maxDiscordance: number);
    isOutOfSync(): boolean;
    reset(): void;
    get needsSync(): boolean;
    getLastClientIntegrityHash(): string | undefined;
    clearIntegrityHashes(): void;
    setIntegrityHashes(clientHash: string, serverHash: string): Promise<void>;
}
