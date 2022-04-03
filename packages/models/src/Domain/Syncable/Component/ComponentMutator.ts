import { addIfUnique, removeFromArray } from '@standardnotes/utils'
import { Uuid } from '@standardnotes/common'
import { ComponentPermission } from '@standardnotes/features'
import { AppDataField } from '../../Abstract/Item/Types/AppDataField'
import { ComponentContent } from './ComponentContent'
import { DecryptedItemMutator } from '../../Abstract/Item/Mutator/DecryptedItemMutator'

export class ComponentMutator extends DecryptedItemMutator<ComponentContent> {
  set active(active: boolean) {
    this.content.active = active
  }

  set isMobileDefault(isMobileDefault: boolean) {
    this.content.isMobileDefault = isMobileDefault
  }

  set defaultEditor(defaultEditor: boolean) {
    this.setAppDataItem(AppDataField.DefaultEditor, defaultEditor)
  }

  set componentData(componentData: Record<string, any>) {
    this.content.componentData = componentData
  }

  set package_info(package_info: any) {
    this.content.package_info = package_info
  }

  set local_url(local_url: string) {
    this.content.local_url = local_url
  }

  set hosted_url(hosted_url: string) {
    this.content.hosted_url = hosted_url
  }

  set valid_until(valid_until: Date) {
    this.content.valid_until = valid_until
  }

  set permissions(permissions: ComponentPermission[]) {
    this.content.permissions = permissions
  }

  public associateWithItem(uuid: Uuid): void {
    const associated = this.content.associatedItemIds || []
    addIfUnique(associated, uuid)
    this.content.associatedItemIds = associated
  }

  public disassociateWithItem(uuid: Uuid): void {
    const disassociated = this.content.disassociatedItemIds || []
    addIfUnique(disassociated, uuid)
    this.content.disassociatedItemIds = disassociated
  }

  public removeAssociatedItemId(uuid: Uuid): void {
    removeFromArray(this.content.associatedItemIds || [], uuid)
  }

  public removeDisassociatedItemId(uuid: Uuid): void {
    removeFromArray(this.content.disassociatedItemIds || [], uuid)
  }

  public setLastSize(size: string): void {
    this.setAppDataItem(AppDataField.LastSize, size)
  }
}
