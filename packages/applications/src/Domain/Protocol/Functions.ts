import { ProtocolVersion } from '@standardnotes/common'

export const ProtocolVersionLength = 3

export function protocolVersionFromEncryptedString(
  string: string
): ProtocolVersion | undefined {
  const version = string.substring(0, ProtocolVersionLength) as ProtocolVersion
  if (Object.values(ProtocolVersion).includes(version)) {
    return version
  }

  return undefined
}

/**
 *  -1 if a < b
 *  0 if a == b
 *  1 if a > b
 */
export function compareVersions(a: ProtocolVersion, b: ProtocolVersion): number {
  const aNum = Number(a)
  const bNum = Number(b)
  return aNum - bNum
}

export function leftVersionGreaterThanOrEqualToRight(
  a: ProtocolVersion,
  b: ProtocolVersion
): boolean {
  return compareVersions(a, b) >= 0
}

export function isVersionLessThanOrEqualTo(
  input: ProtocolVersion,
  compareTo: ProtocolVersion
): boolean {
  return compareVersions(input, compareTo) <= 0
}
