export interface UserClientApi {
  deleteAccount(): Promise<{
    error: boolean
    message?: string
  }>

  signOut(force: boolean): Promise<void>
}
