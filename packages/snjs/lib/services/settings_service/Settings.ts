import { SettingName } from '@standardnotes/settings'

export type Settings = {
  [key in SettingName]: string
}
