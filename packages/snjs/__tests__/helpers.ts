import {
  ComponentAction,
  ComponentArea,
  ContentType,
  SNApplication,
  SNComponent,
  SNItem,
  SNNote,
  SNTag
} from './../lib';
import { Uuid } from './../lib/uuid'

export const htmlTemplate = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8">
    </head>
    <body>
      <div id="root"></div>
    </body>
  </html>`;

export const testExtensionEditorPackage = {
  identifier: "test.standardnotes.my-test-extension",
  name: "My Test Extension",
  content_type: "SN|Component",
  area: "editor-editor",
  version: "1.0.0",
  url: "http://localhost"
};

export const testExtensionForTagsPackage = {
  identifier: "test.standardnotes.my-test-tags-extension",
  name: "My Test Tags Extension",
  content_type: "SN|Component",
  area: "note-tags",
  version: "1.0.0",
  url: "http://localhost"
};

export const testThemeDefaultPackage = {
  identifier: "test.standardnotes.default-theme",
  name: "Default Theme",
  content_type: "SN|Theme",
  area: "themes",
  version: "1.0.0",
  url: "http://localhost/themes/default-theme"
};

export const testThemeDarkPackage = {
  identifier: "test.standardnotes.dark-theme",
  name: "Dark Theme",
  content_type: "SN|Theme",
  area: "themes",
  version: "1.0.0",
  url: "http://localhost/themes/dark-theme"
};

export const getTestNoteItem = ({ title = 'Hello', text = 'World', dirty = true } = {}) => {
  return {
    uuid: Uuid.GenerateUuidSynchronously(),
    content_type: ContentType.Note,
    dirty,
    content: {
      title,
      text,
      references: []
    },
    references: []
  };
};

const copyObject = (object: any) => {
  const objectStr = JSON.stringify(object);
  return JSON.parse(objectStr);
};

export const getRawTestComponentItem = (componentPackage: any) => {
  const today = new Date();
  componentPackage = copyObject(componentPackage);
  return {
    content_type: componentPackage.content_type,
    content: {
      uuid: Uuid.GenerateUuidSynchronously(),
      identifier: componentPackage.identifier,
      componentData: {
        foo: "bar"
      },
      name: componentPackage.name,
      hosted_url: componentPackage.url,
      url: componentPackage.url,
      area: componentPackage.area,
      package_info: componentPackage,
      valid_until: new Date(today.setFullYear(today.getFullYear() + 5)),
      references: []
    }
  };
};

export const sleep = async (seconds: number) => {
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
};

/**
 * A short amount of time to wait for messages to propagate via the postMessage API.
 */
export const SHORT_DELAY_TIME = 0.05;

export const registerComponent = async (
  application: SNApplication,
  targetWindow: Window,
  component: SNComponent
) => {
  application.componentManager.registerComponentWindow(
    component,
    targetWindow
  );

  /**
   * componentManager.registerComponentWindow() calls targetWindow.parent.postMesasge()
   * We need to make sure that the event is dispatched properly by waiting a few ms.
   * See https://github.com/jsdom/jsdom/issues/2245#issuecomment-392556153
   */
  await sleep(SHORT_DELAY_TIME);
};

export const createNoteItem = async (
  application: SNApplication,
  overrides = {},
  needsSync = false
) => {
  const testNoteItem = getTestNoteItem(overrides);
  return await application.createManagedItem(
    testNoteItem.content_type as ContentType,
    {
      ...testNoteItem.content
    },
    needsSync
  ) as SNNote;
};

export const createTagItem = async (
  application: SNApplication,
  title: string
) => {
  return await application.createManagedItem(
    ContentType.Tag,
    {
      title,
      references: []
    },
    false
  ) as SNTag;
};

export const createComponentItem = async (
  application: SNApplication,
  componentPackage: any,
  overrides = {}
) => {
  const rawTestComponentItem = getRawTestComponentItem(componentPackage);
  return await application.createManagedItem(
    rawTestComponentItem.content_type as ContentType,
    {
      ...rawTestComponentItem.content,
      ...overrides
    },
    false
  ) as SNComponent;
};

export const registerComponentHandler = (
  application: SNApplication,
  areas: ComponentArea[],
  itemInContext?: SNItem,
  customActionHandler?: (currentComponent: SNComponent, action: ComponentAction, data: any) => void,
  componentForSessionKeyHandler?: (sessionKey: string) => SNComponent
) => {
  application.componentManager.registerHandler({
    identifier: 'generic-view-' + Math.random(),
    areas,
    actionHandler: (currentComponent, action, data) => {
      customActionHandler && customActionHandler(currentComponent, action, data);
    },
    contextRequestHandler: () => itemInContext,
    componentForSessionKeyHandler
  });
};
