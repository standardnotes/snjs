import { PureService } from '@Services/pure_service';
import { DeviceInterface } from '@Lib/device_interface';
import { Uuid } from '@Lib/uuid';
import { UuidString } from './../types';

export type SNNamespace = {
  identifier: string | UuidString,
  userUuid?: UuidString,
  label: string,
  isDefault: boolean,
};

const NAMESPACES_STORAGE_KEY = 'namespaces';

/**
 * The namespace service is responsible of setting the namespace to be used by
 * the DeviceInterface.
 */
export class SNNamespaceService extends PureService {
  private namespace?: SNNamespace

  constructor(deviceInterface: DeviceInterface, namespaceIdentifier?: string) {
    super();
    this.deviceInterface = deviceInterface;

    if (namespaceIdentifier) {
      const namespace: SNNamespace = {
        identifier: namespaceIdentifier,
        label: namespaceIdentifier,
        isDefault: true
      };
      this.namespace = namespace;
      this.deviceInterface!.switchToNamespace(namespace);
    }
  }

  private async getNamespaces() {
    const namespaces = await this.deviceInterface!.getRawStorageValue(NAMESPACES_STORAGE_KEY);
    if (!namespaces) {
      return [] as SNNamespace[];
    }
    return JSON.parse(namespaces) as SNNamespace[];
  }

  private async setNamespaces(namespaces: SNNamespace[]) {
    this.deviceInterface!.setRawStorageValue(
      NAMESPACES_STORAGE_KEY,
      JSON.stringify(namespaces)
    );
  }

  private async getDefaultNamespace() {
    const namespaces = await this.getNamespaces();
    return namespaces.find(namespace => namespace.isDefault === true);
  }

  private async pushNamespace(namespace: SNNamespace) {
    const namespaces = await this.getNamespaces();
    const namespaceIndex = namespaces.findIndex(n => n.identifier === namespace.identifier);
    if (namespaceIndex === -1) {
      namespaces.push(namespace);
    } else {
      namespaces[namespaceIndex] = namespace;
    }
    await this.setNamespaces(namespaces);
  }

  private async switchToNamespace(namespace: SNNamespace) {
    this.namespace = namespace;
    this.deviceInterface!.switchToNamespace(namespace);
    await this.pushNamespace(namespace);
  }

  /**
   * Creates a new namespace if necessary. If not, use an existing one.
   */
  public async initialize() {
    const defaultNamespace = await this.getDefaultNamespace();
    if (defaultNamespace) {
      await this.switchToNamespace(defaultNamespace);
      return;
    }
    const namespaces = await this.getNamespaces();
    /** If no namespaces exist, then we should create a new one. */
    if (namespaces.length === 0) {
      await this.createNamespace(true);
    }
    /**
     * If one (1) namespace exist, then it means it is not the default one at this point.
     * Let's set it as the default namespace and return it.
     */
    else if (namespaces.length === 1) {
      const namespace = namespaces[0];
      namespace.isDefault = true;
      namespace.label = 'Default namespace';
      await this.switchToNamespace(namespace);
    }
    /**
     * In the future, if a user has multiple accounts signed into a client, each account
     * will use its own keychain/storage namespace. This service will be in charge of displaying
     * a UI for selecting which namespace to sign into (if no default namespace is set).
     */
    else {
      throw Error('Multiple namespaces not supported yet ;)')
    }
  }

  private async createNamespace(isDefault = false, identifier?: string, label?: string) {
    if (isDefault && await this.getDefaultNamespace()) {
      throw Error('Can not create default namespace: a default namespace already exists.');
    }
    const uuid = await Uuid.GenerateUuid();
    const namespace: SNNamespace = {
      identifier: identifier || uuid,
      userUuid: undefined,
      label: isDefault ? 'Default namespace' : label || identifier || uuid,
      isDefault
    };
    await this.switchToNamespace(namespace);
  }

  /**
   * Gets the current namespace in use.
   */
  public getCurrentNamespace() {
    if (!this.namespace) {
      throw Error('No namespace set, please initialize first.');
    }
    return this.namespace;
  }
}
