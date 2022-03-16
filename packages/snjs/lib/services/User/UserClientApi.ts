export interface UserClientInterface {
  deleteAccount(): Promise<{
    error: boolean
    message?: string
  }>

  signOut(force: boolean): Promise<void>
}
