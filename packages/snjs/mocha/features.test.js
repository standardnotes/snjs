import * as Factory from './lib/factory.js';
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('features', () => {
  let application;
  let midnightThemeFeature;
  let boldEditorFeature;
  let tagNestingFeature;
  let getUserFeatures;

  beforeEach(async function () {
    application = await Factory.createInitAppWithRandNamespace();

    const now = new Date();
    const tomorrow = now.setDate(now.getDate() + 1);

    midnightThemeFeature = {
      ...Features.find(feature => feature.identifier === FeatureIdentifier.MidnightTheme),
      expires_at: tomorrow,
    };
    boldEditorFeature = {
      ...Features.find(feature => feature.identifier === FeatureIdentifier.BoldEditor),
      expires_at: tomorrow,
    };
    tagNestingFeature = {
      ...Features.find(feature => feature.identifier === FeatureIdentifier.TagNesting),
      expires_at: tomorrow,
    };

    sinon.spy(application.itemManager, 'createItem');
    sinon.spy(application.itemManager, 'changeComponent');
    sinon.spy(application.itemManager, 'setItemsToBeDeleted');
    sinon.spy(application.componentManager, 'setReadonlyStateForComponent');
    getUserFeatures = sinon.stub(application.apiService, 'getUserFeatures').callsFake(() => {
      return Promise.resolve({
        data: {
          features: [
            midnightThemeFeature,
            boldEditorFeature,
            tagNestingFeature,
          ],
        },
      });
    });

    const email = Uuid.GenerateUuidSynchronously();
    const password = Uuid.GenerateUuidSynchronously();

    await Factory.registerUserToApplication({
      application: application,
      email: email,
      password: password,
    });
  });

  afterEach(async function () {
    Factory.safeDeinit(application);
    sinon.restore();
  });

  describe('new user roles received on api response meta', () => {
    it('should save roles and features', async () => {
      expect(application.featuresService.roles).to.have.lengthOf(1);
      expect(application.featuresService.roles[0]).to.equal(RoleName.BasicUser);

      expect(application.featuresService.features).to.have.lengthOf(3);
      expect(application.featuresService.features[0]).to.equal(midnightThemeFeature);
      expect(application.featuresService.features[1]).to.equal(boldEditorFeature);

      const storedRoles = await application.getValue(StorageKey.UserRoles);

      expect(storedRoles).to.have.lengthOf(1);
      expect(storedRoles[0]).to.equal(RoleName.BasicUser);

      const storedFeatures = await application.getValue(StorageKey.UserFeatures);

      expect(storedFeatures).to.have.lengthOf(3);
      expect(storedFeatures[0]).to.equal(midnightThemeFeature);
      expect(storedFeatures[1]).to.equal(boldEditorFeature);
      expect(storedFeatures[2]).to.equal(tagNestingFeature);
    });

    it('should fetch user features and create items for features with content type', async () => {
      expect(application.apiService.getUserFeatures.callCount).to.equal(1);
      expect(application.itemManager.createItem.callCount).to.equal(2);
      const themeItems = application.getItems(ContentType.Theme);
      const editorItems = application.getItems(ContentType.Component);
      expect(themeItems).to.have.lengthOf(1);
      expect(editorItems).to.have.lengthOf(1);
      expect(themeItems[0].content).to.containSubset(
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
      expect(editorItems[0].content).to.containSubset(
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
      expect(application.itemManager.changeComponent.callCount).to.equal(1);
      const themeItems = application.getItems(ContentType.Theme);
      expect(themeItems).to.have.lengthOf(1);
      expect(themeItems[0].content).to.containSubset(
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

      getUserFeatures.restore();
      sinon.stub(application.apiService, 'getUserFeatures').callsFake(() => {
        return Promise.resolve({
          data: {
            features: [
              {
                ...boldEditorFeature,
                expires_at: yesterday,
              },
            ],
          },
        });
      });

      // Wipe roles from initial sync
      await application.featuresService.setRoles([]);
      // Call sync intentionally to get roles again in meta
      await application.sync();
      // Timeout since we don't await for features update
      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(application.componentManager.setReadonlyStateForComponent.callCount).to.equal(1);
      const editorItems = application.getItems(ContentType.Component);
      expect(application.componentManager.getReadonlyStateForComponent(editorItems[0]).readonly).to.equal(true);
    });

  it('should delete theme item if feature has expired', async () => {
      const now = new Date();
      const yesterday = now.setDate(now.getDate() - 1);

      getUserFeatures.restore();
      sinon.stub(application.apiService, 'getUserFeatures').callsFake(() => {
        return Promise.resolve({
          data: {
            features: [
              {
                ...midnightThemeFeature,
                expires_at: yesterday,
              },
            ],
          },
        });
      });

      const themeItemUuid = application.getItems(ContentType.Theme)[0].uuid;

      // Wipe roles from initial sync
      await application.featuresService.setRoles([]);
      // Call sync intentionally to get roles again in meta
      await application.sync();
      // Timeout since we don't await for features update
      await new Promise(resolve => setTimeout(resolve, 1000));
      expect(application.itemManager.setItemsToBeDeleted.calledWith([themeItemUuid])).to.be.ok;

      const themeItem = application.getItems(ContentType.Theme)[0];
      expect(themeItem.deleted).to.equal(true);
    });
  });

  it('should provide feature', async ()=>{
    const feature = application.getFeature(FeatureIdentifier.BoldEditor);
    expect(feature).to.equal(boldEditorFeature);
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
      expect(await application.getSensitiveSetting(SettingName.ExtensionKey)).to.equal(true);
    });
  });
});
