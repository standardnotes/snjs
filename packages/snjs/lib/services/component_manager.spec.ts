/**
 * @jest-environment jsdom
 */

import { SNPreferencesService } from './preferences_service';
import { FeatureDescription, FindNativeFeature } from '@standardnotes/features';
import { DesktopManagerInterface } from '@Services/component_manager/types';
import { FeatureIdentifier } from '@standardnotes/features';
import { ContentType } from '@standardnotes/common';
import { SNComponent } from '@Lib/models';
import { Environment, Platform } from '@Lib/platforms';
import { Runtime } from '@standardnotes/common';
import { SNAlertService } from '@Services/alert_service';
import { SNItem } from '@Models/core/item';
import { ItemManager } from '@Services/item_manager';
import { SNFeaturesService } from '@Services/features_service';
import { SNComponentManager } from './component_manager';
import { SNSyncService } from './sync/sync_service';

describe('featuresService', () => {
  let itemManager: ItemManager;
  let featureService: SNFeaturesService;
  let alertService: SNAlertService;
  let syncService: SNSyncService;
  let prefsService: SNPreferencesService;

  const desktopExtHost = 'http://localhost:123';

  const createManager = (environment: Environment, platform: Platform) => {
    const desktopManager: DesktopManagerInterface = {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      syncComponentsInstallation() {},
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      registerUpdateObserver() {},
      getExtServerHost() {
        return desktopExtHost;
      },
    };

    const manager = new SNComponentManager(
      itemManager,
      syncService,
      featureService,
      prefsService,
      alertService,
      environment,
      platform,
      Runtime.Prod
    );
    manager.setDesktopManager(desktopManager);
    manager.configureForNonMobileUsage = jest.fn().mockReturnValue(0);
    return manager;
  };

  beforeEach(() => {
    syncService = {} as jest.Mocked<SNSyncService>;
    syncService.sync = jest.fn();

    itemManager = {} as jest.Mocked<ItemManager>;
    itemManager.getItems = jest.fn().mockReturnValue([]);
    itemManager.createItem = jest.fn();
    itemManager.changeComponent = jest
      .fn()
      .mockReturnValue({} as jest.Mocked<SNItem>);
    itemManager.setItemsToBeDeleted = jest.fn();
    itemManager.addObserver = jest.fn();
    itemManager.changeItem = jest.fn();
    itemManager.changeFeatureRepo = jest.fn();

    featureService = {} as jest.Mocked<SNFeaturesService>;

    prefsService = {} as jest.Mocked<SNPreferencesService>;

    alertService = {} as jest.Mocked<SNAlertService>;
    alertService.confirm = jest.fn();
    alertService.alert = jest.fn();
  });

  const nativeComponent = (file_type?: FeatureDescription['file_type']) => {
    return new SNComponent({
      uuid: '789',
      content_type: ContentType.Component,
      safeContent: {
        package_info: {
          hosted_url: 'https://example.com/component',
          identifier: FeatureIdentifier.BoldEditor,
          file_type: file_type ?? 'html',
          valid_until: new Date(),
        },
      },
    } as never);
  };

  const deprecatedComponent = () => {
    return new SNComponent({
      uuid: '789',
      content_type: ContentType.Component,
      safeContent: {
        package_info: {
          hosted_url: 'https://example.com/component',
          identifier: FeatureIdentifier.DeprecatedFileSafe,
          valid_until: new Date(),
        },
      },
    } as never);
  };

  const thirdPartyComponent = () => {
    return new SNComponent({
      uuid: '789',
      content_type: ContentType.Component,
      safeContent: {
        local_url: 'sn://Extensions/non-native-identifier/dist/index.html',
        hosted_url: 'https://example.com/component',
        package_info: {
          identifier: 'non-native-identifier',
          valid_until: new Date(),
        },
      },
    } as never);
  };

  describe('urlForComponent', () => {
    describe('desktop', () => {
      it('returns native path for native component', () => {
        const manager = createManager(Environment.Desktop, Platform.MacDesktop);
        const component = nativeComponent();
        const url = manager.urlForComponent(component);
        const feature = FindNativeFeature(component.identifier);
        expect(url).toEqual(
          `${desktopExtHost}/components/${feature?.identifier}/${feature?.index_path}`
        );
      });

      it('returns native path for deprecated native component', () => {
        const manager = createManager(Environment.Desktop, Platform.MacDesktop);
        const component = deprecatedComponent();
        const url = manager.urlForComponent(component);
        const feature = FindNativeFeature(component.identifier);
        expect(url).toEqual(
          `${desktopExtHost}/components/${feature?.identifier}/${feature?.index_path}`
        );
      });

      it('returns nonnative path for third party component', () => {
        const manager = createManager(Environment.Desktop, Platform.MacDesktop);
        const component = thirdPartyComponent();
        const url = manager.urlForComponent(component);
        expect(url).toEqual(
          `${desktopExtHost}/Extensions/${component.identifier}/dist/index.html`
        );
      });

      it('returns hosted url for third party component with no local_url', () => {
        const manager = createManager(Environment.Desktop, Platform.MacDesktop);
        const component = new SNComponent({
          uuid: '789',
          content_type: ContentType.Component,
          safeContent: {
            hosted_url: 'https://example.com/component',
            package_info: {
              identifier: 'non-native-identifier',
              valid_until: new Date(),
            },
          },
        } as never);
        const url = manager.urlForComponent(component);
        expect(url).toEqual('https://example.com/component');
      });
    });

    describe('web', () => {
      it('returns native path for native component', () => {
        const manager = createManager(Environment.Web, Platform.MacWeb);
        const component = nativeComponent();
        const url = manager.urlForComponent(component);
        const feature = FindNativeFeature(
          component.identifier
        ) as FeatureDescription;
        expect(url).toEqual(
          `http://localhost/components/${component.identifier}/${feature.index_path}`
        );
      });

      it('returns hosted path for third party component', () => {
        const manager = createManager(Environment.Web, Platform.MacWeb);
        const component = thirdPartyComponent();
        const url = manager.urlForComponent(component);
        expect(url).toEqual(component.hosted_url);
      });
    });
  });

  describe('editor change alert', () => {
    it('should not require alert switching from plain editor', () => {
      const manager = createManager(Environment.Web, Platform.MacWeb);
      const component = nativeComponent();
      const requiresAlert = manager.doesEditorChangeRequireAlert(
        undefined,
        component
      );
      expect(requiresAlert).toBe(false);
    });

    it('should not require alert switching to plain editor', () => {
      const manager = createManager(Environment.Web, Platform.MacWeb);
      const component = nativeComponent();
      const requiresAlert = manager.doesEditorChangeRequireAlert(
        component,
        undefined
      );
      expect(requiresAlert).toBe(false);
    });

    it('should not require alert switching from a markdown editor', () => {
      const manager = createManager(Environment.Web, Platform.MacWeb);
      const htmlEditor = nativeComponent();
      const markdownEditor = nativeComponent('md');
      const requiresAlert = manager.doesEditorChangeRequireAlert(
        markdownEditor,
        htmlEditor
      );
      expect(requiresAlert).toBe(false);
    });

    it('should not require alert switching to a markdown editor', () => {
      const manager = createManager(Environment.Web, Platform.MacWeb);
      const htmlEditor = nativeComponent();
      const markdownEditor = nativeComponent('md');
      const requiresAlert = manager.doesEditorChangeRequireAlert(
        htmlEditor,
        markdownEditor
      );
      expect(requiresAlert).toBe(false);
    });

    it('should not require alert switching from & to a html editor', () => {
      const manager = createManager(Environment.Web, Platform.MacWeb);
      const htmlEditor = nativeComponent();
      const requiresAlert = manager.doesEditorChangeRequireAlert(
        htmlEditor,
        htmlEditor
      );
      expect(requiresAlert).toBe(false);
    });

    it('should require alert switching from a html editor to custom editor', () => {
      const manager = createManager(Environment.Web, Platform.MacWeb);
      const htmlEditor = nativeComponent();
      const customEditor = nativeComponent('json');
      const requiresAlert = manager.doesEditorChangeRequireAlert(
        htmlEditor,
        customEditor
      );
      expect(requiresAlert).toBe(true);
    });

    it('should require alert switching from a custom editor to html editor', () => {
      const manager = createManager(Environment.Web, Platform.MacWeb);
      const htmlEditor = nativeComponent();
      const customEditor = nativeComponent('json');
      const requiresAlert = manager.doesEditorChangeRequireAlert(
        customEditor,
        htmlEditor
      );
      expect(requiresAlert).toBe(true);
    });

    it('should require alert switching from a custom editor to custom editor', () => {
      const manager = createManager(Environment.Web, Platform.MacWeb);
      const customEditor = nativeComponent('json');
      const requiresAlert = manager.doesEditorChangeRequireAlert(
        customEditor,
        customEditor
      );
      expect(requiresAlert).toBe(true);
    });
  });
});
