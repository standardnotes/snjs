import { ContentType } from '@standardnotes/common'

import { ComponentArea } from '../Component/ComponentArea'
import { PermissionName } from '../Permission/PermissionName'
import { FeatureIdentifier } from './FeatureIdentifier'
import { ComponentFlag } from './Flag'

export type ThemeDockIcon = {
  type: 'svg' | 'circle',
  background_color: string,
  foreground_color: string,
  border_color: string,
  source?: string
}

export type FeatureDescription = {
  name: string;
  identifier: FeatureIdentifier;
  permission_name: PermissionName;
  content_type: ContentType;
  area?: ComponentArea;
  layerable?: boolean;
  no_mobile?: boolean;
  version: string;
  description: string;
  url: string;
  download_url: string;
  marketing_url: string;
  thumbnail_url?: string;
  flags?: ComponentFlag[];
  no_expire?: boolean;
  dock_icon?: ThemeDockIcon;
  deletion_warning?: string;
  expires_at?: number;
};
