import { SNPureCrypto } from '@standardnotes/sncrypto-common'

export async function vaultToEmail(
  crypto: SNPureCrypto,
  name: string,
  userphrase: string,
): Promise<string | undefined> {
  const result = await crypto.hmac256(
    await crypto.sha256(name.trim().toLowerCase()),
    await crypto.sha256(userphrase.trim().toLowerCase()),
  )

  if (result == undefined) {
    return undefined
  }

  return result
}
