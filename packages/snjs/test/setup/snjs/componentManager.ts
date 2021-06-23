import {
  PermissionDialog,
  SNComponent,
  SNComponentManager,
  SNTheme,
} from '@Lib/index';

export class WebComponentManager extends SNComponentManager {
  presentPermissionsDialog(dialog: PermissionDialog) {
    const text = `${dialog.component.name} would like to interact with your ${dialog.permissionsString}`;
    const approved = window.confirm(text);
    dialog.callback(approved);
  }

  openModalComponent(component: SNComponent): void {
    window.alert(component.name);
  }
}

export class MobileComponentManager extends SNComponentManager {
  private mobileActiveTheme?: SNTheme;

  presentPermissionsDialog(dialog: PermissionDialog) {
    const text = `${dialog.component.name} would like to interact with your ${dialog.permissionsString}`;
    const approved = window.confirm(text);
    dialog.callback(approved);
  }

  /** @override */
  urlForComponent(component: SNComponent) {
    if (component.isTheme()) {
      const encoded = encodeURI(component.hosted_url);
      return `data:text/css;base64,${encoded}`;
    } else {
      return super.urlForComponent(component);
    }
  }

  public setMobileActiveTheme(theme: SNTheme) {
    this.mobileActiveTheme = theme;
    this.postActiveThemesToAllComponents();
  }

  /** @override */
  getActiveThemes() {
    if (this.mobileActiveTheme) {
      return [this.mobileActiveTheme];
    } else {
      return [];
    }
  }
}
