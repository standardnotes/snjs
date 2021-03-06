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

  describe('signOut()', () => {
    let testNote1;
    let confirmAlert;
    let deinit;

    const signOutConfirmMessage = (numberOfItems) => {
      const singular = numberOfItems === 1;
      return (
        `There ${singular ? 'is' : 'are'} ${numberOfItems} ${
          singular ? 'item' : 'items'
        } with unsynced changes. ` +
        'If you sign out, these changes will be lost forever. Are you sure you want to sign out?'
      );
    };

    beforeEach(async () => {
      testNote1 = await createNoteItem(testSNApp, {
        title: 'Note 1',
        text: 'This is a test note!'
      });
      confirmAlert = jest.spyOn(
        testSNApp.alertService,
        'confirm'
      );
      deinit = jest.spyOn(
        testSNApp,
        'deinit'
      );
    });

    it('shows confirmation dialog when there are unsaved changes', async () => {
      await testSNApp.itemManager.setItemDirty(testNote1.uuid);
      await testSNApp.signOut();

      const expectedConfirmMessage = signOutConfirmMessage(1);

      expect(confirmAlert).toBeCalledTimes(1);
      expect(confirmAlert).toBeCalledWith(expectedConfirmMessage);
      expect(deinit).toBeCalledTimes(1);
      expect(deinit).toBeCalledWith(DeinitSource.SignOut);
    });

    it('does not show confirmation dialog when there are no unsaved changes', async () => {
      await testSNApp.signOut();

      expect(confirmAlert).toBeCalledTimes(0);
      expect(deinit).toBeCalledTimes(1);
      expect(deinit).toBeCalledWith(DeinitSource.SignOut);
    });

    it('does not show confirmation dialog when there are unsaved changes and the "force" option is set to true', async () => {
      await testSNApp.itemManager.setItemDirty(testNote1.uuid);
      await testSNApp.signOut(true);

      expect(confirmAlert).toBeCalledTimes(0);
      expect(deinit).toBeCalledTimes(1);
      expect(deinit).toBeCalledWith(DeinitSource.SignOut);
    });

    it('cancels sign out if confirmation dialog is rejected', async () => {
      confirmAlert.mockImplementation((message) => false);

      await testSNApp.itemManager.setItemDirty(testNote1.uuid);
      await testSNApp.signOut();

      const expectedConfirmMessage = signOutConfirmMessage(1);

      expect(confirmAlert).toBeCalledTimes(1);
      expect(confirmAlert).toBeCalledWith(expectedConfirmMessage);
      expect(deinit).toBeCalledTimes(0);
    });
  });
});
