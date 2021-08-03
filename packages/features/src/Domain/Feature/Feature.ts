import { PermissionName } from '@standardnotes/auth'
import { ComponentArea } from '../Component/ComponentArea'
import { ContentType } from '../Content/ContentType'
import { DockIconType } from './DockIconType'
import { Flag } from './Flag'

export type Feature = {
  name: string;
  identifier: PermissionName;
  contentType: ContentType
  area?: ComponentArea;
  layerable?: boolean;
  noMobile?: boolean;
  version: string;
  description: string;
  url: string;
  downloadUrl: string;
  marketingUrl: string;
  thumbnailUrl?: string;
  flags?: Flag[];
  noExpire?: boolean;
  dockIcon?: {
    type: DockIconType;
    backgroundColor: string;
    foregroundColor: string;
    borderColor: string;
  };
  deletionWarning?: string;
  expiresAt?: number;
};
