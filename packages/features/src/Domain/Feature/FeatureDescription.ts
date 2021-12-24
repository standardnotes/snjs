import { ContentType } from '@standardnotes/common';
import { RoleName } from '@standardnotes/auth';
import { ComponentArea } from '../Component/ComponentArea';
import { PermissionName } from '../Permission/PermissionName';
import { FeatureIdentifier } from './FeatureIdentifier';
import { ComponentFlag } from '../Component/ComponentFlag';
import { NoteType } from '../Component/NoteType';
import { ThemeDockIcon } from '../Component/ThemeDockIcon';

export type FeatureDescription = {
  area?: ComponentArea;
  content_type?: ContentType;
  deletion_warning?: string;
  deprecated?: boolean;
  deprecation_message?: string;
  description: string;
  dock_icon?: ThemeDockIcon;
  download_url: string;
  expires_at?: number;
  role_name?: RoleName;
  file_type: 'txt' | 'html' | 'md' | 'json';
  flags?: ComponentFlag[];
  identifier: FeatureIdentifier;
  /** The relative path of the index.html file or the main css file if theme, within the component folder itself */
  index_path?: string;
  /** Whether an editor is interchangable with another editor that has the same file_type */
  interchangeable: boolean;
  /** Some themes can be layered on top of other themes */
  layerable?: boolean;
  marketing_url: string;
  name: string;
  no_expire?: boolean;
  no_mobile?: boolean;
  note_type: NoteType;
  permission_name: PermissionName;
  thumbnail_url?: string;
  url: string;
  version: string;
};
