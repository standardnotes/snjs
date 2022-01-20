export enum ProtocolVersion {
  V001 = '001',
  V002 = '002',
  V003 = '003',
  V004 = '004',
}
export const ProtocolVersionLength = 3;

export function protocolVersionFromEncryptedString(
  string: string
): ProtocolVersion | undefined {
  const version = string.substring(0, ProtocolVersionLength) as ProtocolVersion;
  if (Object.values(ProtocolVersion).includes(version)) {
    return version;
  }
}

/**
 *  -1 if a < b
 *  0 if a == b
 *  1 if a > b
 */
export function compareVersions(a: ProtocolVersion, b: ProtocolVersion) {
  const aNum = Number(a);
  const bNum = Number(b);
  return aNum - bNum;
}

export function leftVersionGreaterThanOrEqualToRight(
  a: ProtocolVersion,
  b: ProtocolVersion
) {
  return compareVersions(a, b) >= 0;
}

export function isVersionLessThanOrEqualTo(
  input: ProtocolVersion,
  compareTo: ProtocolVersion
) {
  return compareVersions(input, compareTo) <= 0;
}
