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
  registerComponent,
  registerComponentHandler,
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
      const componentIframe = document.createElement('iframe');
      await registerComponent(testSNApp, componentIframe.contentWindow, testComponent);

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
      const componentIframe = document.createElement('iframe');
      await registerComponent(testSNApp, componentIframe.contentWindow, testComponent);

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
      await sleep(0.001);

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
  });
});
