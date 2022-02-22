import { SNPreferencesService } from './preferences_service';
import { FindNativeFeature } from '@standardnotes/features';
import { SNFeaturesService } from '@Services/features_service';
import { ComponentMutator } from '@Models/app/component';
import { displayStringForContentType } from '@Models/content_types';
import { ContentType, Runtime } from '@standardnotes/common';
import { PayloadSource } from '@Protocol/payloads/sources';
import { ItemManager } from '@Services/item_manager';
import { SNNote } from '@Models/app/note';
import { SNTheme } from '@Models/app/theme';
import { SNItem } from '@Models/core/item';
import { SNAlertService } from '@Services/alert_service';
import { SNSyncService } from '@Services/sync/sync_service';
import find from 'lodash/find';
import uniq from 'lodash/uniq';
import { ComponentArea, SNComponent } from '@Models/app/component';
import { ComponentAction, ComponentPermission } from '@standardnotes/features';
import {
  Copy,
  concatArrays,
  filterFromArray,
  removeFromArray,
  sleep,
} from '@standardnotes/utils';
import { Environment, Platform } from '@Lib/platforms';
import { UuidString } from '@Lib/types';
import {
  PermissionDialog,
  DesktopManagerInterface,
  AllowedBatchPermissions,
} from '@Services/component_manager/types';
import {
  ActionObserver,
  ComponentViewer,
} from '@Services/component_manager/component_viewer';
import { AbstractService } from '@standardnotes/services';

const DESKTOP_URL_PREFIX = 'sn://';
const LOCAL_HOST = 'localhost';
const CUSTOM_LOCAL_HOST = 'sn.local';
const ANDROID_LOCAL_HOST = '10.0.2.2';

export const enum ComponentManagerEvent {
  ViewerDidFocus = 'ViewerDidFocus',
}

export type EventData = {
  componentViewer?: ComponentViewer;
};

/**
 * Responsible for orchestrating component functionality, including editors, themes,
 * and other components. The component manager primarily deals with iframes, and orchestrates
 * sending and receiving messages to and from frames via the postMessage API.
 */
export class SNComponentManager extends AbstractService<
  ComponentManagerEvent,
  EventData
> {
  private desktopManager?: DesktopManagerInterface;
  private viewers: ComponentViewer[] = [];
  private removeItemObserver!: () => void;
  private permissionDialogs: PermissionDialog[] = [];

  constructor(
    private itemManager: ItemManager,
    private syncService: SNSyncService,
    private featuresService: SNFeaturesService,
    private preferencesSerivce: SNPreferencesService,
    protected alertService: SNAlertService,
    private environment: Environment,
    private platform: Platform,
    private runtime: Runtime
  ) {
    super();
    this.loggingEnabled = false;
    this.addItemObserver();
    if (environment !== Environment.Mobile) {
      this.configureForNonMobileUsage();
    }
  }

  get isDesktop(): boolean {
    return this.environment === Environment.Desktop;
  }

  get isMobile(): boolean {
    return this.environment === Environment.Mobile;
  }

  get components(): SNComponent[] {
    return this.itemManager.components;
  }

  componentsForArea(area: ComponentArea): SNComponent[] {
    return this.components.filter((component) => {
      return component.area === area;
    });
  }

  /** @override */
  deinit(): void {
    super.deinit();
    for (const viewer of this.viewers) {
      viewer.destroy();
    }
    this.viewers.length = 0;
    this.permissionDialogs.length = 0;
    this.desktopManager = undefined;
    (this.itemManager as unknown) = undefined;
    (this.syncService as unknown) = undefined;
    (this.alertService as unknown) = undefined;
    (this.preferencesSerivce as unknown) = undefined;
    this.removeItemObserver();
    (this.removeItemObserver as unknown) = undefined;
    if (window && !this.isMobile) {
      window.removeEventListener('focus', this.detectFocusChange, true);
      window.removeEventListener('blur', this.detectFocusChange, true);
      window.removeEventListener('message', this.onWindowMessage);
    }
  }

  public createComponentViewer(
    component: SNComponent,
    contextItem?: UuidString,
    actionObserver?: ActionObserver,
    urlOverride?: string
  ): ComponentViewer {
    const viewer = new ComponentViewer(
      component,
      this.itemManager,
      this.syncService,
      this.alertService,
      this.preferencesSerivce,
      this.featuresService,
      this.environment,
      this.platform,
      this.runtime,
      {
        runWithPermissions: this.runWithPermissions.bind(this),
        urlsForActiveThemes: this.urlsForActiveThemes.bind(this),
      },
      urlOverride || this.urlForComponent(component),
      contextItem,
      actionObserver
    );
    this.viewers.push(viewer);
    return viewer;
  }

  public destroyComponentViewer(viewer: ComponentViewer): void {
    viewer.destroy();
    removeFromArray(this.viewers, viewer);
  }

  setDesktopManager(desktopManager: DesktopManagerInterface): void {
    this.desktopManager = desktopManager;
    this.configureForDesktop();
  }

  handleChangedComponents(
    components: SNComponent[],
    source: PayloadSource
  ): void {
    const acceptableSources = [
      PayloadSource.LocalChanged,
      PayloadSource.RemoteRetrieved,
      PayloadSource.LocalRetrieved,
      PayloadSource.Constructor,
    ];
    if (components.length === 0 || !acceptableSources.includes(source)) {
      return;
    }

    if (this.isDesktop) {
      const thirdPartyComponents = components.filter((component) => {
        const nativeFeature = FindNativeFeature(component.identifier);
        return nativeFeature ? false : true;
      });
      if (thirdPartyComponents.length > 0) {
        this.desktopManager?.syncComponentsInstallation(thirdPartyComponents);
      }
    }

    const themes = components.filter((c) => c.isTheme());
    if (themes.length > 0) {
      this.postActiveThemesToAllViewers();
    }
  }

  addItemObserver(): void {
    this.removeItemObserver = this.itemManager.addObserver(
      ContentType.Any,
      (changed, inserted, discarded, _ignored, source) => {
        const items = concatArrays(changed, inserted, discarded) as SNItem[];
        const syncedComponents = items.filter((item) => {
          return (
            item.content_type === ContentType.Component ||
            item.content_type === ContentType.Theme
          );
        }) as SNComponent[];
        this.handleChangedComponents(syncedComponents, source);
      }
    );
  }

  detectFocusChange = (): void => {
    const activeIframes = this.allComponentIframes();
    for (const iframe of activeIframes) {
      if (document.activeElement === iframe) {
        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const viewer = this.findComponentViewer(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            iframe.dataset.componentViewerId!
          )!;
          this.notifyEvent(ComponentManagerEvent.ViewerDidFocus, {
            componentViewer: viewer,
          });
        });
        return;
      }
    }
  };

  onWindowMessage = (event: MessageEvent): void => {
    /** Make sure this message is for us */
    if (event.data.sessionKey) {
      this.log('Component manager received message', event.data);
      this.componentViewerForSessionKey(event.data.sessionKey)?.handleMessage(
        event.data
      );
    }
  };

  configureForNonMobileUsage(): void {
    window.addEventListener
      ? window.addEventListener('focus', this.detectFocusChange, true)
      : (window as any).attachEvent('onfocusout', this.detectFocusChange);
    window.addEventListener
      ? window.addEventListener('blur', this.detectFocusChange, true)
      : (window as any).attachEvent('onblur', this.detectFocusChange);

    /* On mobile, events listeners are handled by a respective component */
    window.addEventListener('message', this.onWindowMessage);
  }

  configureForDesktop(): void {
    this.desktopManager?.registerUpdateObserver((component: SNComponent) => {
      /* Reload theme if active */
      if (component.active && component.isTheme()) {
        this.postActiveThemesToAllViewers();
      }
    });
  }

  postActiveThemesToAllViewers(): void {
    for (const viewer of this.viewers) {
      viewer.postActiveThemes();
    }
  }

  getActiveThemes(): SNTheme[] {
    if (this.environment === Environment.Mobile) {
      throw Error('getActiveThemes must be handled separately by mobile');
    }
    return this.componentsForArea(ComponentArea.Themes).filter((theme) => {
      return theme.active;
    }) as SNTheme[];
  }

  urlForComponent(component: SNComponent): string | undefined {
    /* offlineOnly is available only on desktop, and not on web or mobile. */
    if (component.offlineOnly && !this.isDesktop) {
      return undefined;
    }

    const nativeFeature = FindNativeFeature(component.identifier);

    if (this.isDesktop) {
      if (nativeFeature) {
        return `${this.desktopManager!.getExtServerHost()}/components/${
          component.identifier
        }/${nativeFeature.index_path}`;
      } else if (component.local_url) {
        return component.local_url.replace(
          DESKTOP_URL_PREFIX,
          this.desktopManager!.getExtServerHost() + '/'
        );
      } else {
        return component.hosted_url || component.legacy_url;
      }
    }

    const isWeb = this.environment === Environment.Web;
    if (nativeFeature) {
      if (!isWeb) {
        throw Error(
          'Mobile must override urlForComponent to handle native paths'
        );
      }
      return `${window.location.origin}/components/${component.identifier}/${nativeFeature.index_path}`;
    }

    let url = component.hosted_url || component.legacy_url;
    if (!url) {
      return undefined;
    }
    if (this.isMobile) {
      const localReplacement =
        this.platform === Platform.Ios ? LOCAL_HOST : ANDROID_LOCAL_HOST;
      url = url
        .replace(LOCAL_HOST, localReplacement)
        .replace(CUSTOM_LOCAL_HOST, localReplacement);
    }
    return url;
  }

  urlsForActiveThemes(): string[] {
    const themes = this.getActiveThemes();
    const urls = [];
    for (const theme of themes) {
      const url = this.urlForComponent(theme);
      if (url) {
        urls.push(url);
      }
    }
    return urls;
  }

  private findComponent(uuid: UuidString) {
    return this.itemManager.findItem(uuid) as SNComponent;
  }

  findComponentViewer(identifier: string): ComponentViewer | undefined {
    return this.viewers.find((viewer) => viewer.identifier === identifier);
  }

  componentViewerForSessionKey(key: string): ComponentViewer | undefined {
    return this.viewers.find((viewer) => viewer.sessionKey === key);
  }

  private areRequestedPermissionsValid(
    permissions: ComponentPermission[]
  ): boolean {
    for (const permission of permissions) {
      if (permission.name === ComponentAction.StreamItems) {
        const hasNonAllowedBatchPermission = permission.content_types?.some(
          (type) => !AllowedBatchPermissions.includes(type)
        );
        if (hasNonAllowedBatchPermission) {
          return false;
        }
      }
    }

    return true;
  }

  runWithPermissions(
    componentUuid: UuidString,
    requiredPermissions: ComponentPermission[],
    runFunction: () => void
  ): void {
    if (!this.areRequestedPermissionsValid(requiredPermissions)) {
      console.error(
        'Component is requesting invalid permissions',
        componentUuid,
        requiredPermissions
      );
      return;
    }
    const component = this.findComponent(componentUuid);
    const nativeFeature = FindNativeFeature(component.identifier);
    const acquiredPermissions =
      nativeFeature?.component_permissions || component.permissions;

    /* Make copy as not to mutate input values */
    requiredPermissions = Copy(requiredPermissions) as ComponentPermission[];
    for (const required of requiredPermissions.slice()) {
      /* Remove anything we already have */
      const respectiveAcquired = acquiredPermissions.find(
        (candidate) => candidate.name === required.name
      );
      if (!respectiveAcquired) {
        continue;
      }
      /* We now match on name, lets substract from required.content_types anything we have in acquired. */
      const requiredContentTypes = required.content_types;
      if (!requiredContentTypes) {
        /* If this permission does not require any content types (i.e stream-context-item)
          then we can remove this from required since we match by name (respectiveAcquired.name === required.name) */
        filterFromArray(requiredPermissions, required);
        continue;
      }
      for (const acquiredContentType of respectiveAcquired.content_types!) {
        removeFromArray(requiredContentTypes, acquiredContentType);
      }
      if (requiredContentTypes.length === 0) {
        /* We've removed all acquired and end up with zero, means we already have all these permissions */
        filterFromArray(requiredPermissions, required);
      }
    }
    if (requiredPermissions.length > 0) {
      this.promptForPermissionsWithAngularAsyncRendering(
        component,
        requiredPermissions,
        // eslint-disable-next-line @typescript-eslint/require-await
        async (approved) => {
          if (approved) {
            runFunction();
          }
        }
      );
    } else {
      runFunction();
    }
  }

  promptForPermissionsWithAngularAsyncRendering(
    component: SNComponent,
    permissions: ComponentPermission[],
    callback: (approved: boolean) => Promise<void>
  ): void {
    setTimeout(() => {
      this.promptForPermissions(component, permissions, callback);
    });
  }

  promptForPermissions(
    component: SNComponent,
    permissions: ComponentPermission[],
    callback: (approved: boolean) => Promise<void>
  ): void {
    const params: PermissionDialog = {
      component: component,
      permissions: permissions,
      permissionsString: this.permissionsStringForPermissions(
        permissions,
        component
      ),
      actionBlock: callback,
      callback: async (approved: boolean) => {
        const latestComponent = this.findComponent(component.uuid);
        if (approved) {
          this.log('Changing component to expand permissions', component);
          const componentPermissions = Copy(
            latestComponent.permissions
          ) as ComponentPermission[];
          for (const permission of permissions) {
            const matchingPermission = componentPermissions.find(
              (candidate) => candidate.name === permission.name
            );
            if (!matchingPermission) {
              componentPermissions.push(permission);
            } else {
              /* Permission already exists, but content_types may have been expanded */
              const contentTypes = matchingPermission.content_types || [];
              matchingPermission.content_types = uniq(
                contentTypes.concat(permission.content_types!)
              );
            }
          }
          await this.itemManager.changeItem(component.uuid, (m) => {
            const mutator = m as ComponentMutator;
            mutator.permissions = componentPermissions;
          });
          this.syncService.sync();
        }
        this.permissionDialogs = this.permissionDialogs.filter(
          (pendingDialog) => {
            /* Remove self */
            if (pendingDialog === params) {
              pendingDialog.actionBlock && pendingDialog.actionBlock(approved);
              return false;
            }
            const containsObjectSubset = (
              source: ComponentPermission[],
              target: ComponentPermission[]
            ) => {
              return !target.some(
                (val) =>
                  !source.find(
                    (candidate) =>
                      JSON.stringify(candidate) === JSON.stringify(val)
                  )
              );
            };
            if (pendingDialog.component === component) {
              /* remove pending dialogs that are encapsulated by already approved permissions, and run its function */
              if (
                pendingDialog.permissions === permissions ||
                containsObjectSubset(permissions, pendingDialog.permissions)
              ) {
                /* If approved, run the action block. Otherwise, if canceled, cancel any
              pending ones as well, since the user was explicit in their intentions */
                if (approved) {
                  pendingDialog.actionBlock &&
                    pendingDialog.actionBlock(approved);
                }
                return false;
              }
            }
            return true;
          }
        );
        if (this.permissionDialogs.length > 0) {
          this.presentPermissionsDialog(this.permissionDialogs[0]);
        }
      },
    };
    /**
     * Since these calls are asyncronous, multiple dialogs may be requested at the same time.
     * We only want to present one and trigger all callbacks based on one modal result
     */
    const existingDialog = find(this.permissionDialogs, {
      component: component,
    });
    this.permissionDialogs.push(params);
    if (!existingDialog) {
      this.presentPermissionsDialog(params);
    } else {
      this.log('Existing dialog, not presenting.');
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  presentPermissionsDialog(_dialog: PermissionDialog): void {
    throw 'Must override SNComponentManager.presentPermissionsDialog';
  }

  async toggleTheme(uuid: UuidString): Promise<void> {
    this.log('Toggling theme', uuid);

    const theme = this.findComponent(uuid) as SNTheme;
    if (theme.active) {
      await this.itemManager.changeComponent(theme.uuid, (mutator) => {
        mutator.active = false;
      });
    } else {
      const activeThemes = this.getActiveThemes();

      /* Activate current before deactivating others, so as not to flicker */
      await this.itemManager.changeComponent(theme.uuid, (mutator) => {
        mutator.active = true;
      });

      /* Deactive currently active theme(s) if new theme is not layerable */
      if (!theme.isLayerable()) {
        await sleep(10);
        for (const candidate of activeThemes) {
          if (candidate && !candidate.isLayerable()) {
            await this.itemManager.changeComponent(
              candidate.uuid,
              (mutator) => {
                mutator.active = false;
              }
            );
          }
        }
      }
    }
  }

  async toggleComponent(uuid: UuidString): Promise<void> {
    this.log('Toggling component', uuid);
    const component = this.findComponent(uuid);
    await this.itemManager.changeComponent(component.uuid, (mutator) => {
      mutator.active = !(mutator.getItem() as SNComponent).active;
    });
  }

  async deleteComponent(uuid: UuidString): Promise<void> {
    await this.itemManager.setItemToBeDeleted(uuid);
    this.syncService.sync();
  }

  isComponentActive(component: SNComponent): boolean {
    return component.active;
  }

  allComponentIframes(): HTMLIFrameElement[] {
    if (this.isMobile) {
      /**
       * Retrieving all iframes is typically related to lifecycle management of
       * non-editor components. So this function is not useful to mobile.
       */
      return [];
    }
    return Array.from(document.getElementsByTagName('iframe'));
  }

  iframeForComponentViewer(
    viewer: ComponentViewer
  ): HTMLIFrameElement | undefined {
    return viewer.getIframe();
  }

  editorForNote(note: SNNote): SNComponent | undefined {
    const editors = this.componentsForArea(ComponentArea.Editor);
    for (const editor of editors) {
      if (editor.isExplicitlyEnabledForItem(note.uuid)) {
        return editor;
      }
    }
    let defaultEditor;
    /* No editor found for note. Use default editor, if note does not prefer system editor */
    if (this.isMobile) {
      if (!note.mobilePrefersPlainEditor) {
        defaultEditor = this.getDefaultEditor();
      }
    } else {
      if (!note.prefersPlainEditor) {
        defaultEditor = this.getDefaultEditor();
      }
    }
    if (
      defaultEditor &&
      !defaultEditor.isExplicitlyDisabledForItem(note.uuid)
    ) {
      return defaultEditor;
    } else {
      return undefined;
    }
  }

  getDefaultEditor(): SNComponent {
    const editors = this.componentsForArea(ComponentArea.Editor);
    if (this.isMobile) {
      return editors.filter((e) => {
        return e.isMobileDefault;
      })[0];
    } else {
      return editors.filter((e) => e.isDefaultEditor())[0];
    }
  }

  permissionsStringForPermissions(
    permissions: ComponentPermission[],
    component: SNComponent
  ): string {
    if (permissions.length === 0) {
      return '.';
    }

    let contentTypeStrings: string[] = [];
    let contextAreaStrings: string[] = [];

    permissions.forEach((permission) => {
      switch (permission.name) {
        case ComponentAction.StreamItems:
          if (!permission.content_types) {
            return;
          }
          permission.content_types.forEach((contentType) => {
            const desc = displayStringForContentType(contentType);
            if (desc) {
              contentTypeStrings.push(`${desc}s`);
            } else {
              contentTypeStrings.push(`items of type ${contentType}`);
            }
          });
          break;
        case ComponentAction.StreamContextItem:
          {
            const componentAreaMapping = {
              [ComponentArea.EditorStack]: 'working note',
              [ComponentArea.NoteTags]: 'working note',
              [ComponentArea.Editor]: 'working note',
            };
            contextAreaStrings.push(
              (componentAreaMapping as any)[component.area]
            );
          }
          break;
      }
    });

    contentTypeStrings = uniq(contentTypeStrings);
    contextAreaStrings = uniq(contextAreaStrings);

    if (contentTypeStrings.length === 0 && contextAreaStrings.length === 0) {
      return '.';
    }
    return contentTypeStrings.concat(contextAreaStrings).join(', ') + '.';
  }

  doesEditorChangeRequireAlert(
    from: SNComponent | undefined,
    to: SNComponent | undefined
  ): boolean {
    const isEitherPlainEditor = !from || !to;
    const isEitherMarkdown =
      from?.package_info.file_type === 'md' ||
      to?.package_info.file_type === 'md';
    const areBothHtml =
      from?.package_info.file_type === 'html' &&
      to?.package_info.file_type === 'html';

    if (isEitherPlainEditor || isEitherMarkdown || areBothHtml) {
      return false;
    } else {
      return true;
    }
  }

  async showEditorChangeAlert(): Promise<boolean> {
    const shouldChangeEditor = await this.alertService.confirm(
      'Doing so might result in minor formatting changes.',
      'Are you sure you want to change the editor?',
      'Yes, change it'
    );

    return shouldChangeEditor;
  }
}
