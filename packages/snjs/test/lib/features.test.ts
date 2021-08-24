import * as Factory from '../factory';
import { ContentType, FillItemContent, SNApplication, SNComponent } from '@Lib/index';
import { Uuid } from '@Lib/uuid';
import { Features, FeatureIdentifier, Feature } from '@standardnotes/features';
import { UserFeaturesResponse } from '@Lib/services/api/responses';

describe('features', () => {
  let application: SNApplication;
  let midnightThemeFeature: Feature;
  let boldEditorFeature: Feature;

  beforeEach(async function () {
    application = await Factory.createInitAppWithRandNamespace();

    const now = new Date();
    const tomorrow = now.setDate(now.getDate() + 1);

    midnightThemeFeature = {
      ...Features.find(feature => feature.identifier === FeatureIdentifier.MidnightTheme) as Feature,
      expires_at: tomorrow,
    };
    boldEditorFeature = {
      ...Features.find(feature => feature.identifier === FeatureIdentifier.BoldEditor) as Feature,
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
    it('should fetch user features and create items for them', async () => {     
      expect(application.apiService.getUserFeatures).toHaveBeenCalledTimes(1); 
      expect(application.itemManager.createItem).toHaveBeenCalledTimes(2);
      const themeItems = application.getItems(ContentType.Theme);
      const editorItems = application.getItems(ContentType.Component);
      expect(themeItems).toHaveLength(1);
      expect(editorItems).toHaveLength(1);
      expect(themeItems[0].content).toMatchObject({
        identifier: midnightThemeFeature.identifier,
        name: midnightThemeFeature.name,
        hosted_url: midnightThemeFeature.url,
        url: midnightThemeFeature.url,
        package_info: midnightThemeFeature,
        valid_until: new Date(midnightThemeFeature.expires_at),
      });
      expect(editorItems[0].content).toMatchObject({
        identifier: boldEditorFeature.identifier,
        name: boldEditorFeature.name,
        hosted_url: boldEditorFeature.url,
        url: boldEditorFeature.url,
        area: boldEditorFeature.area,
        package_info: boldEditorFeature,
        valid_until: new Date(midnightThemeFeature.expires_at),
      });
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
      expect(themeItems[0].content).toMatchObject({
        identifier: midnightThemeFeature.identifier,
        name: midnightThemeFeature.name,
        hosted_url: midnightThemeFeature.url,
        url: midnightThemeFeature.url,
        package_info: midnightThemeFeature,
        valid_until: new Date(midnightThemeFeature.expires_at),
      });
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
});
