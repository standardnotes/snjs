import { Migration } from './migration';
export declare class Migration2_0_1 extends Migration {
    static version(): string;
    protected registerStageHandlers(): void;
    private needSessionRepair;
    /**
     * For users who had an empty keychain on launch but otherwise had an account present
     * (due to iCloud restore), in 1.0.0 architecture, the JWT was also stored in the keychain,
     * so that's also gone now. In this case we need to ask the user to sign back into their account.
     *
     * However, this process is cancelable, because we want users to still be able to read
     * their existing data. We won't mark this migration as done until the sign in is successful.
     * This way, if the user cancels and relaunches the app later, this migration will run again.
     *
     * The reason we do this in a one-time migration, rather than always, is that the "jwt
     * inside the keychain" is legacy 1.0.0 behavior. Otherwise it's in storage. So we don't
     * expect to see this issue unless you're specifically coming from a legacy, non-migrated
     * version.
     */
    private repairMissingSession;
}
