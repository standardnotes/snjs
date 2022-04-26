import { DeinitSource } from './../../Types/DeinitSource'
export interface UserClientInterface {
  deleteAccount(): Promise<{
    error: boolean
    message?: string
  }>

  signOut(force?: boolean, source?: DeinitSource): Promise<void>
}
