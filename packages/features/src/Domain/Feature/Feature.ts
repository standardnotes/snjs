import { ContentType } from '@standardnotes/common'
import { ComponentArea } from '../Component/ComponentArea'
import { PermissionName } from '../Permission/PermissionName'
import { FeatureIdentifier } from './FeatureIdentifier'
import { ComponentFlag } from './Flag'

export type ThemeDockIcon = {
  type: 'svg' | 'circle';
  background_color: string;
  foreground_color: string;
  border_color: string;
  source?: string;
};

export enum NoteType {
  Authentication = 'authentication',
  Code = 'code',
  Markdown = 'markdown',
  RichText = 'rich-text',
  Spreadsheet = 'spreadsheet',
  Task = 'task',
}

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
  file_type: 'txt' | 'html' | 'md' | 'json';
  flags?: ComponentFlag[];
  identifier: FeatureIdentifier;
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
