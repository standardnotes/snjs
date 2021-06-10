import {
  SNApplication,
  SNComponent,
  Platform,
  Environment,
  DeinitSource
} from '../lib';
import { createApplication } from './lib/appFactory';
import { createComponentItem, testExtensionEditorPackage } from './helpers';

describe('Component Manager', () => {
  /** The Standard Notes application. */
  let testSNApp: SNApplication;
  /** The test component. */
  let testComponent: SNComponent;

  beforeEach(async () => {
    testSNApp = await createApplication('test-application', Environment.Web, Platform.LinuxWeb);
    testComponent = await createComponentItem(testSNApp, testExtensionEditorPackage);
  });

  afterEach(() => {
    testComponent = undefined;

    testSNApp.deinit(DeinitSource.SignOut);
    testSNApp = undefined;
  });

  test('isDesktop()', () => {
    const { isDesktop } = testSNApp.componentManager;
    expect(isDesktop).toBe(false);
  });

  test('isMobile()', () => {
    const { isMobile } = testSNApp.componentManager;
    expect(isMobile).toBe(false);
  });
});
