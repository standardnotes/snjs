import * as Factory from '../factory';
import { ContentType, FillItemContent, SNApplication, SNComponent, StorageKey } from '@Lib/index';
import { Uuid } from '@Lib/uuid';
import { Features, FeatureIdentifier, FeatureDescription } from '@standardnotes/features';
import { UserFeaturesResponse } from '@Lib/services/api/responses';
import { SettingName } from '@standardnotes/settings';
import { RoleName } from '@standardnotes/auth';

describe('features', () => {
  let application: SNApplication;
  let midnightThemeFeature: FeatureDescription;
  let boldEditorFeature: FeatureDescription;
  let tagNestingFeature: FeatureDescription;

  beforeEach(async function () {
    application = await Factory.createInitAppWithRandNamespace();

    const now = new Date();
    const tomorrow = now.setDate(now.getDate() + 1);

    midnightThemeFeature = {
      ...Features.find(feature => feature.identifier === FeatureIdentifier.MidnightTheme) as FeatureDescription,
      expires_at: tomorrow,
    };
    boldEditorFeature = {
      ...Features.find(feature => feature.identifier === FeatureIdentifier.BoldEditor) as FeatureDescription,
      expires_at: tomorrow,
    };
    tagNestingFeature = {
      ...Features.find(feature => feature.identifier === FeatureIdentifier.TagNesting) as FeatureDescription,
      expires_at: tomorrow,
    };

    jest.spyOn(application.itemManager, 'createItem');
    jest.spyOn(application.itemManager, 'changeComponent');
    jest.spyOn(application.itemManager, 'setItemsToBeDeleted');
    jest.spyOn(application.componentManager, 'setReadonlyStateForComponent');
    jest.spyOn(application.apiService, 'getUserFeatures').mockImplementation(() => {
      return Promise.resolve({
        data: {
          features: [
            midnightThemeFeature,
            boldEditorFeature,
            tagNestingFeature,
          ],
        },
      }) as Promise<UserFeaturesResponse>;      
    });

    const email = Uuid.GenerateUuidSynchronously();
    const password = Uuid.GenerateUuidSynchronously();

    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
    });
  });

  afterEach(function () {
    Factory.safeDeinit(application);
    jest.restoreAllMocks();
  });

  describe('new user roles received on api response meta', () => {
    it('should save roles and features', async () => {
      expect(application.featuresService.roles).toHaveLength(1);
      expect(application.featuresService.roles[0]).toBe(RoleName.BasicUser);

      expect(application.featuresService.features).toHaveLength(3);
      expect(application.featuresService.features[0]).toBe(midnightThemeFeature);
      expect(application.featuresService.features[1]).toBe(boldEditorFeature);
      
      const storedRoles = await application.getValue(StorageKey.UserRoles);

      expect(storedRoles).toHaveLength(1);
      expect(storedRoles[0]).toBe(RoleName.BasicUser);

      const storedFeatures = await application.getValue(StorageKey.UserFeatures);

      expect(storedFeatures).toHaveLength(3);
      expect(storedFeatures[0]).toBe(midnightThemeFeature);
      expect(storedFeatures[1]).toBe(boldEditorFeature);
      expect(storedFeatures[2]).toBe(tagNestingFeature);
    });

    it('should fetch user features and create items for features with content type', async () => {     
      expect(application.apiService.getUserFeatures).toHaveBeenCalledTimes(1); 
      expect(application.itemManager.createItem).toHaveBeenCalledTimes(2);
      const themeItems = application.getItems(ContentType.Theme);
      const editorItems = application.getItems(ContentType.Component);
      expect(themeItems).toHaveLength(1);
      expect(editorItems).toHaveLength(1);
      expect(themeItems[0].content).toMatchObject(
        JSON.parse(
          JSON.stringify({
            identifier: midnightThemeFeature.identifier,
            name: midnightThemeFeature.name,
            hosted_url: midnightThemeFeature.url,
            url: midnightThemeFeature.url,
            package_info: midnightThemeFeature,
            valid_until: new Date(midnightThemeFeature.expires_at),
          })
        )
      );
      expect(editorItems[0].content).toMatchObject(
        JSON.parse(
          JSON.stringify({
            identifier: boldEditorFeature.identifier,
            name: boldEditorFeature.name,
            hosted_url: boldEditorFeature.url,
            url: boldEditorFeature.url,
            area: boldEditorFeature.area,
            package_info: boldEditorFeature,
            valid_until: new Date(midnightThemeFeature.expires_at),
          })
        )
      );
    });

    it('should update content for existing feature items', async () => {
      // Wipe items from initial sync
      await application.itemManager.removeAllItemsFromMemory();
      // Wipe roles from initial sync
      await application.featuresService.setRoles([]);
      // Create pre-existing item for theme without all the info
      await application.itemManager.createItem(ContentType.Theme, FillItemContent({
        package_info: {
          identifier: FeatureIdentifier.MidnightTheme,
        },
      }));
      // Call sync intentionally to get roles again in meta
      await application.sync();
      // Timeout since we don't await for features update
      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(application.itemManager.changeComponent).toHaveBeenCalledTimes(1);
      const themeItems = application.getItems(ContentType.Theme);
      expect(themeItems).toHaveLength(1);
      expect(themeItems[0].content).toMatchObject(
        JSON.parse(
          JSON.stringify({
            identifier: midnightThemeFeature.identifier,
            name: midnightThemeFeature.name,
            hosted_url: midnightThemeFeature.url,
            url: midnightThemeFeature.url,
            package_info: midnightThemeFeature,
            valid_until: new Date(midnightThemeFeature.expires_at),
          })
        )
      );
    });

    it('should set component to read only if feature has expired', async () => {
      const now = new Date();
      const yesterday = now.setDate(now.getDate() - 1);

      jest.spyOn(application.apiService, 'getUserFeatures').mockImplementation(() => {
        return Promise.resolve({
          data: {
            features: [
              {
                ...boldEditorFeature,
                expires_at: yesterday,
              }, 
            ],
          },
        }) as Promise<UserFeaturesResponse>;
      });

      // Wipe roles from initial sync
      await application.featuresService.setRoles([]);
      // Call sync intentionally to get roles again in meta
      await application.sync();
      // Timeout since we don't await for features update
      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(application.componentManager.setReadonlyStateForComponent).toHaveBeenCalledTimes(1);
      const editorItems = application.getItems(ContentType.Component);
      expect(application.componentManager.getReadonlyStateForComponent(editorItems[0] as SNComponent).readonly).toBe(true);
    });

  it('should delete theme item if feature has expired', async () => {
      const now = new Date();
      const yesterday = now.setDate(now.getDate() - 1);

      jest.spyOn(application.apiService, 'getUserFeatures').mockImplementation(() => {
        return Promise.resolve({
          data: {
            features: [
              {
                ...midnightThemeFeature,
                expires_at: yesterday,
              }, 
            ],
          },
        }) as Promise<UserFeaturesResponse>;
      });

      const themeItemUuid = application.getItems(ContentType.Theme)[0].uuid;

      // Wipe roles from initial sync
      await application.featuresService.setRoles([]);
      // Call sync intentionally to get roles again in meta
      await application.sync();
      // Timeout since we don't await for features update
      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(application.itemManager.setItemsToBeDeleted).toHaveBeenCalledWith([themeItemUuid]);

      const themeItem = application.getItems(ContentType.Theme)[0];
      expect(themeItem.deleted).toBe(true);
    });
  });

  it('should provide feature', async ()=>{
    const feature = application.getFeature(FeatureIdentifier.BoldEditor);
    expect(feature).toEqual(boldEditorFeature);
  });

  describe('extension repo items observer', () => {
    it('should update extension key user setting when extension repo is added', async () => {
      const extensionKey = Uuid.GenerateUuidSynchronously().split('-').join('');
      await application.itemManager.createItem(ContentType.ExtensionRepo, FillItemContent({
        package_info: {
          url: `extensions.standardnotes.org/${extensionKey}`,
        },
      }));
      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(await application.getSensitiveSetting(SettingName.ExtensionKey)).toBe(true);
    });
  });
});
