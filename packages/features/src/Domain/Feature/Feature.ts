import { ComponentArea } from '../Component/ComponentArea'
import { ContentType } from '../Content/ContentType'
import { PermissionName } from '../Permission/PermissionName'
import { DockIconType } from './DockIconType'
import { FeatureIdentifier } from './FeatureIdentifier'
import { Flag } from './Flag'

export type Feature = {
  name: string;
  identifier: FeatureIdentifier;
  permissionName: PermissionName;
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
