import { addIfUnique, removeFromArray } from '@standardnotes/utils'
import { ItemMutator } from '../../Abstract/Item/Implementations/ItemMutator'
import { Uuid } from '@standardnotes/common'
import { ComponentPermission } from '@standardnotes/features'
import { AppDataField } from '../../Abstract/Item/Types/AppDataField'
import { ComponentContent } from './ComponentContent'

export class ComponentMutator extends ItemMutator {
  get typedContent(): Partial<ComponentContent> {
    return this.content as Partial<ComponentContent>
  }

  set active(active: boolean) {
    this.typedContent.active = active
  }

  set isMobileDefault(isMobileDefault: boolean) {
    this.typedContent.isMobileDefault = isMobileDefault
  }

  set defaultEditor(defaultEditor: boolean) {
    this.setAppDataItem(AppDataField.DefaultEditor, defaultEditor)
  }

  set componentData(componentData: Record<string, any>) {
    this.typedContent.componentData = componentData
  }

  set package_info(package_info: any) {
    this.typedContent.package_info = package_info
  }

  set local_url(local_url: string) {
    this.typedContent.local_url = local_url
  }

  set hosted_url(hosted_url: string) {
    this.typedContent.hosted_url = hosted_url
  }

  set valid_until(valid_until: Date) {
    this.typedContent.valid_until = valid_until
  }

  set permissions(permissions: ComponentPermission[]) {
    this.typedContent.permissions = permissions
  }

  public associateWithItem(uuid: Uuid): void {
    const associated = this.typedContent.associatedItemIds || []
    addIfUnique(associated, uuid)
    this.typedContent.associatedItemIds = associated
  }

  public disassociateWithItem(uuid: Uuid): void {
    const disassociated = this.typedContent.disassociatedItemIds || []
    addIfUnique(disassociated, uuid)
    this.typedContent.disassociatedItemIds = disassociated
  }

  public removeAssociatedItemId(uuid: Uuid): void {
    removeFromArray(this.typedContent.associatedItemIds || [], uuid)
  }

  public removeDisassociatedItemId(uuid: Uuid): void {
    removeFromArray(this.typedContent.disassociatedItemIds || [], uuid)
  }

  public setLastSize(size: string): void {
    this.setAppDataItem(AppDataField.LastSize, size)
  }
}
