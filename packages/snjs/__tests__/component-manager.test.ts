import {
  SNApplication,
  SNComponent,
  Platform,
  Environment,
  DeinitSource,
  SNTheme,
  ContentType,
  ComponentArea,
  ComponentAction,
  PayloadSource,
  SNItem
} from '../lib';
import {
  createComponentItem,
  testExtensionEditorPackage,
  testThemeDefaultPackage,
  testThemeDarkPackage,
  testExtensionForTagsPackage,
  createNoteItem,
  createTagItem,
  registerComponent,
  registerComponentHandler,
  SHORT_DELAY_TIME,
  sleep
} from './helpers';
import { createApplication } from './lib/appFactory';

// To prevent conflicts with Mocha
import {
  describe,
  expect,
  test,
  it,
  beforeEach,
  afterEach
} from '@jest/globals';
import { environmentToString, platformToString } from '../lib/platforms';

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
    it('returns false if in a Web app', async () => {
      testSNApp = await createApplication('test-application', Environment.Web, Platform.LinuxWeb);
      const { isDesktop } = testSNApp.componentManager;
      expect(isDesktop).toBe(false);
    });

    it('returns false if in a Mobile app', async () => {
      testSNApp = await createApplication('test-application', Environment.Mobile, Platform.Android);
      const { isDesktop } = testSNApp.componentManager;
      expect(isDesktop).toBe(false);
    });

    it('returns true if in a Desktop app', async () => {
      testSNApp = await createApplication('test-application', Environment.Desktop, Platform.LinuxDesktop);
      const { isDesktop } = testSNApp.componentManager;
      expect(isDesktop).toBe(true);
    });
  });

  describe('isMobile', () => {
    it('returns false if in a Web app', async () => {
      testSNApp = await createApplication('test-application', Environment.Web, Platform.LinuxWeb);
      const { isMobile } = testSNApp.componentManager;
      expect(isMobile).toBe(false);
    });

    it('returns false if in a Desktop app', async () => {
      testSNApp = await createApplication('test-application', Environment.Desktop, Platform.LinuxDesktop);
      const { isMobile } = testSNApp.componentManager;
      expect(isMobile).toBe(false);
    });

    it('returns true if in a Mobile app', async () => {
      testSNApp = await createApplication('test-application', Environment.Mobile, Platform.Android);
      const { isMobile } = testSNApp.componentManager;
      expect(isMobile).toBe(true);
    });
  });

  describe('components', () => {
    it('returns an empty array if no items of type Component or Theme exist', async () => {
      const testApp = await createApplication('test-application', Environment.Web, Platform.LinuxWeb);
      expect(testApp.componentManager.components).toHaveLength(0);
    });

    it('returns an array of items of type Component and Theme', async () => {
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
    it('returns an array of Component items', async () => {
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
    it('returns false if hosted_url or local_url do not match any of the native extensions location', async () => {
      let isNativeExtension = testSNApp.componentManager.isNativeExtension(testComponent);
      expect(isNativeExtension).toBe(false);

      isNativeExtension = testSNApp.componentManager.isNativeExtension(testTheme);
      expect(isNativeExtension).toBe(false);
    });

    it('returns true if location matches the Extensions manager location', async () => {
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
    it('returns true if location matches the Batch manager location', async () => {
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
      it('returns all active themes', async () => {
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
      });
    });

    describe('Mobile', () => {
      it('returns just one theme', async () => {
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

  describe('urlsForActiveThemes()', () => {
    it('returns an empty array if there are no active themes', async () => {
      const testApp = await createApplication('test-application', Environment.Web, Platform.LinuxWeb);
      const urlsForActiveThemes = testApp.componentManager.urlsForActiveThemes();
      expect(urlsForActiveThemes).toHaveLength(0);
    });

    it('returns an array of URLs from the active themes', async () => {
      await createComponentItem(testSNApp, testThemeDefaultPackage);

      const defaultTheme = await createComponentItem(testSNApp, testThemeDefaultPackage, {
        active: true
      });
      const darkTheme = await createComponentItem(testSNApp, testThemeDarkPackage, {
        active: true
      });

      const urlsForActiveThemes = testSNApp.componentManager.urlsForActiveThemes();
      expect(urlsForActiveThemes).toHaveLength(2);
      expect(urlsForActiveThemes[0]).toBe(defaultTheme.hosted_url);
      expect(urlsForActiveThemes[1]).toBe(darkTheme.hosted_url);
    });
  });

  test('postActiveThemesToComponent()', async () => {
    const darkTheme = await createComponentItem(testSNApp, testThemeDarkPackage, {
      active: true
    });

    const sendMessageToComponent = jest.spyOn(
      testSNApp.componentManager,
      'sendMessageToComponent'
    );

    testSNApp.componentManager.postActiveThemesToComponent(testComponent);
    expect(sendMessageToComponent).toBeCalledTimes(1);
    expect(sendMessageToComponent).toBeCalledWith(testComponent, {
      action: ComponentAction.ActivateThemes,
      data: {
        themes: [darkTheme.hosted_url]
      }
    });
  });

  test('isComponentHidden()', async () => {
    let isComponentHidden = testSNApp.componentManager.isComponentHidden(testComponent);
    expect(isComponentHidden).toBe(false);

    testSNApp.componentManager.setComponentHidden(testComponent, true);

    isComponentHidden = testSNApp.componentManager.isComponentHidden(testComponent);
    expect(isComponentHidden).toBe(true);
  });

  describe('jsonForItem()', () => {
    /**
     * Checking that removes private properties is called.
     */
    let responseItemsByRemovingPrivateProperties
    
    beforeEach(() => {
      responseItemsByRemovingPrivateProperties = jest.spyOn(
        testSNApp.componentManager,
        'responseItemsByRemovingPrivateProperties'
      );
    });

    test('isMetadataUpdate property', async () => {
      const noteItem = await createNoteItem(testSNApp, {
        title: 'Note 1',
        text: 'This is a test note :B'
      });

      let jsonForItem = testSNApp.componentManager.jsonForItem(
        noteItem,
        testComponent
      );
      expect(jsonForItem.isMetadataUpdate).toBe(false);

      jsonForItem = testSNApp.componentManager.jsonForItem(
        noteItem,
        testComponent,
        PayloadSource.RemoteSaved
      );
      expect(jsonForItem.isMetadataUpdate).toBe(true);

      jsonForItem = testSNApp.componentManager.jsonForItem(
        noteItem,
        testComponent,
        PayloadSource.LocalSaved
      );
      expect(jsonForItem.isMetadataUpdate).toBe(true);

      jsonForItem = testSNApp.componentManager.jsonForItem(
        noteItem,
        testComponent,
        PayloadSource.PreSyncSave
      );
      expect(jsonForItem.isMetadataUpdate).toBe(true);

      jsonForItem = testSNApp.componentManager.jsonForItem(
        noteItem,
        testComponent,
        PayloadSource.FileImport
      );
      expect(jsonForItem.isMetadataUpdate).toBe(false);

      expect(responseItemsByRemovingPrivateProperties).toBeCalledTimes(5);
      expect(responseItemsByRemovingPrivateProperties).toBeCalledWith(
        [
          expect.objectContaining({
            uuid: noteItem.uuid
          })
        ],
        testComponent
      );
    });

    test('clientData property', async () => {
      const componentDataDomain = 'org.standardnotes.sn.components';
      const appData = {
        [testComponent.getClientDataKey()]: {
          foo: 'bar'
        }
      };

      let noteItemWithClientData = await createNoteItem(testSNApp, {
        title: 'Note 1',
        text: 'This is a test note :P'
      });
      noteItemWithClientData = await testSNApp.changeAndSaveItem(
        noteItemWithClientData.uuid,
        (mutator) => {
          mutator.setDomainData(appData, componentDataDomain);
        }
      );

      let jsonForItem = testSNApp.componentManager.jsonForItem(
        noteItemWithClientData,
        testComponent
      );
      expect(jsonForItem.clientData).toEqual(appData[testComponent.getClientDataKey()]);

      const noteItemWithoutClientData = await createNoteItem(testSNApp, {
        title: 'Note 2',
        text: 'This is another test note'
      });

      jsonForItem = testSNApp.componentManager.jsonForItem(
        noteItemWithoutClientData,
        testComponent
      );
      expect(jsonForItem.clientData).toEqual({});
      expect(responseItemsByRemovingPrivateProperties).toBeCalledTimes(2);
    });

    it('should have other item properties', async () => {
      const noteItem = await createNoteItem(testSNApp, {
        title: 'Note 1',
        text: 'This is a test note :-)'
      });

      const jsonForItem = testSNApp.componentManager.jsonForItem(
        noteItem,
        testComponent
      );
      expect(responseItemsByRemovingPrivateProperties).toBeCalledTimes(1);
      expect(responseItemsByRemovingPrivateProperties).toBeCalledWith(
        [
          expect.objectContaining({
            uuid: noteItem.uuid
          })
        ],
        testComponent
      );
      expect(jsonForItem).toMatchObject({
        uuid: noteItem.uuid,
        content_type: noteItem.content_type,
        created_at: noteItem.created_at,
        updated_at: noteItem.updated_at,
        deleted: undefined,
        content: {
          title: noteItem.content.title,
          text: noteItem.content.text
        }
      });
    });
  });

  describe('sendItemsInReply()', () => {
    test('should reply to message', async () => {
      const replyToMessage = jest.spyOn(
        testSNApp.componentManager,
        'replyToMessage'
      );
      const noteItem = await createNoteItem(testSNApp, {
        title: 'Note 1',
        text: 'This is a test note :D'
      });
      const noteJsonItem = testSNApp.componentManager.jsonForItem(noteItem, testComponent);
      const message = {
        action: ComponentAction.StreamItems,
        sessionKey: 'a-session-key',
        data: {
          foo: 'bar'
        }
      };

      testSNApp.componentManager.sendItemsInReply(
        (testComponent as SNItem).uuid,
        [noteItem],
        message
      );
      expect(replyToMessage).toBeCalledTimes(1);
      expect(replyToMessage).toBeCalledWith(
        testComponent,
        message,
        {
          items: [noteJsonItem]
        }
      );
    });
  });

  describe('sendContextItemInReply()', () => {
    test('should reply to message', async () => {
      const replyToMessage = jest.spyOn(
        testSNApp.componentManager,
        'replyToMessage'
      );
      const noteItem = await createNoteItem(testSNApp, {
        title: 'Note 1',
        text: 'This is a test note :)'
      });
      const noteJsonItem = testSNApp.componentManager.jsonForItem(noteItem, testComponent);
      const message = {
        action: ComponentAction.StreamContextItem,
        sessionKey: 'a-session-key',
        data: {
          foo: 'bar'
        }
      };

      testSNApp.componentManager.sendContextItemInReply(
        (testComponent as SNItem).uuid,
        noteItem,
        message
      );
      expect(replyToMessage).toBeCalledTimes(1);
      expect(replyToMessage).toBeCalledWith(
        testComponent,
        message,
        {
          item: noteJsonItem
        }
      );
    });
  });

  describe('replyToMessage()', () => {
    it('should send message to component', () => {
      const sendMessageToComponent = jest.spyOn(
        testSNApp.componentManager,
        'sendMessageToComponent'
      );
      const originalMessage = {
        action: ComponentAction.StreamContextItem,
        sessionKey: 'a-session-key',
      };
      const replyData = {
        items: []
      };

      testSNApp.componentManager.replyToMessage(
        testComponent,
        originalMessage,
        replyData
      );
      expect(sendMessageToComponent).toBeCalledTimes(1);
      expect(sendMessageToComponent).toBeCalledWith(
        testComponent,
        {
          action: ComponentAction.Reply,
          original: originalMessage,
          data: replyData
        }
      );
    });
  });

  describe('sendMessageToComponent()', () => {
    let iframeWindow;
    let logSpy;

    beforeEach(async () => {
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      iframeWindow = iframe.contentWindow;

      logSpy = jest.spyOn(
        testSNApp.componentManager,
        'log'
      );

      await testSNApp.componentManager.registerComponentWindow(
        testComponent,
        iframeWindow
      );
    });

    test('return if component is hidden and action is not allowed while hidden', async () => {
      const componentMessage = {
        action: ComponentAction.Reply
      };

      const postMessage = jest.spyOn(
        iframeWindow,
        'postMessage'
      );

      testSNApp.componentManager.setComponentHidden(testComponent, true);
      testSNApp.componentManager.sendMessageToComponent(
        testComponent,
        componentMessage
      );

      expect(postMessage).toBeCalledTimes(0);
      expect(logSpy).toBeCalledWith(
        'Component disabled for current item, ignoring messages.',
        testComponent.name
      );
    });

    test('return if component does not have a window and the message is a reply', async () => {
      await testSNApp.componentManager.registerComponentWindow(
        testComponent,
        undefined
      );

      const componentMessage = {
        action: ComponentAction.Reply
      };

      const postMessage = jest.spyOn(
        iframeWindow,
        'postMessage'
      );

      testSNApp.componentManager.sendMessageToComponent(
        testComponent,
        componentMessage
      );

      expect(postMessage).toBeCalledTimes(0);
      expect(logSpy).toBeCalledWith(
        'Component has been deallocated in between message send and reply',
        testComponent,
        componentMessage
      );
    });

    test('show an alert if origin is not defined', async () => {
      await testSNApp.componentManager.registerComponentWindow(
        testComponent,
        undefined
      );

      const componentMessage = {
        action: ComponentAction.ActivateThemes
      };

      const alertSpy = jest.spyOn(
        testSNApp.componentManager.alertService,
        'alert'
      );

      const postMessage = jest.spyOn(
        iframeWindow,
        'postMessage'
      );

      testSNApp.componentManager.sendMessageToComponent(
        testComponent,
        componentMessage
      );

      expect(postMessage).toBeCalledTimes(0);
      expect(alertSpy).toBeCalledTimes(1);
      expect(alertSpy).toBeCalledWith(
        `Standard Notes is trying to communicate with ${testComponent.name}, ` +
        'but an error is occurring. Please restart this extension and try again.'
      );
    });

    test('post message as-is on web or desktop', async () => {
      const componentMessage = {
        action: ComponentAction.ComponentRegistered
      };

      const postMessage = jest.spyOn(
        iframeWindow,
        'postMessage'
      );

      testSNApp.componentManager.sendMessageToComponent(
        testComponent,
        componentMessage
      );

      expect(postMessage).toBeCalledTimes(1);
      expect(postMessage).toBeCalledWith(
        componentMessage,
        testSNApp.componentManager.urlForComponent(testComponent)
      );
    });

    test('post message as json on mobile', async () => {
      testSNApp = await createApplication('test-application', Environment.Mobile, Platform.Android);
      await testSNApp.componentManager.registerComponentWindow(
        testComponent,
        iframeWindow
      );

      const componentMessage = {
        action: ComponentAction.ComponentRegistered
      };

      const postMessage = jest.spyOn(
        iframeWindow,
        'postMessage'
      );

      testSNApp.componentManager.sendMessageToComponent(
        testComponent,
        componentMessage
      );

      expect(postMessage).toBeCalledTimes(1);
      expect(postMessage).toBeCalledWith(
        JSON.stringify(componentMessage),
        testSNApp.componentManager.urlForComponent(testComponent)
      );
    });
  });

  describe('urlForComponent()', () => {
    describe('Desktop', () => {
      it('returns null because offlineOnly is available on desktop, and not on web or mobile', async () => {
        testSNApp = await createApplication('test-application', Environment.Mobile, Platform.Android);
        testComponent = await createComponentItem(testSNApp, testExtensionEditorPackage, {
          offlineOnly: true
        });

        const urlForComponent = testSNApp.componentManager.urlForComponent(testComponent);
        expect(urlForComponent).toBeNull();
      });

      it('replaces sn:// with the extensions server host', async () => {
        testSNApp = await createApplication('test-application', Environment.Desktop, Platform.LinuxDesktop);

        const extServerHost = 'https://127.0.0.1:45653/'
        const desktopManager = {
          getExtServerHost: jest.fn(() => extServerHost),
          registerUpdateObserver: jest.fn(),
          syncComponentsInstallation: jest.fn()
        };
        testSNApp.componentManager.setDesktopManager(desktopManager);

        testComponent = await createComponentItem(testSNApp, testExtensionEditorPackage, {
          offlineOnly: true,
          local_url: 'sn://my-local-editor'
        });

        const urlForComponent = testSNApp.componentManager.urlForComponent(testComponent);
        expect(urlForComponent).toBe(`${extServerHost}my-local-editor`);
      });
    });

    describe('Mobile', () => {
      it('replaces localhost or sn.local with localhost on iOS', async () => {
        testSNApp = await createApplication('test-application', Environment.Mobile, Platform.Ios);

        const localhostComponent = await createComponentItem(testSNApp, testExtensionEditorPackage, {
          hosted_url: 'http://localhost/my-extension-for-ios'
        });
        let urlForComponent = testSNApp.componentManager.urlForComponent(localhostComponent);
        expect(urlForComponent).toBe('http://localhost/my-extension-for-ios');

        const snLocalComponent = await createComponentItem(testSNApp, testExtensionEditorPackage, {
          hosted_url: 'http://sn.local/my-extension-for-ios'
        });
        urlForComponent = testSNApp.componentManager.urlForComponent(snLocalComponent);
        expect(urlForComponent).toBe('http://localhost/my-extension-for-ios');

        const remoteComponent = await createComponentItem(testSNApp, testExtensionEditorPackage, {
          hosted_url: 'https://remote-host.sn.org/my-extension-for-ios'
        });
        urlForComponent = testSNApp.componentManager.urlForComponent(remoteComponent);
        expect(urlForComponent).toBe('https://remote-host.sn.org/my-extension-for-ios');
      });

      it('replaces localhost or sn.local with 10.0.2.2 on Android', async () => {
        testSNApp = await createApplication('test-application', Environment.Mobile, Platform.Android);

        const localhostComponent = await createComponentItem(testSNApp, testExtensionEditorPackage, {
          hosted_url: 'http://localhost/my-extension-for-android'
        });
        let urlForComponent = testSNApp.componentManager.urlForComponent(localhostComponent);
        expect(urlForComponent).toBe('http://10.0.2.2/my-extension-for-android');

        const snLocalComponent = await createComponentItem(testSNApp, testExtensionEditorPackage, {
          hosted_url: 'http://sn.local/my-extension-for-android'
        });
        urlForComponent = testSNApp.componentManager.urlForComponent(snLocalComponent);
        expect(urlForComponent).toBe('http://10.0.2.2/my-extension-for-android');

        const remoteComponent = await createComponentItem(testSNApp, testExtensionEditorPackage, {
          hosted_url: 'https://remote-host.sn.org/my-extension-for-android'
        });
        urlForComponent = testSNApp.componentManager.urlForComponent(remoteComponent);
        expect(urlForComponent).toBe('https://remote-host.sn.org/my-extension-for-android');
      });
    });

    it('returns the hosted_url as-is', async () => {
      const urlForComponent = testSNApp.componentManager.urlForComponent(testComponent);
      expect(urlForComponent).toBe(testComponent.hosted_url);
    });
  });

  describe('componentForUrl()', () => {
    it('returns the first component that matches the url', async () => {
      const firstComponentSameUrl = await createComponentItem(testSNApp, testExtensionEditorPackage, {
        hosted_url: 'http://localhost/my-extension'
      });

      let componentForUrl = testSNApp.componentManager.componentForUrl('http://localhost/my-extension');
      expect(componentForUrl).toBe(firstComponentSameUrl);

      const secondComponentSameUrl = await createComponentItem(testSNApp, testExtensionEditorPackage, {
        hosted_url: 'http://localhost/my-extension'
      });

      componentForUrl = testSNApp.componentManager.componentForUrl('http://localhost/my-extension');
      expect(componentForUrl).not.toBe(secondComponentSameUrl);
      expect(componentForUrl).toBe(firstComponentSameUrl);
    });
  });

  describe('sessionKeyForComponent()', () => {
    it('returns undefined if the component has not been registered', () => {
      const sessionKey = testSNApp.componentManager.sessionKeyForComponent(testComponent);
      expect(sessionKey).toBeUndefined();
    });

    it('returns a valid value if the component is registered', async () => {
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      await registerComponent(testSNApp, iframe.contentWindow, testComponent);

      const sessionKey = testSNApp.componentManager.sessionKeyForComponent(testComponent);
      expect(sessionKey).toBeDefined();
    });
  });

  describe('componentForSessionKey()', () => {
    it('returns undefined if the session key does not exist', () => {
      const component = testSNApp.componentManager.componentForSessionKey('a-session-key');
      expect(component).toBeUndefined();
    });

    it('returns a valid component if the session key exists', async () => {
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      await registerComponent(testSNApp, iframe.contentWindow, testComponent);

      const sessionKey = testSNApp.componentManager.sessionKeyForComponent(testComponent);
      const component = testSNApp.componentManager.componentForSessionKey(sessionKey);
      expect(component).toBeDefined();
    });

    it('finds a component that was registered via registerHandler', () => {
      const customActionHandler = jest.fn();
      const componentForSessionKeyHandler = jest.fn((key: string) => {
        if (key === 'my-component-key') {
          return testComponent;
        }
      });
      registerComponentHandler(
        testSNApp,
        [testComponent.area],
        undefined,
        customActionHandler,
        componentForSessionKeyHandler
      );

      const component = testSNApp.componentManager.componentForSessionKey('my-component-key');
      expect(component).toBeDefined();
      expect(component).toBe(testComponent);
    });
  });

  describe('handleMessage()', () => {
    let alertSpy;

    beforeEach(() => {
      alertSpy = jest.spyOn(testSNApp.componentManager.alertService, 'alert');
    });

    it('shows an alert if the passed component is not valid', () => {
      const componentMessage = {
        action: ComponentAction.StreamItems
      };

      testSNApp.componentManager.handleMessage(undefined, componentMessage);
      expect(alertSpy).toBeCalledTimes(1);
      expect(alertSpy).lastCalledWith(
        'An extension is trying to communicate with Standard Notes, ' +
        'but there is an error establishing a bridge. Please restart the app and try again.'
      );
    });

    const readwriteActions = [
      ComponentAction.SaveItems,
      ComponentAction.AssociateItem,
      ComponentAction.DeassociateItem,
      ComponentAction.CreateItem,
      ComponentAction.CreateItems,
      ComponentAction.DeleteItems,
      ComponentAction.SetComponentData,
    ];

    test.each(readwriteActions)(
      'shows an alert if the component is in read-only state and the message action is %s',
      (messageAction: ComponentAction) => {
        const componentMessage = {
          action: messageAction
        };
        testSNApp.componentManager.setReadonlyStateForComponent(testComponent, true);

        testSNApp.componentManager.handleMessage(testComponent, componentMessage);
        expect(alertSpy).toBeCalledTimes(1);
        expect(alertSpy).lastCalledWith(
          `The extension ${testComponent.name} is trying to save, but it is in a locked state and cannot accept changes.`
        );
      });

    it('calls the handler function for StreamItems action', () => {
      const componentMessage = {
        action: ComponentAction.StreamItems,
        data: {
          content_types: [ContentType.Note]
        }
      };
      const handleStreamItemsMessage = jest.spyOn(
        testSNApp.componentManager,
        'handleStreamItemsMessage'
      );

      testSNApp.componentManager.handleMessage(testComponent, componentMessage);
      expect(handleStreamItemsMessage).toBeCalledTimes(1);
      expect(handleStreamItemsMessage).lastCalledWith(testComponent, componentMessage);
    });

    it('calls the handler function for StreamContextItem action', () => {
      const componentMessage = {
        action: ComponentAction.StreamContextItem
      };
      const handleStreamContextItemMessage = jest.spyOn(
        testSNApp.componentManager,
        'handleStreamContextItemMessage'
      );

      testSNApp.componentManager.handleMessage(testComponent, componentMessage);
      expect(handleStreamContextItemMessage).toBeCalledTimes(1);
      expect(handleStreamContextItemMessage).lastCalledWith(testComponent, componentMessage);
    });

    it('calls the handler function for SetComponentData action', () => {
      const componentMessage = {
        action: ComponentAction.SetComponentData,
        data: {}
      };
      const handleSetComponentDataMessage = jest.spyOn(
        testSNApp.componentManager,
        'handleSetComponentDataMessage'
      );

      testSNApp.componentManager.handleMessage(testComponent, componentMessage);
      expect(handleSetComponentDataMessage).toBeCalledTimes(1);
      expect(handleSetComponentDataMessage).lastCalledWith(testComponent, componentMessage);
    });

    it('calls the handler function for DeleteItems action', () => {
      const componentMessage = {
        action: ComponentAction.DeleteItems,
        data: {
          items: []
        }
      };
      const handleDeleteItemsMessage = jest.spyOn(
        testSNApp.componentManager,
        'handleDeleteItemsMessage'
      );

      testSNApp.componentManager.handleMessage(testComponent, componentMessage);
      expect(handleDeleteItemsMessage).toBeCalledTimes(1);
      expect(handleDeleteItemsMessage).lastCalledWith(testComponent, componentMessage);
    });

    it('calls the handler function for CreateItem action', () => {
      const componentMessage = {
        action: ComponentAction.CreateItem,
        data: {
          item: {}
        }
      };
      const handleCreateItemsMessage = jest.spyOn(
        testSNApp.componentManager,
        'handleCreateItemsMessage'
      );

      testSNApp.componentManager.handleMessage(testComponent, componentMessage);
      expect(handleCreateItemsMessage).toBeCalledTimes(1);
      expect(handleCreateItemsMessage).lastCalledWith(testComponent, componentMessage);
    });

    it('calls the handler function for CreateItems action', () => {
      const componentMessage = {
        action: ComponentAction.CreateItems,
        data: {
          items: []
        }
      };
      const handleCreateItemsMessage = jest.spyOn(
        testSNApp.componentManager,
        'handleCreateItemsMessage'
      );

      testSNApp.componentManager.handleMessage(testComponent, componentMessage);
      expect(handleCreateItemsMessage).toBeCalledTimes(1);
      expect(handleCreateItemsMessage).lastCalledWith(testComponent, componentMessage);
    });

    it('calls the handler function for SaveItems action', async () => {
      const noteItem = await createNoteItem(testSNApp, {
        title: 'Note 1',
        text: 'This is a test note :7'
      });
      const componentMessage = {
        action: ComponentAction.SaveItems,
        data: {
          items: [noteItem]
        }
      };
      const handleSaveItemsMessage = jest.spyOn(
        testSNApp.componentManager,
        'handleSaveItemsMessage'
      );

      testSNApp.componentManager.handleMessage(testComponent, componentMessage);
      expect(handleSaveItemsMessage).toBeCalledTimes(1);
      expect(handleSaveItemsMessage).lastCalledWith(testComponent, componentMessage);
    });

    it('calls the handler function for ToggleActivateComponent action', async () => {
      const componentMessage = {
        action: ComponentAction.ToggleActivateComponent,
        data: {
          uuid: (testComponent as SNItem).uuid
        }
      };
      const handleToggleComponentMessage = jest.spyOn(
        testSNApp.componentManager,
        'handleToggleComponentMessage'
      );

      testSNApp.componentManager.handleMessage(testComponent, componentMessage);
      expect(handleToggleComponentMessage).toBeCalledTimes(1);
      expect(handleToggleComponentMessage).lastCalledWith(testComponent);
    });

    it('calls the handler function for RequestPermissions action', () => {
      const componentMessage = {
        action: ComponentAction.RequestPermissions,
        data: {
          permissions: []
        }
      };
      const handleRequestPermissionsMessage = jest.spyOn(
        testSNApp.componentManager,
        'handleRequestPermissionsMessage'
      );

      testSNApp.componentManager.handleMessage(testComponent, componentMessage);
      expect(handleRequestPermissionsMessage).toBeCalledTimes(1);
      expect(handleRequestPermissionsMessage).lastCalledWith(testComponent, componentMessage);
    });

    it('calls the handler function for InstallLocalComponent action', () => {
      const componentMessage = {
        action: ComponentAction.InstallLocalComponent
      };
      const handleInstallLocalComponentMessage = jest.spyOn(
        testSNApp.componentManager,
        'handleInstallLocalComponentMessage'
      );

      testSNApp.componentManager.handleMessage(testComponent, componentMessage);
      expect(handleInstallLocalComponentMessage).toBeCalledTimes(1);
      expect(handleInstallLocalComponentMessage).lastCalledWith(testComponent, componentMessage);
    });

    it('calls the handler function for DuplicateItem action', async () => {
      const noteItem = await createNoteItem(testSNApp, {
        title: 'Note 1',
        text: 'This is a test note that needs to be duplicated.'
      });
      const componentMessage = {
        action: ComponentAction.DuplicateItem,
        data: {
          item: {
            uuid: noteItem.uuid
          }
        }
      };
      const handleDuplicateItemMessage = jest.spyOn(
        testSNApp.componentManager,
        'handleDuplicateItemMessage'
      );

      testSNApp.componentManager.handleMessage(testComponent, componentMessage);
      expect(handleDuplicateItemMessage).toBeCalledTimes(1);
      expect(handleDuplicateItemMessage).lastCalledWith(testComponent, componentMessage);
    });

    it('calls the handler function for the handlers in the same area', async () => {
      const customActionHandler = jest.fn();
      const editorComponent = await createComponentItem(testSNApp, testExtensionEditorPackage);
      registerComponentHandler(
        testSNApp,
        [editorComponent.area],
        undefined,
        customActionHandler
      );

      const componentMessage = {
        action: ComponentAction.StreamItems,
        data: {
          content_types: [ContentType.Note]
        }
      };

      testSNApp.componentManager.handleMessage(editorComponent, componentMessage);
      await sleep(SHORT_DELAY_TIME);

      expect(customActionHandler).toBeCalledTimes(1);
      expect(customActionHandler).lastCalledWith(
        editorComponent,
        componentMessage.action,
        componentMessage.data
      );
    });
  });

  describe('responseItemsByRemovingPrivateProperties()', () => {
    it('returns responseItems as-is if the component is a native extension', async () => {
      const batchManagerPackage = {
        identifier: "test.standardnotes.batch-manager-extension",
        name: "Batch manager",
        content_type: "SN|Component",
        area: "modal",
        version: "1.0.0",
        url: "http://localhost/extensions/batch_manager"
      };
      const batchManagerComponent = await createComponentItem(testSNApp, batchManagerPackage);
      const responseItems = [
        {
          foo: 'bar',
          test: 'testing'
        }
      ];
      
      const returnedItems = testSNApp.componentManager.responseItemsByRemovingPrivateProperties(
        responseItems,
        batchManagerComponent
      );
      expect(returnedItems).toEqual(responseItems);
    });

    it('does not include private content properties', async () => {
      const responseItems = [
        {
          foo: 'bar',
          test: 'testing',
          content: {
            text: 'test',
            active: true,
            permissions: [],
            autoupdateDisabled: true
          }
        }
      ];
      
      const returnedItems = testSNApp.componentManager.responseItemsByRemovingPrivateProperties(
        responseItems,
        testComponent
      );
      expect(returnedItems).toEqual([
        {
          foo: 'bar',
          test: 'testing',
          content: {
            text: 'test'
          }
        }
      ]);
    });

    it('returns the item as-is if the content key is a string', async () => {
      const responseItems = [
        {
          foo: 'bar',
          test: 'testing',
          content: 'this is a string'
        }
      ];
      
      const returnedItems = testSNApp.componentManager.responseItemsByRemovingPrivateProperties(
        responseItems,
        testComponent
      );
      expect(returnedItems).toEqual(responseItems);
    });

    it('returns the item as-is if the content key is not present', async () => {
      const responseItems = [
        {
          foo: 'bar',
          test: 'testing'
        }
      ];
      
      const returnedItems = testSNApp.componentManager.responseItemsByRemovingPrivateProperties(
        responseItems,
        testComponent
      );
      expect(returnedItems).toEqual(responseItems);
    });

    it('includes hosted_url, local_url or url properties when includeUrls is true', async () => {
      const responseItems = [
        {
          foo: 'bar',
          test: 'testing',
          content: {
            text: 'test',
            active: true,
            permissions: [],
            autoupdateDisabled: true,
            hosted_url: 'test',
            local_url: 'test',
            url: 'test'
          }
        }
      ];
      
      const returnedItems = testSNApp.componentManager.responseItemsByRemovingPrivateProperties(
        responseItems,
        testComponent,
        true
      );
      expect(returnedItems).toEqual([
        {
          foo: 'bar',
          test: 'testing',
          content: {
            text: 'test'
          }
        }
      ]);
    });
  });

  describe('handleStreamItemsMessage()', () => {
    let runWithPermissions;
    let sendItemsInReply;

    beforeEach(() => {
      runWithPermissions = jest.spyOn(
        testSNApp.componentManager,
        'runWithPermissions'
      );
      sendItemsInReply = jest.spyOn(
        testSNApp.componentManager,
        'sendItemsInReply'
      );

      /**
       * Components prompts for permissions via the presentPermissionsDialog function, which
       * has been implemented to use window.confirm to approve these requests.
       */
       window.confirm = (message) => true;
    });

    const AllowedContentTypesInBulk = [
      ContentType.ActionsExtension,
      ContentType.Editor,
      ContentType.ExtensionRepo,
      ContentType.FilesafeCredentials,
      ContentType.FilesafeFileMetadata,
      ContentType.FilesafeIntegration,
      ContentType.Mfa,
      ContentType.ServerExtension,
      ContentType.SmartTag,
      ContentType.Tag,
      ContentType.Theme,
    ];

    test('only allow content types that can be streamed in bulk by the component', async () => {
      const componentMessage = {
        action: ComponentAction.StreamItems,
        data: {
          content_types: AllowedContentTypesInBulk
        }
      };

      testSNApp.componentManager.handleStreamItemsMessage(testComponent, componentMessage);
      await sleep(SHORT_DELAY_TIME);

      expect(runWithPermissions).toBeCalledTimes(1);
      expect(runWithPermissions).lastCalledWith(
        (testComponent as SNItem).uuid,
        [
          {
            name: ComponentAction.StreamItems,
            content_types: AllowedContentTypesInBulk.sort()
          },
        ],
        expect.any(Function)
      );

      expect(sendItemsInReply).toBeCalledTimes(1);
      expect(sendItemsInReply).lastCalledWith(
        (testComponent as SNItem).uuid,
        expect.any(Array),
        componentMessage
      );
    });

    it('do not allow a content type to be streamed in bulk by if not in the allow list', async () => {
      await createNoteItem(testSNApp);
      await createNoteItem(testSNApp);
      await createNoteItem(testSNApp);

      const componentMessage = {
        action: ComponentAction.StreamItems,
        data: {
          content_types: [ContentType.Note]
        }
      };

      testSNApp.componentManager.handleStreamItemsMessage(testComponent, componentMessage);
      await sleep(SHORT_DELAY_TIME);

      expect(runWithPermissions).toBeCalledTimes(1);
      expect(runWithPermissions).lastCalledWith(
        (testComponent as SNItem).uuid,
        [
          {
            name: ComponentAction.StreamItems,
            content_types: []
          },
        ],
        expect.any(Function)
      );

      expect(sendItemsInReply).toBeCalledTimes(1);
      expect(sendItemsInReply).lastCalledWith(
        (testComponent as SNItem).uuid,
        [],
        componentMessage
      );
    });

    test('stream all items with the selected content types', async () => {
      const tag1 = await createTagItem(testSNApp, 'Tag 1');
      const tag2 = await createTagItem(testSNApp, 'Tag 2');
      const tag3 = await createTagItem(testSNApp, 'Tag 3');

      const componentMessage = {
        action: ComponentAction.StreamItems,
        data: {
          content_types: [ContentType.Tag]
        }
      };

      testSNApp.componentManager.handleStreamItemsMessage(testComponent, componentMessage);
      await sleep(SHORT_DELAY_TIME);

      expect(runWithPermissions).toBeCalledTimes(1);
      expect(runWithPermissions).lastCalledWith(
        (testComponent as SNItem).uuid,
        [
          {
            name: ComponentAction.StreamItems,
            content_types: componentMessage.data.content_types
          },
        ],
        expect.any(Function)
      );

      expect(sendItemsInReply).toBeCalledTimes(1);
      expect(sendItemsInReply).lastCalledWith(
        (testComponent as SNItem).uuid,
        [ tag1, tag2, tag3 ],
        componentMessage
      );
    });

    test('streamed items should be non errored items', async () => {
      await createTagItem(testSNApp, 'Tag 1');

      const componentMessage = {
        action: ComponentAction.StreamItems,
        data: {
          content_types: [ContentType.Tag]
        }
      };

      const nonErroredItemsForContentType = jest.spyOn(
        testSNApp.itemManager,
        'nonErroredItemsForContentType'
      );

      testSNApp.componentManager.handleStreamItemsMessage(testComponent, componentMessage);
      await sleep(SHORT_DELAY_TIME);

      expect(nonErroredItemsForContentType).toBeCalledTimes(1);
      expect(nonErroredItemsForContentType).lastCalledWith(ContentType.Tag);
    });
  });

  describe('handleStreamContextItemMessage()', () => {
    let runWithPermissions;
    let sendContextItemInReply;

    beforeEach(() => {
      runWithPermissions = jest.spyOn(
        testSNApp.componentManager,
        'runWithPermissions'
      );
      sendContextItemInReply = jest.spyOn(
        testSNApp.componentManager,
        'sendContextItemInReply'
      );

      /**
       * Components prompts for permissions via the presentPermissionsDialog function, which
       * has been implemented to use window.confirm to approve these requests.
       */
       window.confirm = (message) => true;
    });

    test('push to context stream observers if the observer does not exist', async () => {
      const contextStreamObservers = testSNApp.componentManager['contextStreamObservers'];

      expect(contextStreamObservers).toHaveLength(0);

      testSNApp.componentManager.handleStreamContextItemMessage(testComponent, {
        action: ComponentAction.StreamContextItem
      });
      await sleep(SHORT_DELAY_TIME);

      expect(runWithPermissions).toBeCalledTimes(1);
      expect(runWithPermissions).toBeCalledWith(
        (testComponent as SNItem).uuid,
        [
          {
            name: ComponentAction.StreamContextItem
          },
        ],
        expect.any(Function)
      );

      expect(contextStreamObservers).toContainEqual({
        identifier: (testComponent as SNItem).uuid,
        componentUuid: (testComponent as SNItem).uuid,
        area: testComponent.area,
        originalMessage: {
          action: ComponentAction.StreamContextItem
        },
      });
    });

    test('send context item in reply', async () => {
      const itemInContext = await createNoteItem(testSNApp, { title: 'Note 1' });
      const customActionHandler = jest.fn();
      registerComponentHandler(
        testSNApp,
        [testComponent.area],
        itemInContext,
        customActionHandler
      );

      const componentMessage = {
        action: ComponentAction.StreamContextItem
      };
      testSNApp.componentManager.handleStreamContextItemMessage(testComponent, componentMessage);
      await sleep(SHORT_DELAY_TIME);

      expect(sendContextItemInReply).toBeCalledTimes(1);
      expect(sendContextItemInReply).toBeCalledWith(
        (testComponent as SNItem).uuid,
        itemInContext,
        componentMessage
      );
    });
  });

  describe('itemIdsInContextJurisdictionForComponent()', () => {
    it('returns an empty array if no handler is registered', () => {
      const itemIds = testSNApp.componentManager.itemIdsInContextJurisdictionForComponent(testComponent);
      expect(itemIds).toHaveLength(0);
    });

    it('returns item ids in context for the component', async () => {
      const itemInContext = await createNoteItem(testSNApp, { title: 'Note 1' });
      await createNoteItem(testSNApp, { title: 'Note 2' });

      const customActionHandler = jest.fn();
      registerComponentHandler(
        testSNApp,
        [testComponent.area],
        itemInContext,
        customActionHandler
      );

      const itemIds = testSNApp.componentManager.itemIdsInContextJurisdictionForComponent(testComponent);
      expect(itemIds).toHaveLength(1);
      expect(itemIds[0]).toEqual(itemInContext.uuid);
    });

    it('checks if the item is in jurisdiction of component', async () => {
      const itemInContext = await createNoteItem(testSNApp, { title: 'Note 1' });
      const anotherNote = await createNoteItem(testSNApp, { title: 'Note 2' });

      const customActionHandler = jest.fn();
      registerComponentHandler(
        testSNApp,
        [testComponent.area],
        itemInContext,
        customActionHandler
      );

      let isItemInJurisdiction = testSNApp.componentManager.isItemIdWithinComponentContextJurisdiction(
        itemInContext.uuid,
        testComponent
      );
      expect(isItemInJurisdiction).toBe(true);

      isItemInJurisdiction = testSNApp.componentManager.isItemIdWithinComponentContextJurisdiction(
        anotherNote.uuid,
        testComponent
      );
      expect(isItemInJurisdiction).toBe(false);
    });
  });

  test('handlersForArea() returns handlers in the specified area', () => {
    const customActionHandler = jest.fn();
    registerComponentHandler(
      testSNApp,
      [ComponentArea.Editor, ComponentArea.Rooms],
      undefined,
      customActionHandler
    );

    const handlersInEditorArea = testSNApp.componentManager.handlersForArea(ComponentArea.Editor);
    expect(handlersInEditorArea).toHaveLength(1);

    const handlersInRoomsArea = testSNApp.componentManager.handlersForArea(ComponentArea.Rooms);
    expect(handlersInRoomsArea).toHaveLength(1);

    let handlersInTagsListArea = testSNApp.componentManager.handlersForArea(ComponentArea.TagsList);
    expect(handlersInTagsListArea).toHaveLength(0);

    registerComponentHandler(
      testSNApp,
      [ComponentArea.TagsList],
      undefined,
      customActionHandler
    );

    handlersInTagsListArea = testSNApp.componentManager.handlersForArea(ComponentArea.TagsList);
    expect(handlersInTagsListArea).toHaveLength(1);
  });

  describe.skip('handleSaveItemsMessage()', () => { });

  describe('handleDuplicateItemMessage()', () => {
    let runWithPermissions;
    let replyToMessage;

    beforeEach(() => {
      runWithPermissions = jest.spyOn(
        testSNApp.componentManager,
        'runWithPermissions'
      );
      replyToMessage = jest.spyOn(
        testSNApp.componentManager,
        'replyToMessage'
      );

      /**
       * Components prompts for permissions via the presentPermissionsDialog function, which
       * has been implemented to use window.confirm to approve these requests.
       */
       window.confirm = (message) => true;
    });

    test('duplicates an item by uuid', async () => {
      const someNote = await createNoteItem(testSNApp, { title: 'Some note that will be duplicated' });
      expect(testSNApp.itemManager.noteCount).toBe(1);

      const componentMessage = {
        data: {
          item: {
            uuid: someNote.uuid
          },
        },
      };

      testSNApp.componentManager.handleDuplicateItemMessage(testComponent, componentMessage);
      await sleep(SHORT_DELAY_TIME);

      expect(runWithPermissions).toBeCalledTimes(1);
      expect(runWithPermissions).toBeCalledWith(
        (testComponent as SNItem).uuid,
        [
          {
            name: ComponentAction.StreamItems,
            content_types: [someNote.content_type]
          }
        ],
        expect.any(Function)
      );
      expect(testSNApp.itemManager.noteCount).toBe(2);
      expect(replyToMessage).toBeCalledTimes(1);
      expect(replyToMessage).toBeCalledWith(
        testComponent,
        componentMessage,
        {
          item: expect.objectContaining({
            content: expect.objectContaining({
              title: someNote.title,
              text: someNote.text
            })
          })
        }
      );
    });
  });

  describe.skip('handleCreateItemsMessage()', () => { });

  describe.skip('handleDeleteItemsMessage()', () => { });

  describe('handleRequestPermissionsMessage()', () => {
    let runWithPermissions;
    let replyToMessage;

    beforeEach(() => {
      runWithPermissions = jest.spyOn(
        testSNApp.componentManager,
        'runWithPermissions'
      );
      replyToMessage = jest.spyOn(
        testSNApp.componentManager,
        'replyToMessage'
      );

      /**
       * Components prompts for permissions via the presentPermissionsDialog function, which
       * has been implemented to use window.confirm to approve these requests.
       */
       window.confirm = (message) => true;
    });

    test('approves the given permissions', async () => {
      const componentMessage = {
        data: {
          permissions: [ ComponentAction.StreamItems ]
        }
      };

      testSNApp.componentManager.handleRequestPermissionsMessage(testComponent, componentMessage);
      await sleep(SHORT_DELAY_TIME);

      expect(runWithPermissions).toBeCalledTimes(1);
      expect(runWithPermissions).toBeCalledWith(
        (testComponent as SNItem).uuid,
        componentMessage.data.permissions,
        expect.any(Function)
      );
      expect(replyToMessage).toBeCalledTimes(1);
      expect(replyToMessage).toBeCalledWith(
        testComponent,
        componentMessage,
        {
          approved: true
        }
      );
    });
  });

  describe('handleSetComponentDataMessage()', () => {
    let runWithPermissions;

    beforeEach(() => {
      runWithPermissions = jest.spyOn(
        testSNApp.componentManager,
        'runWithPermissions'
      );

      /**
       * Components prompts for permissions via the presentPermissionsDialog function, which
       * has been implemented to use window.confirm to approve these requests.
       */
       window.confirm = (message) => true;
    });

    test('changes the componentData for the component', async () => {
      const componentMessage = {
        data: {
          componentData: {
            foo: 'test',
            bar: 'test'
          }
        }
      };

      testSNApp.componentManager.handleSetComponentDataMessage(testComponent, componentMessage);
      await sleep(SHORT_DELAY_TIME);

      expect(runWithPermissions).toBeCalledTimes(1);
      expect(runWithPermissions).toBeCalledWith(
        (testComponent as SNItem).uuid,
        [],
        expect.any(Function)
      );

      testComponent = testSNApp.itemManager.findItem(
        (testComponent as SNItem).uuid
      );
      expect(testComponent.componentData).toEqual(componentMessage.data.componentData);
    });
  });

  describe('handleToggleComponentMessage()', () => {
    test('opens a modal component', async () => {
      const modalComponent = await createComponentItem(testSNApp, {
        identifier: "test.standardnotes.my-modal-extension",
        name: "My Modal Extension",
        content_type: "SN|Component",
        area: "modal",
        version: "1.0.0",
        url: "http://localhost"
      });

      const alertMessage = jest.spyOn(window, 'alert');

      await testSNApp.componentManager.handleToggleComponentMessage(modalComponent);
      expect(alertMessage).toBeCalledTimes(1);
      expect(alertMessage).toBeCalledWith(modalComponent.name);
    });

    test('deactivate component if active', async () => {
      const activeComponent = await createComponentItem(testSNApp, testExtensionEditorPackage, {
        active: true
      });
      const deactivateComponent = jest.spyOn(
        testSNApp.componentManager,
        'deactivateComponent'
      );

      await testSNApp.componentManager.handleToggleComponentMessage(activeComponent);

      expect(deactivateComponent).toBeCalledTimes(1);
      expect(deactivateComponent).toBeCalledWith(
        (activeComponent as SNItem).uuid
      );
    });

    test('current active theme is activated before desactivating others', async () => {
      const currentThemeComponent = await createComponentItem(testSNApp, testThemeDefaultPackage);
      const activateComponent = jest.spyOn(
        testSNApp.componentManager,
        'activateComponent'
      );

      await testSNApp.componentManager.handleToggleComponentMessage(currentThemeComponent);

      expect(activateComponent).toBeCalledTimes(1);
      expect(activateComponent).toBeCalledWith(
        (currentThemeComponent as SNItem).uuid
      );
    });
  });

  describe('handleInstallLocalComponentMessage()', () => {
    let desktopManager;

    beforeEach(() => {
      const extServerHost = 'https://127.0.0.1:45653/'
      desktopManager = {
        getExtServerHost: jest.fn(() => extServerHost),
        registerUpdateObserver: jest.fn(),
        syncComponentsInstallation: jest.fn(),
        installComponent: jest.fn()
      };
      testSNApp.componentManager.setDesktopManager(desktopManager);
    });

    test('only native extensions can install local components', async () => {
      const themeComponent = await createComponentItem(testSNApp, testThemeDefaultPackage);

      testSNApp.componentManager.handleInstallLocalComponentMessage(themeComponent);
      expect(desktopManager.installComponent).toBeCalledTimes(0);
    });

    test('installComponent is called with the provided component uuid', async () => {
      const extensionsManagerPackage = {
        identifier: "test.standardnotes.extensions-manager-extension",
        name: "Extensions manager",
        content_type: "SN|Component",
        area: "modal",
        version: "1.0.0",
        url: "http://localhost/extensions/extension_manager"
      };
      const nativeExtension = await createComponentItem(testSNApp, extensionsManagerPackage);

      testSNApp.componentManager.handleInstallLocalComponentMessage(nativeExtension, {
        data: {
          uuid: (testComponent as SNItem).uuid
        }
      });
      expect(desktopManager.installComponent).toBeCalledTimes(1);
      expect(desktopManager.installComponent).toBeCalledWith(testComponent);
    });
  });

  describe('runWithPermissions()', () => {
    let runFunction;

    beforeEach(async () => {
      testSNApp = await createApplication('test-application', Environment.Web, Platform.LinuxWeb);
      testComponent = await createComponentItem(testSNApp, testExtensionEditorPackage);
      runFunction = jest.fn();
    });

    test('the specified function will be executed if no required permissions', () => {
      /**
       * Rejecting any permission prompts, since we are expecting to execute the function
       * without any explicit permissions.
       */
      window.confirm = (message) => false;

      testSNApp.componentManager.runWithPermissions(
        (testComponent as SNItem).uuid,
        [],
        runFunction
      );
      expect(runFunction).toBeCalledTimes(1);
    });

    test.skip('the specified function will be executed only if the permission prompt is approved', async () => {
      /**
       * Initially rejecting any permission prompts.
       */
      window.confirm = (message) => false;

      const requiredPermissions = [
        {
          name: ComponentAction.CreateItem,
        }
      ];

      testSNApp.componentManager.runWithPermissions(
        (testComponent as SNItem).uuid,
        requiredPermissions,
        runFunction
      );
      await sleep(SHORT_DELAY_TIME);
      expect(runFunction).toBeCalledTimes(0);

      /**
       * Approving any subsequent permission prompts.
       */
      window.confirm = (message) => true;

      testSNApp.componentManager.runWithPermissions(
        (testComponent as SNItem).uuid,
        requiredPermissions,
        runFunction
      );
      await sleep(SHORT_DELAY_TIME);
      expect(runFunction).toBeCalledTimes(1);
    });

    test.skip('already adquired permissions should not be requested again', async () => {
      const promptForPermissions = jest.spyOn(
        testSNApp.componentManager,
        'promptForPermissions'
      );

      /**
       * Approving all permission prompts.
       */
      window.confirm = (message) => true;

      const requiredPermissions1 = [
        {
          name: ComponentAction.CreateItems,
          content_types: [ContentType.Tag]
        }
      ];

      testSNApp.componentManager.runWithPermissions(
        (testComponent as SNItem).uuid,
        requiredPermissions1,
        runFunction
      );
      await sleep(SHORT_DELAY_TIME);
      expect(runFunction).toBeCalledTimes(1);

      expect(promptForPermissions).toBeCalledTimes(1);
      expect(promptForPermissions).toHaveBeenLastCalledWith(
        testComponent,
        requiredPermissions1,
        expect.any(Function)
      );
 
      const requiredPermissions2 = [
        {
          name: ComponentAction.CreateItems,
          content_types: [ContentType.Tag]
        },
        {
          name: ComponentAction.StreamContextItem
        }
      ];
 
      testSNApp.componentManager.runWithPermissions(
        (testComponent as SNItem).uuid,
        requiredPermissions2,
        runFunction
      );
      await sleep(SHORT_DELAY_TIME);
      expect(runFunction).toBeCalledTimes(2);

      expect(promptForPermissions).toBeCalledTimes(2);
      expect(promptForPermissions).toHaveBeenLastCalledWith(
        expect.objectContaining({
          uuid: (testComponent as SNItem).uuid
        }),
        [
          {
            name: ComponentAction.StreamContextItem
          }
        ],
        expect.any(Function)
      );
    });
  });

  test('findOrCreateDataForComponent()', async () => {
    /**
     * Creating a new test component should have an empty componentData object.
     */
    testComponent = await createComponentItem(testSNApp, testExtensionEditorPackage);

    const componentUuid = (testComponent as SNItem).uuid;
    const { componentState } = testSNApp.componentManager;

    expect(componentState[componentUuid]).toBeUndefined();

    let componentData = testSNApp.componentManager.findOrCreateDataForComponent(componentUuid);
    expect(componentData).toEqual({});

    componentState[componentUuid] = {
      foo: 'bar'
    };
    componentData = testSNApp.componentManager.findOrCreateDataForComponent(componentUuid);
    expect(componentData).toEqual({
      foo: 'bar'
    });
  });

  test('getReadonlyStateForComponent() and setReadonlyStateForComponent()', () => {
    let readonlyState = testSNApp.componentManager.getReadonlyStateForComponent(
      testComponent
    );
    expect(readonlyState).toEqual({
      readonly: undefined,
      lockReadonly: undefined
    });

    testSNApp.componentManager.setReadonlyStateForComponent(
      testComponent,
      true
    );
    readonlyState = testSNApp.componentManager.getReadonlyStateForComponent(
      testComponent
    );
    expect(readonlyState).toEqual({
      readonly: true,
      lockReadonly: false
    });

    testSNApp.componentManager.setReadonlyStateForComponent(
      testComponent,
      true,
      true
    );
    readonlyState = testSNApp.componentManager.getReadonlyStateForComponent(
      testComponent
    );
    expect(readonlyState).toEqual({
      readonly: true,
      lockReadonly: true
    });

    testSNApp.componentManager.setReadonlyStateForComponent(
      testComponent,
      false
    );
    readonlyState = testSNApp.componentManager.getReadonlyStateForComponent(
      testComponent
    );
    expect(readonlyState).toEqual({
      readonly: false,
      lockReadonly: false
    });

    testSNApp.componentManager.setReadonlyStateForComponent(
      testComponent,
      false,
      true
    );
    readonlyState = testSNApp.componentManager.getReadonlyStateForComponent(
      testComponent
    );
    expect(readonlyState).toEqual({
      readonly: false,
      lockReadonly: true
    });
  });

  describe('registerComponentWindow()', () => {
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);

    it('sends ComponentRegistered message to component', async () => {
      const sendMessageToComponent = jest.spyOn(
        testSNApp.componentManager,
        'sendMessageToComponent'
      );

      await testSNApp.componentManager.registerComponentWindow(
        testComponent,
        iframe.contentWindow
      );
      expect(sendMessageToComponent).nthCalledWith(1,
        testComponent,
        {
          action: ComponentAction.ComponentRegistered,
          sessionKey: expect.any(String),
          componentData: testComponent.componentData,
          data: {
            uuid: (testComponent as SNItem).uuid,
            environment: environmentToString(testSNApp.componentManager.environment),
            platform: platformToString(testSNApp.componentManager.platform),
            activeThemeUrls: testSNApp.componentManager.urlsForActiveThemes()
          }
        }
      );
    });

    it('posts active themes to component', async () => {
      const postActiveThemesToComponent = jest.spyOn(
        testSNApp.componentManager,
        'postActiveThemesToComponent'
      );

      await testSNApp.componentManager.registerComponentWindow(
        testComponent,
        iframe.contentWindow
      );
      expect(postActiveThemesToComponent).toBeCalledTimes(1);
      expect(postActiveThemesToComponent).toBeCalledWith(testComponent);
    });

    it('notifies component activate through desktopManagerr', async () => {
      const extServerHost = 'https://127.0.0.1:45653/'
      const desktopManager = {
        getExtServerHost: jest.fn(() => extServerHost),
        registerUpdateObserver: jest.fn(),
        syncComponentsInstallation: jest.fn(),
        notifyComponentActivation: jest.fn()
      };
      testSNApp.componentManager.setDesktopManager(desktopManager);

      await testSNApp.componentManager.registerComponentWindow(
        testComponent,
        iframe.contentWindow
      );
      expect(desktopManager.notifyComponentActivation).toBeCalledTimes(1);
      expect(desktopManager.notifyComponentActivation).toBeCalledWith(testComponent);
    });
  });

  test('isComponentActive() returns the active property from the component', () => {
    const isComponentActive = testSNApp.componentManager.isComponentActive(
      testComponent
    );
    expect(isComponentActive).toBe(testComponent.active);
  });

  describe('editorForNote()', () => {
    let testNote;
    let editorComponent;

    beforeEach(async () => {
      testNote = await createNoteItem(testSNApp, {
        title: 'Note 1'
      });
      editorComponent = await createComponentItem(
        testSNApp,
        testExtensionEditorPackage
      );
    });

    it('returns the explicit enabled editor for a note', async () => {
      await testSNApp.itemManager.changeComponent(
        editorComponent.uuid,
        (mutator) => {
          mutator.associateWithItem(testNote.uuid);
        }
      );

      const editorForNote = testSNApp.componentManager.editorForNote(
        testNote
      );
      expect(editorForNote.uuid).toBe(editorComponent.uuid);
    });

    test('if no editor for note found, return undefined', async () => {
      const editorForNote = testSNApp.componentManager.editorForNote(
        testNote
      );
      expect(editorForNote).toBeUndefined();
    });

    it('returns the default editor for note', async () => {
      await testSNApp.itemManager.changeComponent(
        editorComponent.uuid,
        (mutator) => {
          mutator.defaultEditor = true;
        }
      );

      const editorForNote = testSNApp.componentManager.editorForNote(
        testNote
      );
      expect(editorForNote.uuid).toBe(editorComponent.uuid);
    });

    test('on mobile, return default editor if plain editor is not prefered', async () => {
      testSNApp = await createApplication('test-application', Environment.Mobile, Platform.Android);
      testNote = await createNoteItem(testSNApp, {
        title: 'Note 1'
      });
      editorComponent = await createComponentItem(
        testSNApp,
        testExtensionEditorPackage
      );
      await testSNApp.itemManager.changeComponent(
        editorComponent.uuid,
        (mutator) => {
          mutator.isMobileDefault = true;
        }
      );

      const editorForNote = testSNApp.componentManager.editorForNote(
        testNote
      );
      expect(editorForNote.uuid).toBe(editorComponent.uuid);
    });
  });

  describe('getDefaultEditor()', () => {
    it('returns the first default editor', async () => {
      await testSNApp.itemManager.changeComponent(
        (testComponent as SNItem).uuid,
        (mutator) => {
          mutator.defaultEditor = true;
        }
      );

      const defaultEditor = testSNApp.componentManager.getDefaultEditor();
      expect(defaultEditor.uuid).toBe(
        (testComponent as SNItem).uuid
      );
    });

    it('returns the first default editor on mobile', async () => {
      testSNApp = await createApplication('test-application', Environment.Mobile, Platform.Android);
      const editorComponent = await createComponentItem(
        testSNApp,
        testExtensionEditorPackage
      );
      await testSNApp.itemManager.changeComponent(
        (editorComponent as SNItem).uuid,
        (mutator) => {
          mutator.isMobileDefault = true;
        }
      );

      const anotherEditorComponent = await createComponentItem(
        testSNApp,
        testExtensionEditorPackage
      );
      await testSNApp.itemManager.changeComponent(
        (anotherEditorComponent as SNItem).uuid,
        (mutator) => {
          mutator.defaultEditor = true;
        }
      );

      const defaultEditor = testSNApp.componentManager.getDefaultEditor();
      expect(defaultEditor.uuid).toBe(
        (editorComponent as SNItem).uuid
      );
    });
  });

  describe('permissionsStringForPermissions()', () => {
    test('StreamItems with a single content type', () => {
      const permissionString = testSNApp.componentManager.permissionsStringForPermissions(
        [
          {
            name: ComponentAction.StreamItems,
            content_types: [ContentType.Tag]
          }
        ],
        testComponent
      );
      expect(permissionString).toBe('tags.');
    });

    test('StreamItems with more than a content type', () => {
      const permissionString = testSNApp.componentManager.permissionsStringForPermissions(
        [
          {
            name: ComponentAction.StreamItems,
            content_types: [ContentType.Tag, ContentType.SmartTag]
          }
        ],
        testComponent
      );
      expect(permissionString).toBe('tags, smart tags.');
    });

    test('StreamContextItem returns "working note"', () => {
      const permissionString = testSNApp.componentManager.permissionsStringForPermissions(
        [
          {
            name: ComponentAction.StreamContextItem
          }
        ],
        testComponent
      );
      expect(permissionString).toBe('working note.');
    });

    test('a permission array with StreamItems with two content types and then StreamContextItem', () => {
      const permissionString = testSNApp.componentManager.permissionsStringForPermissions(
        [
          {
            name: ComponentAction.StreamItems,
            content_types: [ContentType.Tag, ContentType.SmartTag]
          },
          {
            name: ComponentAction.StreamContextItem
          }
        ],
        testComponent
      );
      expect(permissionString).toBe('tags, smart tags, working note.');
    });

    test('a permission array with StreamContextItem and then StreamItems with two content types', () => {
      const permissionString = testSNApp.componentManager.permissionsStringForPermissions(
        [
          {
            name: ComponentAction.StreamContextItem
          },
          {
            name: ComponentAction.StreamItems,
            content_types: [ContentType.Tag, ContentType.SmartTag]
          }
        ],
        testComponent
      );
      expect(permissionString).toBe('tags, smart tags, working note.');
    });

    test('an empty permission array returns "."', () => {
      const permissionString = testSNApp.componentManager.permissionsStringForPermissions(
        [],
        testComponent
      );
      expect(permissionString).toBe('.');
    });
  });
});
