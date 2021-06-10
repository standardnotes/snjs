import {
  SNApplication,
  SNComponent,
  Platform,
  Environment,
  DeinitSource,
  SNTheme,
  ContentType,
  ComponentArea
} from '../lib';
import {
  createComponentItem,
  testExtensionEditorPackage,
  testThemeDefaultPackage,
  testThemeDarkPackage,
  testExtensionForTagsPackage
} from './helpers';
import { createApplication } from './lib/appFactory';

describe('Component Manager', () => {
  /** The global Standard Notes application. */
  let testSNApp: SNApplication;
  /** The global test component. */
  let testComponent: SNComponent;
  /** The global test theme. */
  let testTheme: SNTheme;

  beforeEach(async () => {
    testSNApp = await createApplication('test-application', Environment.Web, Platform.LinuxWeb);
    testComponent = await createComponentItem(testSNApp, testExtensionEditorPackage);
    testTheme = await createComponentItem(testSNApp, testThemeDefaultPackage);
  });

  afterEach(() => {
    testComponent = undefined;

    testSNApp.deinit(DeinitSource.SignOut);
    testSNApp = undefined;
  });

  describe('isDesktop', () => {
    it('should return false if in a Web app', async () => {
      testSNApp = await createApplication('test-application', Environment.Web, Platform.LinuxWeb);
      const { isDesktop } = testSNApp.componentManager;
      expect(isDesktop).toBe(false);
    });

    it('should return false if in a Mobile app', async () => {
      testSNApp = await createApplication('test-application', Environment.Mobile, Platform.Android);
      const { isDesktop } = testSNApp.componentManager;
      expect(isDesktop).toBe(false);
    });

    it('should return true if in a Desktop app', async () => {
      testSNApp = await createApplication('test-application', Environment.Desktop, Platform.LinuxDesktop);
      const { isDesktop } = testSNApp.componentManager;
      expect(isDesktop).toBe(true);
    });
  });

  describe('isMobile', () => {
    it('should return false if in a Web app', async () => {
      testSNApp = await createApplication('test-application', Environment.Web, Platform.LinuxWeb);
      const { isMobile } = testSNApp.componentManager;
      expect(isMobile).toBe(false);
    });

    it('should return false if in a Desktop app', async () => {
      testSNApp = await createApplication('test-application', Environment.Desktop, Platform.LinuxDesktop);
      const { isMobile } = testSNApp.componentManager;
      expect(isMobile).toBe(false);
    });

    it('should return true if in a Mobile app', async () => {
      testSNApp = await createApplication('test-application', Environment.Mobile, Platform.Android);
      const { isMobile } = testSNApp.componentManager;
      expect(isMobile).toBe(true);
    });
  });

  describe('components', () => {
    it('should return an empty array if no items of type Component or Theme exist', async () => {
      const testApp = await createApplication('test-application', Environment.Web, Platform.LinuxWeb);
      expect(testApp.componentManager.components).toHaveLength(0);
    });

    it('should return an array of items of type Component and Theme', async () => {
      const testApp = await createApplication('test-application', Environment.Web, Platform.LinuxWeb);

      await createComponentItem(testApp, testExtensionEditorPackage);
      await createComponentItem(testApp, testThemeDefaultPackage);

      const { components } = testApp.componentManager;
      expect(components).toHaveLength(2);

      expect(components[0].content_type).toBe(ContentType.Component);
      expect(components[1].content_type).toBe(ContentType.Theme);
    });
  });

  describe('componentsForArea()', () => {
    it('should return an array of Component items', async () => {
      const testApp = await createApplication('test-application', Environment.Web, Platform.LinuxWeb);

      await createComponentItem(testApp, testExtensionEditorPackage);
      await createComponentItem(testApp, testThemeDefaultPackage);
      await createComponentItem(testApp, testThemeDarkPackage);
      await createComponentItem(testApp, testExtensionForTagsPackage);

      const componentsInThemeArea = testApp.componentManager.componentsForArea(ComponentArea.Themes);
      expect(componentsInThemeArea).toHaveLength(2);

      const componentsInEditorArea = testApp.componentManager.componentsForArea(ComponentArea.Editor);
      expect(componentsInEditorArea).toHaveLength(1);

      const componentsInNoteTagsArea = testApp.componentManager.componentsForArea(ComponentArea.NoteTags);
      expect(componentsInNoteTagsArea).toHaveLength(1);
    });
  });

  describe('isNativeExtension()', () => {
    it('should return false if hosted_url or local_url do not match any of the native extensions location', async () => {
      let isNativeExtension = testSNApp.componentManager.isNativeExtension(testComponent);
      expect(isNativeExtension).toBe(false);

      isNativeExtension = testSNApp.componentManager.isNativeExtension(testTheme);
      expect(isNativeExtension).toBe(false);
    });

    it('should return true if location matches the Extensions manager location', async () => {
      const extensionsManagerPackage = {
        identifier: "test.standardnotes.extensions-manager-extension",
        name: "Extensions manager",
        content_type: "SN|Component",
        area: "modal",
        version: "1.0.0",
        url: "http://localhost/extensions/extension_manager"
      };

      const extensionManagerComponent = await createComponentItem(testSNApp, extensionsManagerPackage);
      const isNativeExtension = testSNApp.componentManager.isNativeExtension(extensionManagerComponent);
      expect(isNativeExtension).toBe(true);
    });

    // Will be removed soon.
    it('should return true if location matches the Batch manager location', async () => {
      const batchManagerPackage = {
        identifier: "test.standardnotes.batch-manager-extension",
        name: "Batch manager",
        content_type: "SN|Component",
        area: "modal",
        version: "1.0.0",
        url: "http://localhost/extensions/batch_manager"
      };

      const batchManagerComponent = await createComponentItem(testSNApp, batchManagerPackage);
      const isNativeExtension = testSNApp.componentManager.isNativeExtension(batchManagerComponent);
      expect(isNativeExtension).toBe(true);
    });
  });

  describe('getActiveThemes()', () => {
    describe('Web/Desktop', () => {
      it('should return all active themes', async () => {
        await createComponentItem(testSNApp, testThemeDefaultPackage);

        let activeThemes = testSNApp.componentManager.getActiveThemes();
        expect(activeThemes).toHaveLength(0);

        const defaultTheme = await createComponentItem(testSNApp, testThemeDefaultPackage, {
          active: true
        });
        const darkTheme = await createComponentItem(testSNApp, testThemeDarkPackage, {
          active: true
        });

        activeThemes = testSNApp.componentManager.getActiveThemes();
        expect(activeThemes).toHaveLength(2);
        expect(activeThemes[0]).toBe(defaultTheme);
        expect(activeThemes[1]).toBe(darkTheme);
      })
    });

    describe('Mobile', () => {
      it('should return just one theme', async () => {
        testSNApp = await createApplication('test-application', Environment.Mobile, Platform.Android);
        await createComponentItem(testSNApp, testThemeDefaultPackage, {
          active: true
        });

        let activeThemes = testSNApp.componentManager.getActiveThemes();
        expect(activeThemes).toHaveLength(0);

        const darkTheme = await createComponentItem(testSNApp, testThemeDarkPackage);
        testSNApp.componentManager.setMobileActiveTheme(darkTheme);

        activeThemes = testSNApp.componentManager.getActiveThemes();
        expect(activeThemes).toHaveLength(1);
        expect(activeThemes[0]).toBe(darkTheme);
      });
    });
  });
});
