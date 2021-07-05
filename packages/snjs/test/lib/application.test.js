import {
  Platform,
  Environment,
  DeinitSource,
} from '@Lib/index';
import { createApplication } from '../setup/snjs/appFactory';
import {
  createNoteItem,
} from '../helpers';

describe('Application', () => {
  /** The global Standard Notes application. */
  let testSNApp;

  beforeEach(async () => {
    testSNApp = await createApplication('test-application', Environment.Web, Platform.LinuxWeb);
  });

  afterEach(() => {
    testSNApp.deinit(DeinitSource.SignOut);
  });

  describe('signOut()', () => {
    let confirmAlert;

    beforeEach(async () => {
      confirmAlert = jest.spyOn(
        testSNApp.alertService,
        'confirm'
      );
    });

    it('shows confirmation dialog when there are unsaved changes', async () => {
      const testNote1 = await createNoteItem(testSNApp, {
        title: 'Note 1',
        text: 'This is a test note!'
      });

      await testSNApp.itemManager.setItemDirty(testNote1.uuid);

      await testSNApp.signOut();

      expect(confirmAlert).toBeCalledTimes(1);
      expect(confirmAlert).toBeCalledWith(
        `There are 1 items with unsynced changes. If you sign out, these changes will be forever lost. Are you sure you want to sign out?`
      );
    });

    it('does not show confirmation dialog when there are no unsaved changes', async () => {
      await createNoteItem(testSNApp, {
        title: 'Note 1',
        text: 'This is a test note :D'
      });

      await testSNApp.signOut();

      expect(confirmAlert).toBeCalledTimes(0);
    });
  });
});
