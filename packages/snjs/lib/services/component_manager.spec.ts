/**
 * @jest-environment jsdom
 */

import { FeatureDescription } from '@standardnotes/features';
import { DesktopManagerInterface } from '@Services/component_manager/types';
import { FeatureIdentifier } from '@standardnotes/features';
import { ContentType } from '@Models/content_types';
import { SNComponent } from '@Lib/models';
import { Environment, Platform } from '@Lib/platforms';
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
      alertService,
      environment,
      platform,
      (func: () => void) => {
        func();
      }
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

    alertService = {} as jest.Mocked<SNAlertService>;
    alertService.confirm = jest.fn();
    alertService.alert = jest.fn();
  });

  const nativeComponent = () => {
    return new SNComponent({
      uuid: '789',
      content_type: ContentType.Component,
      safeContent: {
        package_info: {
          hosted_url: 'https://example.com/component',
          identifier: FeatureIdentifier.BoldEditor,
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
        const feature = manager.nativeFeatureForComponent(component);
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
        const feature = manager.nativeFeatureForComponent(
          component
        ) as FeatureDescription;
        expect(url).toEqual(
          `public/components/${component.identifier}/${feature.index_path}`
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
});
