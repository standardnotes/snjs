import { ComponentArea } from '@standardnotes/features';
import { CreateItemFromPayload } from '@Models/generator';
import { Uuids } from '@Models/functions';
import { Uuid } from '@Lib/uuid';
import find from 'lodash/find';
import uniq from 'lodash/uniq';
import remove from 'lodash/remove';
import { SNAlertService } from '@Services/alert_service';
import { SNSyncService } from '@Services/sync/sync_service';
import {
  Environment,
  environmentToString,
  Platform,
  platformToString,
} from '@Lib/platforms';
import {
  PayloadContent,
  RawPayload,
  CreateSourcedPayloadFromObject,
} from '@Payloads/generator';
import {
  ComponentMessage,
  MessageReplyData,
  ItemMessagePayload,
  ComponentDataDomain,
  MessageReply,
  StreamItemsMessageData,
  AllowedBatchPermissions,
  ComponentRawPayload,
  DeleteItemsMessageData,
} from './types';
import { ComponentAction, ComponentPermission } from '@Models/app/component';
import { PayloadSource } from '@Lib/protocol/payloads';
import { ItemManager } from '@Services/item_manager';
import { UuidString } from '@Lib/types';
import { SNItem, MutationType } from '@Models/core/item';
import { ContentType } from '@Models/content_types';
import { SNComponent } from '@Lib/models';
import {
  concatArrays,
  isString,
  extendArray,
  searchArray,
  Copy,
  removeFromArray,
  log,
  nonSecureRandomIdentifier,
} from '@Lib/utils';
import { MessageData } from '..';

type RunWithPermissionsCallback = (
  componentUuid: UuidString,
  requiredPermissions: ComponentPermission[],
  runFunction: () => void
) => void;

type ComponentManagerFunctions = {
  runWithPermissions: RunWithPermissionsCallback;
  urlsForActiveThemes: () => string[];
};

const ReadwriteActions = [
  ComponentAction.SaveItems,
  ComponentAction.AssociateItem,
  ComponentAction.DeassociateItem,
  ComponentAction.CreateItem,
  ComponentAction.CreateItems,
  ComponentAction.DeleteItems,
  ComponentAction.SetComponentData,
];

export type ActionObserver = (
  action: ComponentAction,
  messageData: MessageData
) => void;

export class ComponentViewer {
  private streamItems?: ContentType[];
  private streamContextItemOriginalMessage?: ComponentMessage;
  private streamItemsOriginalMessage?: ComponentMessage;
  private removeItemObserver: () => void;
  private loggingEnabled = false;
  public identifier = nonSecureRandomIdentifier();
  private actionObservers: ActionObserver[] = [];
  public overrideContextItem?: SNItem;

  window?: Window;
  hidden = false;
  readonly = false;
  lockReadonly = false;
  sessionKey?: string;

  constructor(
    public component: SNComponent,
    private itemManager: ItemManager,
    private syncService: SNSyncService,
    private alertService: SNAlertService,
    private environment: Environment,
    private platform: Platform,
    private componentManagerFunctions: ComponentManagerFunctions,
    private url?: string,
    private contextItemUuid?: UuidString,
    actionObserver?: ActionObserver
  ) {
    this.removeItemObserver = this.itemManager.addObserver(
      ContentType.Any,
      (changed, inserted, discarded, _ignored, source, sourceKey) => {
        const items = concatArrays(changed, inserted, discarded) as SNItem[];
        this.handleChangesInItems(items, source, sourceKey);
      }
    );
    if (actionObserver) {
      this.actionObservers.push(actionObserver);
    }
    this.log('Constructor', this);
  }

  get isDesktop(): boolean {
    return this.environment === Environment.Desktop;
  }

  get isMobile(): boolean {
    return this.environment === Environment.Mobile;
  }

  public destroy(): void {
    this.log('Destroying', this);
    this.deinit();
  }

  private deinit(): void {
    this.removeItemObserver();
    (this.removeItemObserver as unknown) = undefined;
    this.actionObservers.length = 0;
  }

  public addActionObserver(observer: ActionObserver): void {
    this.actionObservers.push(observer);
  }

  get componentUuid(): string {
    return this.component.uuid;
  }

  handleChangesInItems(
    items: SNItem[],
    source?: PayloadSource,
    sourceKey?: string
  ): void {
    const areWeOriginator = sourceKey && sourceKey === this.component.uuid;
    if (areWeOriginator) {
      return;
    }

    if (this.streamItems) {
      const relevantItems = items.filter((item) => {
        return this.streamItems?.includes(item.content_type);
      });
      if (relevantItems.length > 0) {
        this.sendManyItemsThroughBridge(relevantItems);
      }
    }

    if (this.streamItemsOriginalMessage) {
      const matchingItem = find(items, { uuid: this.contextItemUuid });
      if (matchingItem && !matchingItem.deleted) {
        this.sendContextItemThroughBridge(matchingItem, source);
      }
    }
  }

  sendManyItemsThroughBridge(items: SNItem[]): void {
    const requiredPermissions: ComponentPermission[] = [
      {
        name: ComponentAction.StreamItems,
        content_types: this.streamItems!.sort(),
      },
    ];
    this.componentManagerFunctions.runWithPermissions(
      this.component.uuid,
      requiredPermissions,
      () => {
        this.sendItemsInReply(items, this.streamItemsOriginalMessage!);
      }
    );
  }

  sendContextItemThroughBridge(item: SNItem, source?: PayloadSource): void {
    const requiredContextPermissions = [
      {
        name: ComponentAction.StreamContextItem,
      },
    ] as ComponentPermission[];
    this.componentManagerFunctions.runWithPermissions(
      this.component.uuid,
      requiredContextPermissions,
      () => {
        this.log(
          'Send context item in reply',
          'component:',
          this.component,
          'item: ',
          item,
          'originalMessage: ',
          this.streamContextItemOriginalMessage
        );
        const response: MessageReplyData = {
          item: this.jsonForItem(item, source),
        };
        this.replyToMessage(this.streamContextItemOriginalMessage!, response);
      }
    );
  }

  private log(message: string, ...args: unknown[]): void {
    if (this.loggingEnabled) {
      log(this, message, args);
    }
  }

  private sendItemsInReply(
    items: SNItem[],
    message: ComponentMessage,
    source?: PayloadSource
  ): void {
    this.log('Send items in reply', this.component, items, message);
    const responseData: MessageReplyData = {};
    const mapped = items.map((item) => {
      return this.jsonForItem(item, source);
    });
    responseData.items = mapped;
    this.replyToMessage(message, responseData);
  }

  private jsonForItem(
    item: SNItem,
    source?: PayloadSource
  ): ItemMessagePayload {
    const isMetadatUpdate =
      source === PayloadSource.RemoteSaved ||
      source === PayloadSource.LocalSaved ||
      source === PayloadSource.PreSyncSave;
    /** The data all components store into */
    const componentData = item.getDomainData(ComponentDataDomain) || {};
    /** The data for this particular component */
    const clientData = componentData[this.component.getClientDataKey()!] || {};
    const params: ItemMessagePayload = {
      uuid: item.uuid,
      content_type: item.content_type,
      created_at: item.created_at,
      updated_at: item.serverUpdatedAt!,
      deleted: item.deleted!,
      isMetadataUpdate: isMetadatUpdate,
      content: item.content,
      clientData: clientData,
    };
    return this.responseItemsByRemovingPrivateProperties([params])[0];
  }

  private replyToMessage(
    originalMessage: ComponentMessage,
    replyData: MessageReplyData
  ): void {
    const reply: MessageReply = {
      action: ComponentAction.Reply,
      original: originalMessage,
      data: replyData,
    };
    this.sendMessage(reply);
  }

  sendMessage(message: ComponentMessage | MessageReply): void {
    const permissibleActionsWhileHidden = [
      ComponentAction.ComponentRegistered,
      ComponentAction.ActivateThemes,
    ];
    if (
      this.hidden &&
      !permissibleActionsWhileHidden.includes(message.action)
    ) {
      this.log(
        'Component disabled for current item, ignoring messages.',
        this.component.name
      );
      return;
    }
    if (!this.window && message.action === ComponentAction.Reply) {
      this.log(
        'Component has been deallocated in between message send and reply',
        this.component,
        message
      );
      return;
    }
    this.log('Send message to component', this.component, 'message: ', message);
    let origin = this.url;
    if (!origin || !this.window) {
      void this.alertService.alert(
        `Standard Notes is trying to communicate with ${this.component.name}, ` +
          'but an error is occurring. Please restart this extension and try again.'
      );
      return;
    }
    if (!origin!.startsWith('http') && !origin!.startsWith('file')) {
      /* Native extension running in web, prefix current host */
      origin = window.location.href + origin;
    }
    /* Mobile messaging requires json */
    this.window?.postMessage(
      this.isMobile ? JSON.stringify(message) : message,
      origin!
    );
  }

  private responseItemsByRemovingPrivateProperties<T extends RawPayload>(
    responseItems: T[],
    removeUrls = false
  ): T[] {
    /* Don't allow component to overwrite these properties. */
    let privateContentProperties = [
      'autoupdateDisabled',
      'permissions',
      'active',
    ];
    if (removeUrls) {
      privateContentProperties = privateContentProperties.concat([
        'hosted_url',
        'local_url',
      ]);
    }
    return responseItems.map((responseItem) => {
      const privateProperties = privateContentProperties.slice();
      /** Server extensions are allowed to modify url property */
      if (
        removeUrls &&
        responseItem.content_type !== ContentType.ServerExtension
      ) {
        privateProperties.push('url');
      }
      if (!responseItem.content || isString(responseItem.content)) {
        return responseItem;
      }
      const content: Partial<PayloadContent> = {};
      for (const [key, value] of Object.entries(responseItem.content)) {
        /** Only include non-private properties */
        if (!privateProperties.includes(key)) {
          content[key] = value;
        }
      }
      return {
        ...responseItem,
        content: content,
      };
    });
  }

  /** Called by other views when the iframe is ready */
  public async setWindow(window: Window): Promise<void> {
    if (this.window === window) {
      this.log('Attempting to re-register same component window.');
    }
    this.log('setWindow', 'component: ', this.component, 'window: ', window);
    this.window = window;
    this.sessionKey = await Uuid.GenerateUuid();
    this.sendMessage({
      action: ComponentAction.ComponentRegistered,
      sessionKey: this.sessionKey,
      componentData: this.component.componentData,
      data: {
        uuid: this.component.uuid,
        environment: environmentToString(this.environment),
        platform: platformToString(this.platform),
        activeThemeUrls: this.componentManagerFunctions.urlsForActiveThemes(),
      },
    });
    this.log('setWindow got new sessionKey', this.sessionKey);
    this.postActiveThemes();
  }

  postActiveThemes(): void {
    const urls = this.componentManagerFunctions.urlsForActiveThemes();
    const data: MessageReplyData = {
      themes: urls,
    };
    const message: ComponentMessage = {
      action: ComponentAction.ActivateThemes,
      data: data,
    };
    this.sendMessage(message);
  }

  /* A hidden component will not receive messages. However, when a component is unhidden,
   * we need to send it any items it may have registered streaming for. */
  public setHidden(hidden: boolean): void {
    if (hidden) {
      this.hidden = true;
    } else if (this.hidden) {
      this.hidden = false;

      if (this.streamContextItemOriginalMessage) {
        this.handleStreamContextItemMessage(
          this.streamContextItemOriginalMessage
        );
      }

      if (this.streamItems) {
        this.handleStreamItemsMessage(this.streamItemsOriginalMessage!);
      }
    }
  }

  handleMessage(message: ComponentMessage): void {
    this.log('Handle message', message, this);
    if (!this.component) {
      this.log('Component not defined for message, returning', message);
      this.alertService.alert(
        'An extension is trying to communicate with Standard Notes, ' +
          'but there is an error establishing a bridge. Please restart the app and try again.'
      );
      return;
    }
    if (this.readonly && ReadwriteActions.includes(message.action)) {
      this.alertService.alert(
        `The extension ${this.component.name} is trying to save, but it is in a locked state and cannot accept changes.`
      );
      return;
    }

    const messageHandlers: Partial<
      Record<ComponentAction, (message: ComponentMessage) => void>
    > = {
      [ComponentAction.StreamItems]: this.handleStreamItemsMessage.bind(this),
      [ComponentAction.StreamContextItem]: this.handleStreamContextItemMessage.bind(
        this
      ),
      [ComponentAction.SetComponentData]: this.handleSetComponentDataMessage.bind(
        this
      ),
      [ComponentAction.DeleteItems]: this.handleDeleteItemsMessage.bind(this),
      [ComponentAction.CreateItems]: this.handleCreateItemsMessage.bind(this),
      [ComponentAction.CreateItem]: this.handleCreateItemsMessage.bind(this),
      [ComponentAction.SaveItems]: this.handleSaveItemsMessage.bind(this),
      [ComponentAction.SetSize]: this.handleSetSizeEvent.bind(this),
    };

    const handler = messageHandlers[message.action];
    handler?.(message);

    for (const observer of this.actionObservers) {
      observer(message.action, message.data);
    }
  }

  handleStreamItemsMessage(message: ComponentMessage): void {
    const data = message.data as StreamItemsMessageData;
    const types = data.content_types
      .filter((type) => AllowedBatchPermissions.includes(type))
      .sort();
    const requiredPermissions = [
      {
        name: ComponentAction.StreamItems,
        content_types: types,
      },
    ];
    this.componentManagerFunctions.runWithPermissions(
      this.component.uuid,
      requiredPermissions,
      () => {
        if (!this.streamItems) {
          this.streamItems = types;
          this.streamItemsOriginalMessage = message;
        }
        /* Push immediately now */
        const items: SNItem[] = [];
        for (const contentType of types) {
          extendArray(
            items,
            this.itemManager.nonErroredItemsForContentType(contentType)
          );
        }
        this.sendItemsInReply(items, message);
      }
    );
  }

  handleStreamContextItemMessage(message: ComponentMessage): void {
    const requiredPermissions: ComponentPermission[] = [
      {
        name: ComponentAction.StreamContextItem,
      },
    ];
    this.componentManagerFunctions.runWithPermissions(
      this.component.uuid,
      requiredPermissions,
      () => {
        if (!this.streamContextItemOriginalMessage) {
          this.streamContextItemOriginalMessage = message;
        }
        const matchingItem =
          this.overrideContextItem ||
          this.itemManager.findItem(this.contextItemUuid!);
        if (matchingItem) {
          this.sendContextItemThroughBridge(matchingItem);
        }
      }
    );
  }

  /**
   * Save items is capable of saving existing items, and also creating new ones
   * if they don't exist.
   */
  handleSaveItemsMessage(message: ComponentMessage): void {
    let responsePayloads = message.data.items as ComponentRawPayload[];
    const requiredPermissions = [];
    /* Pending as in needed to be accounted for in permissions. */
    const pendingResponseItems = responsePayloads.slice();
    for (const responseItem of responsePayloads.slice()) {
      if (responseItem.uuid === this.contextItemUuid) {
        requiredPermissions.push({
          name: ComponentAction.StreamContextItem,
        });
        removeFromArray(pendingResponseItems, responseItem);
        /* We break because there can only be one context item */
        break;
      }
    }
    /* Check to see if additional privileges are required */
    if (pendingResponseItems.length > 0) {
      const requiredContentTypes = uniq(
        pendingResponseItems.map((item: any) => {
          return item.content_type;
        })
      ).sort();
      requiredPermissions.push({
        name: ComponentAction.StreamItems,
        content_types: requiredContentTypes,
      } as ComponentPermission);
    }
    this.componentManagerFunctions.runWithPermissions(
      this.component.uuid,
      requiredPermissions,
      async () => {
        responsePayloads = this.responseItemsByRemovingPrivateProperties(
          responsePayloads,
          true
        );
        /* Filter locked items */
        const uuids = Uuids(responsePayloads);
        const items = this.itemManager.findItems(uuids, true);
        let lockedCount = 0;
        let lockedNoteCount = 0;
        for (const item of items) {
          if (!item) {
            continue;
          }
          if (item.locked) {
            remove(responsePayloads, { uuid: item.uuid });
            lockedCount++;
            if (item.content_type === ContentType.Note) {
              lockedNoteCount++;
            }
          }
        }
        if (lockedNoteCount === 1) {
          this.alertService.alert(
            'The note you are attempting to save has editing disabled',
            'Note has Editing Disabled'
          );
          return;
        } else if (lockedCount > 0) {
          const itemNoun =
            lockedCount === 1
              ? 'item'
              : lockedNoteCount === lockedCount
              ? 'notes'
              : 'items';
          const auxVerb = lockedCount === 1 ? 'has' : 'have';
          this.alertService.alert(
            `${lockedCount} ${itemNoun} you are attempting to save ${auxVerb} editing disabled.`,
            'Items have Editing Disabled'
          );
          return;
        }
        const payloads = responsePayloads.map((responseItem: any) => {
          return CreateSourcedPayloadFromObject(
            responseItem,
            PayloadSource.ComponentRetrieved
          );
        });
        for (const payload of payloads) {
          const item = this.itemManager.findItem(payload.uuid);
          if (!item) {
            const template = CreateItemFromPayload(payload);
            await this.itemManager.insertItem(template);
          } else {
            if (payload.content_type !== item.content_type) {
              throw Error(
                'Extension is trying to modify content type of item.'
              );
            }
          }
        }
        await this.itemManager.changeItems(
          uuids,
          (mutator) => {
            const payload = searchArray(payloads, { uuid: mutator.getUuid() })!;
            mutator.mergePayload(payload);
            const responseItem = searchArray(responsePayloads, {
              uuid: mutator.getUuid(),
            })!;
            if (responseItem.clientData) {
              const allComponentData = Copy(
                mutator.getItem().getDomainData(ComponentDataDomain) || {}
              );
              allComponentData[this.component.getClientDataKey()!] =
                responseItem.clientData;
              mutator.setDomainData(allComponentData, ComponentDataDomain);
            }
          },
          MutationType.UserInteraction,
          PayloadSource.ComponentRetrieved,
          this.component.uuid
        );
        this.syncService
          .sync()
          .then(() => {
            /* Allow handlers to be notified when a save begins and ends, to update the UI */
            const saveMessage = Object.assign({}, message);
            saveMessage.action = ComponentAction.SaveSuccess;
            this.replyToMessage(message, {});
            this.handleMessage(saveMessage);
          })
          .catch(() => {
            const saveMessage = Object.assign({}, message);
            saveMessage.action = ComponentAction.SaveError;
            this.replyToMessage(message, {
              error: ComponentAction.SaveError,
            });
            this.handleMessage(saveMessage);
          });
      }
    );
  }

  handleDuplicateItemMessage(message: ComponentMessage): void {
    const itemParams = message.data.item!;
    const item = this.itemManager.findItem(itemParams.uuid)!;
    const requiredPermissions = [
      {
        name: ComponentAction.StreamItems,
        content_types: [item.content_type!],
      },
    ];
    this.componentManagerFunctions.runWithPermissions(
      this.component.uuid,
      requiredPermissions,
      async () => {
        const duplicate = await this.itemManager.duplicateItem(item.uuid);
        this.syncService.sync();
        this.replyToMessage(message, {
          item: this.jsonForItem(duplicate),
        });
      }
    );
  }

  handleCreateItemsMessage(message: ComponentMessage): void {
    let responseItems = message.data.item
      ? [message.data.item]
      : message.data.items!;
    const uniqueContentTypes = uniq(
      responseItems.map((item: any) => {
        return item.content_type;
      })
    ) as ContentType[];
    const requiredPermissions: ComponentPermission[] = [
      {
        name: ComponentAction.StreamItems,
        content_types: uniqueContentTypes,
      },
    ];
    this.componentManagerFunctions.runWithPermissions(
      this.component.uuid,
      requiredPermissions,
      async () => {
        responseItems = this.responseItemsByRemovingPrivateProperties(
          responseItems
        );
        const processedItems = [];
        for (const responseItem of responseItems) {
          if (!responseItem.uuid) {
            responseItem.uuid = await Uuid.GenerateUuid();
          }
          const payload = CreateSourcedPayloadFromObject(
            responseItem,
            PayloadSource.ComponentCreated
          );
          const template = CreateItemFromPayload(payload);
          const item = await this.itemManager.insertItem(template);
          await this.itemManager.changeItem(
            item.uuid,
            (mutator) => {
              if (responseItem.clientData) {
                const allComponentData = Copy(
                  item.getDomainData(ComponentDataDomain) || {}
                );
                allComponentData[this.component.getClientDataKey()!] =
                  responseItem.clientData;
                mutator.setDomainData(allComponentData, ComponentDataDomain);
              }
            },
            MutationType.UserInteraction,
            PayloadSource.ComponentCreated,
            this.component.uuid
          );
          processedItems.push(item);
        }
        this.syncService.sync();
        const reply =
          message.action === ComponentAction.CreateItem
            ? { item: this.jsonForItem(processedItems[0]) }
            : {
                items: processedItems.map((item) => {
                  return this.jsonForItem(item);
                }),
              };
        this.replyToMessage(message, reply);
      }
    );
  }

  handleDeleteItemsMessage(message: ComponentMessage): void {
    const data = message.data as DeleteItemsMessageData;
    const items = data.items.filter((item) =>
      AllowedBatchPermissions.includes(item.content_type)
    );
    const requiredContentTypes = uniq(
      items.map((item) => item.content_type)
    ).sort() as ContentType[];
    const requiredPermissions: ComponentPermission[] = [
      {
        name: ComponentAction.StreamItems,
        content_types: requiredContentTypes,
      },
    ];
    this.componentManagerFunctions.runWithPermissions(
      this.component.uuid,
      requiredPermissions,
      async () => {
        const itemsData = items;
        const noun = itemsData.length === 1 ? 'item' : 'items';
        let reply = null;
        const didConfirm = await this.alertService.confirm(
          `Are you sure you want to delete ${itemsData.length} ${noun}?`
        );
        if (didConfirm) {
          /* Filter for any components and deactivate before deleting */
          for (const itemData of itemsData) {
            const item = this.itemManager.findItem(itemData.uuid);
            if (!item) {
              this.alertService.alert(
                'The item you are trying to delete cannot be found.'
              );
              continue;
            }
            await this.itemManager.setItemToBeDeleted(
              item.uuid,
              PayloadSource.ComponentRetrieved
            );
          }
          this.syncService.sync();
          reply = { deleted: true };
        } else {
          /* Rejected by user */
          reply = { deleted: false };
        }
        this.replyToMessage(message, reply);
      }
    );
  }

  handleRequestPermissionsMessage(message: ComponentMessage): void {
    this.componentManagerFunctions.runWithPermissions(
      this.component.uuid,
      message.data.permissions!,
      () => {
        this.replyToMessage(message, { approved: true });
      }
    );
  }

  handleSetComponentDataMessage(message: ComponentMessage): void {
    /* A component setting its own data does not require special permissions */
    this.componentManagerFunctions.runWithPermissions(
      this.component.uuid,
      [],
      async () => {
        await this.itemManager.changeComponent(
          this.component.uuid,
          (mutator) => {
            mutator.componentData = message.data.componentData;
          }
        );
        this.syncService.sync();
      }
    );
  }

  handleSetSizeEvent(message: ComponentMessage): void {
    if (this.component.area !== ComponentArea.EditorStack) {
      return;
    }

    const parent = this.getIframe()?.parentElement;
    if (!parent) {
      return;
    }

    const data = message.data;
    const widthString = isString(data.width) ? data.width : `${data.width}px`;
    const heightString = isString(data.height)
      ? data.height
      : `${data.height}px`;
    if (parent) {
      parent.setAttribute(
        'style',
        `width:${widthString}; height:${heightString};`
      );
    }
  }

  getIframe(): HTMLIFrameElement | undefined {
    return Array.from(document.getElementsByTagName('iframe')).find(
      (iframe) => iframe.dataset.componentViewerId === this.identifier
    );
  }
}
